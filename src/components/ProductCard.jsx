import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import PriceTag from './PriceTag'

export default function ProductCard({ product }) {
  const { addItem } = useCart()
  const [added, setAdded] = useState(false)

  function handleAddToCart(e) {
    e.preventDefault()
    addItem(product.id, 1)
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  return (
    <div className="group flex flex-col rounded-xl border border-slate-200 bg-white overflow-hidden hover:shadow-md hover:border-slate-300 transition">
      <Link to={`/product/${product.id}`}>
        <div className="aspect-square bg-slate-100 relative overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            decoding="async"
            width={600}
            height={600}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
          />
          {product.discountPercent > 0 && (
            <span className="absolute top-2 left-2 rounded-full bg-emerald-600 text-white text-xs font-semibold px-2 py-0.5">
              -{Math.round(product.discountPercent * 100)}%
            </span>
          )}
        </div>
        <div className="p-4 pb-0 flex flex-col gap-1">
          <span className="text-xs font-medium text-indigo-600">
            {product.category}
            {product.subcategory ? ` · ${product.subcategory}` : ''}
          </span>
          <h3 className="text-sm font-semibold text-slate-900 group-hover:text-indigo-600 transition">
            {product.name}
          </h3>
          <div className="flex items-center justify-between mt-1">
            <PriceTag
              price={product.price}
              discountedPrice={product.discountedPrice}
              discountPercent={product.discountPercent}
            />
            <span className="text-xs text-emerald-600 font-medium shrink-0">★ {product.rating}</span>
          </div>
        </div>
      </Link>

      <div className="p-4 pt-3">
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={product.stock === 0}
          className="w-full rounded-lg border border-indigo-600 text-indigo-600 text-sm font-semibold py-2 hover:bg-indigo-50 transition disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
        >
          {product.stock === 0 ? 'Out of Stock' : added ? 'Added ✓' : 'Add to Cart'}
        </button>
      </div>
    </div>
  )
}
