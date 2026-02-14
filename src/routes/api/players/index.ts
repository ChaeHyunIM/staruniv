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
      CASE p.tier WHEN 'S' THEN 0 WHEN 'A' THEN 1 WHEN 'B' THEN 2 WHEN 'C' THEN 3 ELSE 4 END,
      p.nickname
  `;

  return Response.json(players);
}
