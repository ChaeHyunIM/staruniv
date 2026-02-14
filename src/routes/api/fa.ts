import type { APIEvent } from "@solidjs/start/server";
import { sql } from "~/lib/db";

export async function GET(_event: APIEvent) {
  const players = await sql`
    SELECT * FROM players
    WHERE is_fa = true AND status = 'active'
    ORDER BY
      CASE gender WHEN 'M' THEN 0 WHEN 'F' THEN 1 END,
      CASE tier WHEN 'S' THEN 0 WHEN 'A' THEN 1 WHEN 'B' THEN 2 WHEN 'C' THEN 3 ELSE 4 END,
      nickname
  `;

  return Response.json(players);
}
