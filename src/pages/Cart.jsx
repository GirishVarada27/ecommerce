import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import PriceTag from '../components/PriceTag'

export default function Cart() {
  const { items, subtotal, savings, updateItem, removeItem } = useCart()

  if (items.length === 0) {
    return (
      <div className="text-center py-16">
        <h1 className="text-xl font-bold text-slate-900 mb-2">Your cart is empty</h1>
        <p className="text-slate-500 mb-6">Add some products to get started.</p>
        <Link
          to="/"
          className="inline-block rounded-lg bg-indigo-600 text-white font-semibold px-5 py-2.5 hover:bg-indigo-700 transition"
        >
          Browse Products
        </Link>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Your Cart</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 flex flex-col divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
          {items.map(({ product, quantity, lineTotal }) => (
            <div key={product.id} className="flex items-center gap-4 p-4">
              <Link to={`/product/${product.id}`} className="shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-slate-100">
                <img
                  src={product.image}
                  alt={product.name}
                  loading="lazy"
                  decoding="async"
                  width={64}
                  height={64}
                  className="w-full h-full object-cover"
                />
              </Link>
              <div className="flex-1 min-w-0">
                <Link
                  to={`/product/${product.id}`}
                  className="text-sm font-semibold text-slate-900 hover:text-indigo-600 transition truncate block"
                >
                  {product.name}
                </Link>
                <div className="mt-0.5">
                  <PriceTag
                    price={product.price}
                    discountedPrice={product.discountedPrice}
                    discountPercent={product.discountPercent}
                  />
                </div>
              </div>
              <select
                value={quantity}
                onChange={(e) => updateItem(product.id, Number(e.target.value))}
                className="rounded-lg border border-slate-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                {Array.from({ length: Math.min(product.stock, 10) }, (_, i) => i + 1).map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
              <span className="w-20 text-right text-sm font-semibold text-slate-900">
                ${lineTotal.toFixed(2)}
              </span>
              <button
                type="button"
                onClick={() => removeItem(product.id)}
                className="text-slate-400 hover:text-red-500 transition text-sm"
                aria-label={`Remove ${product.name}`}
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 h-fit">
          <h2 className="font-semibold text-slate-900 mb-4">Order Summary</h2>
          <div className="flex justify-between text-sm text-slate-600 mb-2">
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          {savings > 0 && (
            <div className="flex justify-between text-sm text-emerald-600 mb-2">
              <span>Discount savings</span>
              <span>-${savings.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm text-slate-600 mb-4">
            <span>Shipping</span>
            <span>Free</span>
          </div>
          <div className="flex justify-between text-base font-bold text-slate-900 border-t border-slate-100 pt-4 mb-4">
            <span>Total</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <Link
            to="/checkout"
            className="block text-center rounded-lg bg-indigo-600 text-white font-semibold py-2.5 hover:bg-indigo-700 transition"
          >
            Proceed to Checkout
          </Link>
        </div>
      </div>
    </div>
  )
}
