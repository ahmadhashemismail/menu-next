import { NextResponse } from "next/server";
import pool from "@/lib/db";

// DELETE a single category by its id
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const result = await pool.query("DELETE FROM category WHERE id = $1 RETURNING *", [id]);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Category deleted", category: result.rows[0] });
  } catch (err: any) {
    console.error(err);
    // foreign key violation — items still reference this category
    if (err.code === "23503") {
      return NextResponse.json(
        { error: "Cannot delete: some items still use this category" },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: "Failed to delete category" }, { status: 500 });
  }
}
