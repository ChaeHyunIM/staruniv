import { query } from "@solidjs/router";
import { sql } from "~/lib/db";
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

  return rows as unknown as CrewWithCount[];
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

  const crew = crewRows[0] as unknown as CrewWithCount | undefined;
  if (!crew) return null;

  const playerRows = await sql`
    SELECT * FROM players
    WHERE crew_id = ${crew.id} AND status = 'active'
    ORDER BY
      CASE tier WHEN 'S' THEN 0 WHEN 'A' THEN 1 WHEN 'B' THEN 2 WHEN 'C' THEN 3 ELSE 4 END,
      nickname
  `;

  return { ...crew, players: playerRows as unknown as Player[] };
}, "crew");
