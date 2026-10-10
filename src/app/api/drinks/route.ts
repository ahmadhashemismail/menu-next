import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  try {
    const result = await pool.query("SELECT * FROM drinks ORDER BY id");
    return NextResponse.json(result.rows);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { name, price, category_id } = await request.json();
    const result = await pool.query(
      "INSERT INTO drinks (name, price, type, category_id) VALUES ($1, $2, 'drink', $3) RETURNING *",
      [name, price ?? null, category_id]
    );
    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (err: any) {
    console.error(err);
    if (err.code === "23503") {
      return NextResponse.json({ error: "Choose a valid drink category" }, { status: 400 });
    }
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
