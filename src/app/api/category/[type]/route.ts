import { connection } from "next/server";
import pool from "@/lib/db";

// GET category by type
export async function GET(
  _request: Request,
  ctx: RouteContext<"/api/category/[type]">
) {
  await connection();
  const { type } = await ctx.params;

  if (!["food", "drink"].includes(type)) {
    return Response.json(
      { error: 'Type must be either "food" or "drink"' },
      { status: 400 }
    );
  }

  try {
    const result = await pool.query(
      "SELECT * FROM category WHERE type = $1 ORDER BY id",
      [type]
    );
    return Response.json(result.rows);
  } catch (err) {
    console.error(err);
    return Response.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}
