import type { APIEvent } from "@solidjs/start/server";
import { sql } from "~/lib/db";

export async function GET({ request }: APIEvent) {
  const url = new URL(request.url);
  const race = url.searchParams.get("race");
  const tier = url.searchParams.get("tier");
  const crew = url.searchParams.get("crew");
  const gender = url.searchParams.get("gender");
  const search = url.searchParams.get("search");

  const filters = [
    race ? sql`AND p.race = ${race}` : sql``,
    tier ? sql`AND p.tier = ${tier}` : sql``,
    crew ? sql`AND c.name = ${crew}` : sql``,
    gender ? sql`AND p.gender = ${gender}` : sql``,
    search ? sql`AND p.nickname ILIKE ${"%" + search + "%"}` : sql``,
  ];

  const players = await sql`
    SELECT p.*, c.name AS crew_name
    FROM players p
    LEFT JOIN crews c ON p.crew_id = c.id
    WHERE p.status = 'active'
    ${filters[0]}
    ${filters[1]}
    ${filters[2]}
    ${filters[3]}
    ${filters[4]}
    ORDER BY
      CASE p.tier
        WHEN 'God' THEN 0 WHEN 'King' THEN 1 WHEN 'Jack' THEN 2 WHEN 'Joker' THEN 3 WHEN 'Spade' THEN 4
        WHEN '0' THEN 5 WHEN '1' THEN 6 WHEN '2' THEN 7 WHEN '3' THEN 8 WHEN '4' THEN 9
        WHEN '5' THEN 10 WHEN '6' THEN 11 WHEN '7' THEN 12 WHEN '8' THEN 13 WHEN 'Baby' THEN 14
        ELSE 15
      END,
      p.nickname
  `;

  return Response.json(players);
}
