import pool from "@/lib/db";

// DELETE a single category by its id
export async function DELETE(
  _request: Request,
  ctx: RouteContext<"/api/category/id/[id]">
) {
  const { id } = await ctx.params;

  try {
    const result = await pool.query(
      "DELETE FROM category WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return Response.json({ error: "Category not found" }, { status: 404 });
    }

    return Response.json({
      message: "Category deleted",
      category: result.rows[0],
    });
  } catch (err) {
    console.error(err);
    // foreign key violation — items still reference this category
    if ((err as { code?: string }).code === "23503") {
      return Response.json(
        { error: "Cannot delete: some items still use this category" },
        { status: 409 }
      );
    }
    return Response.json(
      { error: "Failed to delete category" },
      { status: 500 }
    );
  }
}
