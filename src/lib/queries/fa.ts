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
      CASE tier
        WHEN 'God' THEN 0 WHEN 'King' THEN 1 WHEN 'Jack' THEN 2 WHEN 'Joker' THEN 3 WHEN 'Spade' THEN 4
        WHEN '0' THEN 5 WHEN '1' THEN 6 WHEN '2' THEN 7 WHEN '3' THEN 8 WHEN '4' THEN 9
        WHEN '5' THEN 10 WHEN '6' THEN 11 WHEN '7' THEN 12 WHEN '8' THEN 13 WHEN 'Baby' THEN 14
        ELSE 15
      END,
      nickname
  `;

  return rows as unknown as Player[];
}, "faPlayers");
