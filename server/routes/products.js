import { Router } from 'express'
import { pool } from '../db.js'
import { getDiscountPercent, getDiscountedPrice } from '../utils/pricing.js'

const router = Router()

function serializeProduct(row) {
  const price = Number(row.price)
  const discountPercent = getDiscountPercent(row.category)

  return {
    id: row.id,
    name: row.name,
    category: row.category,
    subcategory: row.subcategory,
    price,
    discountPercent,
    discountedPrice: getDiscountedPrice(price, row.category),
    image: row.image,
    description: row.description,
    rating: Number(row.rating),
    stock: row.stock,
  }
}

router.get('/', async (req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT * FROM products ORDER BY name')
    res.json(rows.map(serializeProduct))
  } catch (err) {
    next(err)
  }
})

router.get('/:id', async (req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT * FROM products WHERE id = $1', [req.params.id])
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' })
    }
    res.json(serializeProduct(rows[0]))
  } catch (err) {
    next(err)
  }
})

export default router
