import { NextResponse } from "next/server";
import pool from "@/lib/db";

// GET category by type
export async function GET(
  request: Request,
  { params }: { params: Promise<{ type: string }> }
) {
  const { type } = await params;

  if (!["food", "drink"].includes(type)) {
    return NextResponse.json({ error: 'Type must be either "food" or "drink"' }, { status: 400 });
  }

  try {
    const result = await pool.query(
      "SELECT * FROM category WHERE type = $1 ORDER BY id",
      [type]
    );
    return NextResponse.json(result.rows);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}
