import { query } from "@solidjs/router";
import { sql } from "~/lib/db";
import type { TournamentWithCrew } from "~/lib/types";

export const getTournaments = query(async () => {
  "use server";
  const rows = await sql`
    SELECT t.id, t.name, t.year, t.winner_crew_id, t.status,
           c.name AS winner_crew_name
    FROM tournaments t
    LEFT JOIN crews c ON t.winner_crew_id = c.id
    ORDER BY t.year DESC, t.id DESC
  `;

  return rows as unknown as TournamentWithCrew[];
}, "tournaments");
