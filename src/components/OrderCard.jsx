import { Link } from 'react-router-dom'

export default function OrderCard({ order }) {
  const placedAt = new Date(order.createdAt).toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-xs text-slate-500">Order #{order.id.slice(0, 8).toUpperCase()}</p>
          <p className="text-sm text-slate-500">{placedAt}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold px-2.5 py-1 capitalize">
            {order.paymentStatus || order.status}
          </span>
          <Link
            to={`/order-confirmation/${order.id}`}
            className="text-sm text-indigo-600 font-medium hover:underline"
          >
            View Receipt
          </Link>
        </div>
      </div>

      <ul className="mt-4 divide-y divide-slate-100">
        {order.items.map((item) => (
          <li key={item.productId} className="py-2 flex items-center justify-between text-sm">
            <span className="text-slate-700">
              {item.name} <span className="text-slate-400">× {item.quantity}</span>
            </span>
            <span className="font-medium text-slate-900">${(item.price * item.quantity).toFixed(2)}</span>
          </li>
        ))}
      </ul>

      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
        <span className="text-sm text-slate-500">
          Shipping to {order.shipping.city}, {order.shipping.zip}
        </span>
        <span className="text-base font-bold text-slate-900">${order.total.toFixed(2)}</span>
      </div>
    </div>
  )
}
