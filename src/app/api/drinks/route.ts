import { connection } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  await connection();
  try {
    const result = await pool.query("SELECT * FROM drinks ORDER BY id");
    return Response.json(result.rows);
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { name, price, category_id } = await request.json();
    const result = await pool.query(
      "INSERT INTO drinks (name, price, type, category_id) VALUES ($1, $2, 'drink', $3) RETURNING *",
      [name, price ?? null, category_id]
    );
    return Response.json(result.rows[0], { status: 201 });
  } catch (err) {
    console.error(err);
    if ((err as { code?: string }).code === "23503") {
      return Response.json(
        { error: "Choose a valid drink category" },
        { status: 400 }
      );
    }
    return Response.json({ error: "Something went wrong" }, { status: 500 });
  }
}
