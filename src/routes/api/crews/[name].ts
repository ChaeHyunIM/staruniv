import type { APIEvent } from "@solidjs/start/server";
import { sql } from "~/lib/db";

export async function GET({ params }: APIEvent) {
  const { name } = params;

  const [crew] = await sql`
    SELECT c.*, COUNT(p.id)::int AS member_count
    FROM crews c
    LEFT JOIN players p ON p.crew_id = c.id AND p.status = 'active'
    WHERE c.name = ${name}
    GROUP BY c.id
  `;

  if (!crew) {
    return new Response("Crew not found", { status: 404 });
  }

  const players = await sql`
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

  return Response.json({ ...crew, players });
}
