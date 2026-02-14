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
      CASE tier WHEN 'S' THEN 0 WHEN 'A' THEN 1 WHEN 'B' THEN 2 WHEN 'C' THEN 3 ELSE 4 END,
      nickname
  `;

  return Response.json({ ...crew, players });
}
