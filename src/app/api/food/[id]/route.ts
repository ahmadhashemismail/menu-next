import pool from "@/lib/db";

export async function PUT(
  request: Request,
  ctx: RouteContext<"/api/food/[id]">
) {
  const { id } = await ctx.params;
  try {
    const { name, price, category_id } = await request.json();
    const result = await pool.query(
      "UPDATE food SET name = $1, price = $2, category_id = $3 WHERE id = $4 RETURNING *",
      [name, price ?? null, category_id, id]
    );
    if (result.rows.length === 0) {
      return Response.json({ error: "Item not found" }, { status: 404 });
    }
    return Response.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    if ((err as { code?: string }).code === "23503") {
      return Response.json(
        { error: "Choose a valid food category" },
        { status: 400 }
      );
    }
    return Response.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  ctx: RouteContext<"/api/food/[id]">
) {
  const { id } = await ctx.params;
  try {
    const result = await pool.query(
      "DELETE FROM food WHERE id = $1 RETURNING *",
      [id]
    );
    if (result.rows.length === 0) {
      return Response.json({ error: "Item not found" }, { status: 404 });
    }
    return Response.json({ message: "Deleted successfully" });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Something went wrong" }, { status: 500 });
  }
}
