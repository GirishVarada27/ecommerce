import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { fetchProduct } from '../api/client'
import { useCart } from '../context/CartContext'
import PriceTag from '../components/PriceTag'

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addItem } = useCart()

  const [product, setProduct] = useState(null)
  const [status, setStatus] = useState('loading')
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)

  useEffect(() => {
    fetchProduct(id)
      .then((data) => {
        setProduct(data)
        setStatus('ready')
      })
      .catch(() => setStatus('error'))
  }, [id])

  if (status === 'loading') {
    return <p className="text-slate-500 text-center py-16">Loading product...</p>
  }

  if (status === 'error' || !product) {
    return (
      <div className="text-center py-16">
        <p className="text-slate-500 mb-4">Product not found.</p>
        <Link to="/" className="text-indigo-600 font-medium hover:underline">
          Back to shop
        </Link>
      </div>
    )
  }

  function handleAddToCart() {
    addItem(product.id, quantity)
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  function handleBuyNow() {
    addItem(product.id, quantity)
    navigate('/cart')
  }

  return (
    <div>
      <Link to="/" className="text-sm text-indigo-600 hover:underline">
        ← Back to shop
      </Link>

      <div className="mt-4 grid sm:grid-cols-2 gap-8">
        <div className="rounded-xl aspect-square bg-slate-100 relative overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            decoding="async"
            width={600}
            height={600}
            className="w-full h-full object-cover"
          />
          {product.discountPercent > 0 && (
            <span className="absolute top-3 left-3 rounded-full bg-emerald-600 text-white text-sm font-semibold px-3 py-1">
              -{Math.round(product.discountPercent * 100)}% OFF
            </span>
          )}
        </div>

        <div>
          <span className="text-sm font-medium text-indigo-600">
            {product.category}
            {product.subcategory ? ` · ${product.subcategory}` : ''}
          </span>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">{product.name}</h1>
          <p className="text-emerald-600 text-sm font-medium mt-1">★ {product.rating} rating</p>
          <div className="mt-4">
            <PriceTag
              price={product.price}
              discountedPrice={product.discountedPrice}
              discountPercent={product.discountPercent}
              large
            />
          </div>
          <p className="text-slate-600 mt-4 leading-relaxed">{product.description}</p>
          <p className="text-sm text-slate-500 mt-4">
            {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
          </p>

          <div className="flex items-center gap-3 mt-6">
            <label htmlFor="quantity" className="text-sm font-medium text-slate-700">
              Quantity
            </label>
            <select
              id="quantity"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              {Array.from({ length: Math.min(product.stock, 10) }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="flex-1 rounded-lg border border-indigo-600 text-indigo-600 font-semibold py-2.5 hover:bg-indigo-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {added ? 'Added ✓' : 'Add to Cart'}
            </button>
            <button
              type="button"
              onClick={handleBuyNow}
              disabled={product.stock === 0}
              className="flex-1 rounded-lg bg-indigo-600 text-white font-semibold py-2.5 hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Buy Now
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
