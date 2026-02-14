import { query } from "@solidjs/router";
import { sql } from "~/lib/db";
import type { Player } from "~/lib/types";

export const getFAPlayers = query(async () => {
  "use server";
  const rows = await sql`
    SELECT * FROM players
    WHERE is_fa = true AND status = 'active'
    ORDER BY
      CASE gender WHEN 'M' THEN 0 WHEN 'F' THEN 1 END,
      CASE tier WHEN 'S' THEN 0 WHEN 'A' THEN 1 WHEN 'B' THEN 2 WHEN 'C' THEN 3 ELSE 4 END,
      nickname
  `;

  return rows as unknown as Player[];
}, "faPlayers");
