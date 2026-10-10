import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const { name, price, category_id } = await request.json();
    const result = await pool.query(
      "UPDATE food SET name = $1, price = $2, category_id = $3 WHERE id = $4 RETURNING *",
      [name, price ?? null, category_id, id]
    );
    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }
    return NextResponse.json(result.rows[0]);
  } catch (err: any) {
    console.error(err);
    if (err.code === "23503") {
      return NextResponse.json({ error: "Choose a valid food category" }, { status: 400 });
    }
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const result = await pool.query("DELETE FROM food WHERE id = $1 RETURNING *", [id]);
    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }
    return NextResponse.json({ message: "Deleted successfully" });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
