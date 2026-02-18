import { query } from "@solidjs/router";
import { sql } from "bun";
import type { PlayerWithCrew } from "~/lib/types";

export const getAllPlayers = query(async () => {
  "use server";
  const rows = await sql`
    SELECT p.id, p.nickname, p.race, p.tier, p.gender, p.crew_id, p.is_fa, p.tag, p.status,
           p.soop_id, p.profile_image, p.created_at, p.updated_at, c.name AS crew_name
    FROM players p
    LEFT JOIN crews c ON p.crew_id = c.id
    WHERE p.status = 'active'
    ORDER BY
      CASE p.tier
        WHEN 'God' THEN 0 WHEN 'King' THEN 1 WHEN 'Jack' THEN 2 WHEN 'Joker' THEN 3 WHEN 'Spade' THEN 4
        WHEN '0' THEN 5 WHEN '1' THEN 6 WHEN '2' THEN 7 WHEN '3' THEN 8 WHEN '4' THEN 9
        WHEN '5' THEN 10 WHEN '6' THEN 11 WHEN '7' THEN 12 WHEN '8' THEN 13 WHEN 'Baby' THEN 14
        ELSE 15
      END,
      p.nickname
  `;

  return rows as PlayerWithCrew[];
}, "allPlayers");

export const getPlayer = query(async (nickname: string) => {
  "use server";
  const rows = await sql`
    SELECT p.id, p.nickname, p.race, p.tier, p.gender, p.crew_id, p.is_fa, p.tag, p.status,
           p.soop_id, p.profile_image, p.created_at, p.updated_at, c.name AS crew_name
    FROM players p
    LEFT JOIN crews c ON p.crew_id = c.id
    WHERE p.nickname = ${nickname}
  `;

  return (rows[0] as PlayerWithCrew) ?? null;
}, "player");
