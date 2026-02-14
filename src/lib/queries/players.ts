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
    SELECT p.id, p.nickname, p.race, p.tier, p.gender, p.crew_id, p.is_fa, p.status,
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
      CASE p.tier WHEN 'S' THEN 0 WHEN 'A' THEN 1 WHEN 'B' THEN 2 WHEN 'C' THEN 3 ELSE 4 END,
      p.nickname
  `;

  return rows as unknown as PlayerWithCrew[];
}, "players");

export const getPlayer = query(async (nickname: string) => {
  "use server";
  const rows = await sql`
    SELECT p.id, p.nickname, p.race, p.tier, p.gender, p.crew_id, p.is_fa, p.status,
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
    SELECT p.id, p.nickname, p.race, p.tier, p.gender, p.crew_id, p.is_fa, p.status,
           p.created_at, p.updated_at, c.name AS crew_name
    FROM players p
    LEFT JOIN crews c ON p.crew_id = c.id
    WHERE p.status = 'active' AND p.tier IS NOT NULL
    ORDER BY
      CASE p.tier WHEN 'S' THEN 0 WHEN 'A' THEN 1 WHEN 'B' THEN 2 WHEN 'C' THEN 3 ELSE 4 END,
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
