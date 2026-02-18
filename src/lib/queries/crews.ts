import { query } from "@solidjs/router";
import { sql } from "bun";
import type { CrewWithCount, Player } from "~/lib/types";

export const getCrews = query(async () => {
  "use server";
  const rows = await sql`
    SELECT c.id, c.name, c.is_active, c.created_at, c.updated_at,
           COUNT(p.id)::int AS member_count
    FROM crews c
    LEFT JOIN players p ON p.crew_id = c.id AND p.status = 'active'
    WHERE c.is_active = true
    GROUP BY c.id
    ORDER BY c.name
  `;

  return rows as CrewWithCount[];
}, "crews");

export const getCrew = query(async (name: string) => {
  "use server";
  const crewRows = await sql`
    SELECT c.id, c.name, c.is_active, c.created_at, c.updated_at,
           COUNT(p.id)::int AS member_count
    FROM crews c
    LEFT JOIN players p ON p.crew_id = c.id AND p.status = 'active'
    WHERE c.name = ${name}
    GROUP BY c.id
  `;

  const crew = crewRows[0] as CrewWithCount | undefined;
  if (!crew) return null;

  const playerRows = await sql`
    SELECT * FROM players
    WHERE crew_id = ${crew.id} AND status = 'active'
    ORDER BY
      CASE tier
        WHEN 'God' THEN 0 WHEN 'King' THEN 1 WHEN 'Jack' THEN 2 WHEN 'Joker' THEN 3 WHEN 'Spade' THEN 4
        WHEN '0' THEN 5 WHEN '1' THEN 6 WHEN '2' THEN 7 WHEN '3' THEN 8 WHEN '4' THEN 9
        WHEN '5' THEN 10 WHEN '6' THEN 11 WHEN '7' THEN 12 WHEN '8' THEN 13 WHEN 'Baby' THEN 14
        ELSE 15
      END,
      nickname
  `;

  return { ...crew, players: playerRows as Player[] };
}, "crew");
