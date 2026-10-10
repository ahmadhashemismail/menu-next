import express from 'express'
import cors from 'cors'
import pool from './db.js'

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors())
app.use(express.json())

// ---------- FOOD ----------
app.get('/api/food', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM food ORDER BY id')
    res.json(result.rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Something went wrong' })
  }
})

app.post('/api/food', async (req, res) => {
  const { name, price, category_id } = req.body
  try {
    const result = await pool.query(
      "INSERT INTO food (name, price, type, category_id) VALUES ($1, $2, 'food', $3) RETURNING *",
      [name, price ?? null, category_id]
    )
    res.status(201).json(result.rows[0])
  } catch (err) {
    console.error(err)
    // foreign key violation — category does not exist or is not a food category
    if (err.code === '23503') {
      return res.status(400).json({ error: 'Choose a valid food category' })
    }
    res.status(500).json({ error: 'Something went wrong' })
  }
})

app.put('/api/food/:id', async (req, res) => {
  const { id } = req.params
  const { name, price, category_id } = req.body
  try {
    const result = await pool.query(
      'UPDATE food SET name = $1, price = $2, category_id = $3 WHERE id = $4 RETURNING *',
      [name, price ?? null, category_id, id]
    )
    if (result.rows.length === 0) return res.status(404).json({ error: 'Item not found' })
    res.json(result.rows[0])
  } catch (err) {
    console.error(err)
    if (err.code === '23503') {
      return res.status(400).json({ error: 'Choose a valid food category' })
    }
    res.status(500).json({ error: 'Something went wrong' })
  }
})

app.delete('/api/food/:id', async (req, res) => {
  const { id } = req.params
  try {
    const result = await pool.query('DELETE FROM food WHERE id = $1 RETURNING *', [id])
    if (result.rows.length === 0) return res.status(404).json({ error: 'Item not found' })
    res.json({ message: 'Deleted successfully' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Something went wrong' })
  }
})

// ---------- DRINKS ----------
app.get('/api/drinks', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM drinks ORDER BY id')
    res.json(result.rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Something went wrong' })
  }
})

app.post('/api/drinks', async (req, res) => {
  const { name, price, category_id } = req.body
  try {
    const result = await pool.query(
      "INSERT INTO drinks (name, price, type, category_id) VALUES ($1, $2, 'drink', $3) RETURNING *",
      [name, price ?? null, category_id]
    )
    res.status(201).json(result.rows[0])
  } catch (err) {
    console.error(err)
    if (err.code === '23503') {
      return res.status(400).json({ error: 'Choose a valid drink category' })
    }
    res.status(500).json({ error: 'Something went wrong' })
  }
})

app.put('/api/drinks/:id', async (req, res) => {
  const { id } = req.params
  const { name, price, category_id } = req.body
  try {
    const result = await pool.query(
      'UPDATE drinks SET name = $1, price = $2, category_id = $3 WHERE id = $4 RETURNING *',
      [name, price ?? null, category_id, id]
    )
    if (result.rows.length === 0) return res.status(404).json({ error: 'Item not found' })
    res.json(result.rows[0])
  } catch (err) {
    console.error(err)
    if (err.code === '23503') {
      return res.status(400).json({ error: 'Choose a valid drink category' })
    }
    res.status(500).json({ error: 'Something went wrong' })
  }
})

app.delete('/api/drinks/:id', async (req, res) => {
  const { id } = req.params
  try {
    const result = await pool.query('DELETE FROM drinks WHERE id = $1 RETURNING *', [id])
    if (result.rows.length === 0) return res.status(404).json({ error: 'Item not found' })
    res.json({ message: 'Deleted successfully' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Something went wrong' })
  }
})

// ---------- CATEGORY ----------

// GET category by type
app.get('/api/category/:type', async (req, res) => {
  const { type } = req.params

  if (!['food', 'drink'].includes(type)) {
    return res.status(400).json({ error: 'Type must be either "food" or "drink"' })
  }

  try {
    const result = await pool.query(
      'SELECT * FROM category WHERE type = $1 ORDER BY id',
      [type]
    )
    res.json(result.rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch categories' })
  }
})

// POST add a new category
app.post('/api/category', async (req, res) => {
  const { name, type } = req.body

  if (!name || !type) {
    return res.status(400).json({ error: 'name and type are required' })
  }
  if (!['food', 'drink'].includes(type)) {
    return res.status(400).json({ error: 'Type must be either "food" or "drink"' })
  }

  try {
    const result = await pool.query(
      'INSERT INTO category (name, type) VALUES ($1, $2) RETURNING *',
      [name, type]
    )
    res.status(201).json(result.rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to add category' })
  }
})

// DELETE a single category by its id
// (kept at a distinct path so it doesn't collide with the /:type route above)
app.delete('/api/category/id/:id', async (req, res) => {
  const { id } = req.params

  try {
    const result = await pool.query(
      'DELETE FROM category WHERE id = $1 RETURNING *',
      [id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Category not found' })
    }

    res.json({ message: 'Category deleted', category: result.rows[0] })
  } catch (err) {
    console.error(err)
    // foreign key violation — items still reference this category
    if (err.code === '23503') {
      return res.status(409).json({
        error: 'Cannot delete: some items still use this category',
      })
    }
    res.status(500).json({ error: 'Failed to delete category' })
  }
})

app.listen(PORT, () => console.log(`Server running on port ${PORT}`))