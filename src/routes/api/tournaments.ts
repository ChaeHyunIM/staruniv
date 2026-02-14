import type { APIEvent } from "@solidjs/start/server";
import { sql } from "~/lib/db";

export async function GET(_event: APIEvent) {
  const tournaments = await sql`
    SELECT t.*, c.name AS winner_crew_name
    FROM tournaments t
    LEFT JOIN crews c ON t.winner_crew_id = c.id
    ORDER BY t.year DESC, t.id DESC
  `;

  return Response.json(tournaments);
}
