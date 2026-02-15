import { query } from "@solidjs/router";
import { sql } from "~/lib/db";
import type { PlayerWithCrew } from "~/lib/types";

interface PlayerFilters {
  race?: string;
  tier?: string;
  crew?: string;
  gender?: string;
  search?: string;
}

export const getPlayers = query(async (filters: PlayerFilters = {}) => {
  "use server";
  const { race, tier, crew, gender, search } = filters;

  const rows = await sql`
    SELECT p.id, p.nickname, p.race, p.tier, p.gender, p.crew_id, p.is_fa, p.tag, p.status,
           p.created_at, p.updated_at, c.name AS crew_name
    FROM players p
    LEFT JOIN crews c ON p.crew_id = c.id
    WHERE p.status = 'active'
    ${race ? sql`AND p.race = ${race}` : sql``}
    ${tier ? sql`AND p.tier = ${tier}` : sql``}
    ${crew ? sql`AND c.name = ${crew}` : sql``}
    ${gender ? sql`AND p.gender = ${gender}` : sql``}
    ${search ? sql`AND p.nickname ILIKE ${"%" + search + "%"}` : sql``}
    ORDER BY
      CASE p.tier
        WHEN 'God' THEN 0 WHEN 'King' THEN 1 WHEN 'Jack' THEN 2 WHEN 'Joker' THEN 3 WHEN 'Spade' THEN 4
        WHEN '0' THEN 5 WHEN '1' THEN 6 WHEN '2' THEN 7 WHEN '3' THEN 8 WHEN '4' THEN 9
        WHEN '5' THEN 10 WHEN '6' THEN 11 WHEN '7' THEN 12 WHEN '8' THEN 13 WHEN 'Baby' THEN 14
        ELSE 15
      END,
      p.nickname
  `;

  return rows as unknown as PlayerWithCrew[];
}, "players");

export const getPlayer = query(async (nickname: string) => {
  "use server";
  const rows = await sql`
    SELECT p.id, p.nickname, p.race, p.tier, p.gender, p.crew_id, p.is_fa, p.tag, p.status,
           p.created_at, p.updated_at, c.name AS crew_name
    FROM players p
    LEFT JOIN crews c ON p.crew_id = c.id
    WHERE p.nickname = ${nickname}
  `;

  return (rows[0] as unknown as PlayerWithCrew) ?? null;
}, "player");

export const getPlayersByTier = query(async () => {
  "use server";
  const rows = await sql`
    SELECT p.id, p.nickname, p.race, p.tier, p.gender, p.crew_id, p.is_fa, p.tag, p.status,
           p.created_at, p.updated_at, c.name AS crew_name
    FROM players p
    LEFT JOIN crews c ON p.crew_id = c.id
    WHERE p.status = 'active' AND p.tier IS NOT NULL
    ORDER BY
      CASE p.tier
        WHEN 'God' THEN 0 WHEN 'King' THEN 1 WHEN 'Jack' THEN 2 WHEN 'Joker' THEN 3 WHEN 'Spade' THEN 4
        WHEN '0' THEN 5 WHEN '1' THEN 6 WHEN '2' THEN 7 WHEN '3' THEN 8 WHEN '4' THEN 9
        WHEN '5' THEN 10 WHEN '6' THEN 11 WHEN '7' THEN 12 WHEN '8' THEN 13 WHEN 'Baby' THEN 14
        ELSE 15
      END,
      p.nickname
  `;

  const players = rows as unknown as PlayerWithCrew[];
  const tiers: Record<string, PlayerWithCrew[]> = {};

  for (const p of players) {
    const tier = p.tier ?? "Unranked";
    if (!tiers[tier]) tiers[tier] = [];
    tiers[tier].push(p);
  }

  return tiers;
}, "playersByTier");
