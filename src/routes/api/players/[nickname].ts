import type { APIEvent } from "@solidjs/start/server";
import { sql } from "~/lib/db";

export async function GET({ params }: APIEvent) {
  const { nickname } = params;

  const [player] = await sql`
    SELECT p.*, c.name AS crew_name
    FROM players p
    LEFT JOIN crews c ON p.crew_id = c.id
    WHERE p.nickname = ${nickname}
  `;

  if (!player) {
    return new Response("Player not found", { status: 404 });
  }

  return Response.json(player);
}
