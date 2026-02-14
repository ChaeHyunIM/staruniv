import type { APIEvent } from "@solidjs/start/server";
import { sql } from "~/lib/db";

export async function GET(_event: APIEvent) {
  const crews = await sql`
    SELECT c.*, COUNT(p.id)::int AS member_count
    FROM crews c
    LEFT JOIN players p ON p.crew_id = c.id AND p.status = 'active'
    WHERE c.is_active = true
    GROUP BY c.id
    ORDER BY c.name
  `;

  return Response.json(crews);
}
