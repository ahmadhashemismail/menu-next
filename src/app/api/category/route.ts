import pool from "@/lib/db";

// POST add a new category
export async function POST(request: Request) {
  try {
    const { name, type } = await request.json();

    if (!name || !type) {
      return Response.json(
        { error: "name and type are required" },
        { status: 400 }
      );
    }
    if (!["food", "drink"].includes(type)) {
      return Response.json(
        { error: 'Type must be either "food" or "drink"' },
        { status: 400 }
      );
    }

    const result = await pool.query(
      "INSERT INTO category (name, type) VALUES ($1, $2) RETURNING *",
      [name, type]
    );
    return Response.json(result.rows[0], { status: 201 });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Failed to add category" }, { status: 500 });
  }
}
