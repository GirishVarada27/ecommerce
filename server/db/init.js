import { pool } from '../db.js'
import { auth } from '../auth.js'
import { seedProducts } from './seed-data.js'
import { getMigrations } from 'better-auth/db/migration'

export async function initDb() {
  const { runMigrations } = await getMigrations(auth.options)
  await runMigrations()

  await pool.query(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      subcategory TEXT,
      price NUMERIC(10,2) NOT NULL,
      image TEXT NOT NULL,
      description TEXT NOT NULL,
      rating NUMERIC(2,1) NOT NULL,
      stock INTEGER NOT NULL
    )
  `)

  await pool.query(`
    ALTER TABLE products
    ADD COLUMN IF NOT EXISTS subcategory TEXT,
    ADD COLUMN IF NOT EXISTS image TEXT
  `)

  await pool.query(`
    ALTER TABLE products
    DROP COLUMN IF EXISTS emoji,
    DROP COLUMN IF EXISTS color
  `)

  await pool.query(`
    CREATE TABLE IF NOT EXISTS orders (
      id UUID PRIMARY KEY,
      items JSONB NOT NULL,
      total NUMERIC(10,2) NOT NULL,
      shipping JSONB NOT NULL,
      status TEXT NOT NULL DEFAULT 'placed',
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `)

  await pool.query(`
    ALTER TABLE orders
    ADD COLUMN IF NOT EXISTS user_id TEXT REFERENCES "user"(id) ON DELETE CASCADE
  `)

  await pool.query(`
    ALTER TABLE orders
    ADD COLUMN IF NOT EXISTS customer_name TEXT,
    ADD COLUMN IF NOT EXISTS customer_email TEXT,
    ADD COLUMN IF NOT EXISTS payment_status TEXT NOT NULL DEFAULT 'paid',
    ADD COLUMN IF NOT EXISTS payment_method TEXT
  `)

  // Catalog fields (name, category, price, image, etc.) are always synced from
  // seed-data.js in a single batched upsert. `stock` is intentionally excluded
  // from the update so real orders placed against a product don't get reset.
  const columns = ['id', 'name', 'category', 'subcategory', 'price', 'image', 'description', 'rating', 'stock']
  const valuesSql = seedProducts
    .map((_, i) => {
      const base = i * columns.length
      return `(${columns.map((_, j) => `$${base + j + 1}`).join(', ')})`
    })
    .join(', ')
  const params = seedProducts.flatMap((p) => [
    p.id,
    p.name,
    p.category,
    p.subcategory,
    p.price,
    p.image,
    p.description,
    p.rating,
    p.stock,
  ])

  const { rows } = await pool.query(
    `INSERT INTO products (${columns.join(', ')})
     VALUES ${valuesSql}
     ON CONFLICT (id) DO UPDATE SET
       name = EXCLUDED.name,
       category = EXCLUDED.category,
       subcategory = EXCLUDED.subcategory,
       price = EXCLUDED.price,
       image = EXCLUDED.image,
       description = EXCLUDED.description,
       rating = EXCLUDED.rating
     RETURNING (xmax = 0) AS inserted`,
    params
  )

  const newCount = rows.filter((r) => r.inserted).length
  const updatedCount = rows.length - newCount

  if (newCount > 0) {
    console.log(`Seeded ${newCount} new product(s)`)
  }
  if (updatedCount > 0) {
    console.log(`Synced catalog fields for ${updatedCount} existing product(s)`)
  }
}
