import { Router } from 'express'
import { randomUUID } from 'node:crypto'
import { pool } from '../db.js'
import { requireAuth } from '../middleware/require-auth.js'
import { getDiscountPercent, getDiscountedPrice } from '../utils/pricing.js'

const router = Router()

function serializeOrder(row) {
  return {
    id: row.id,
    items: row.items,
    total: Number(row.total),
    shipping: row.shipping,
    customerName: row.customer_name,
    customerEmail: row.customer_email,
    paymentStatus: row.payment_status,
    paymentMethod: row.payment_method,
    status: row.status,
    createdAt: row.created_at,
  }
}

// Simulates a card payment: validates format, declines expired cards,
// and otherwise "charges" the dummy card successfully. No real payment
// processor is involved and no full card number is ever stored.
function simulatePayment(payment) {
  const cardNumber = (payment?.cardNumber || '').replace(/\s+/g, '')
  const expiry = payment?.expiry || ''
  const cvv = payment?.cvv || ''
  const cardholderName = payment?.cardholderName?.trim() || ''

  if (!cardholderName) {
    return { success: false, error: 'Cardholder name is required.' }
  }
  if (!/^\d{13,19}$/.test(cardNumber)) {
    return { success: false, error: 'Enter a valid card number.' }
  }
  const expiryMatch = /^(\d{2})\/(\d{2})$/.exec(expiry)
  if (!expiryMatch) {
    return { success: false, error: 'Enter expiry as MM/YY.' }
  }
  if (!/^\d{3,4}$/.test(cvv)) {
    return { success: false, error: 'Enter a valid CVV.' }
  }

  const [, monthStr, yearStr] = expiryMatch
  const month = Number(monthStr)
  if (month < 1 || month > 12) {
    return { success: false, error: 'Enter a valid expiry month.' }
  }
  const expiryDate = new Date(2000 + Number(yearStr), month, 1)
  if (expiryDate <= new Date()) {
    return { success: false, error: 'Card has expired. Payment declined.' }
  }

  return {
    success: true,
    paymentMethod: `Card ending in ${cardNumber.slice(-4)}`,
  }
}

router.get('/mine', requireAuth, async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    )
    res.json(rows.map(serializeOrder))
  } catch (err) {
    next(err)
  }
})

router.get('/:id', requireAuth, async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM orders WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    )
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' })
    }
    res.json(serializeOrder(rows[0]))
  } catch (err) {
    next(err)
  }
})

router.post('/', requireAuth, async (req, res, next) => {
  const { items, shipping, payment } = req.body

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Order must include at least one item' })
  }
  if (!shipping?.name?.trim() || !shipping?.address?.trim() || !shipping?.city?.trim() || !shipping?.zip?.trim() || !shipping?.phone?.trim()) {
    return res.status(400).json({ error: 'Missing shipping details' })
  }

  const paymentResult = simulatePayment(payment)
  if (!paymentResult.success) {
    return res.status(402).json({ error: paymentResult.error })
  }

  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    const orderItems = []
    let total = 0

    for (const { productId, quantity } of items) {
      if (!productId || !Number.isInteger(quantity) || quantity <= 0) {
        throw Object.assign(new Error('Invalid order item'), { status: 400 })
      }

      const { rows } = await client.query('SELECT * FROM products WHERE id = $1 FOR UPDATE', [productId])
      const product = rows[0]

      if (!product) {
        throw Object.assign(new Error(`Product ${productId} not found`), { status: 400 })
      }
      if (product.stock < quantity) {
        throw Object.assign(new Error(`Not enough stock for "${product.name}" (only ${product.stock} left)`), { status: 409 })
      }

      await client.query('UPDATE products SET stock = stock - $1 WHERE id = $2', [quantity, productId])

      const originalPrice = Number(product.price)
      const discountPercent = getDiscountPercent(product.category)
      const price = getDiscountedPrice(originalPrice, product.category)

      orderItems.push({
        productId: product.id,
        name: product.name,
        price,
        originalPrice,
        discountPercent,
        quantity,
      })
      total += price * quantity
    }

    const { rows } = await client.query(
      `INSERT INTO orders (id, user_id, items, total, shipping, customer_name, customer_email, payment_status, payment_method)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'paid', $8)
       RETURNING *`,
      [
        randomUUID(),
        req.user.id,
        JSON.stringify(orderItems),
        total,
        JSON.stringify(shipping),
        req.user.name,
        req.user.email,
        paymentResult.paymentMethod,
      ]
    )

    await client.query('COMMIT')
    res.status(201).json(serializeOrder(rows[0]))
  } catch (err) {
    await client.query('ROLLBACK')
    if (err.status) {
      return res.status(err.status).json({ error: err.message })
    }
    next(err)
  } finally {
    client.release()
  }
})

export default router
