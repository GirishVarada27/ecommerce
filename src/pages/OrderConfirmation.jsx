import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { fetchOrder } from '../api/client'

function formatDate(isoString) {
  return new Date(isoString).toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

export default function OrderConfirmation() {
  const { orderId } = useParams()
  const [order, setOrder] = useState(null)
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    fetchOrder(orderId)
      .then((data) => {
        setOrder(data)
        setStatus('ready')
      })
      .catch(() => setStatus('error'))
  }, [orderId])

  if (status === 'loading') {
    return <p className="text-slate-500 text-center py-16">Loading order...</p>
  }

  if (status === 'error' || !order) {
    return (
      <div className="text-center py-16">
        <p className="text-slate-500 mb-4">We couldn't find that order.</p>
        <Link to="/" className="text-indigo-600 font-medium hover:underline">
          Back to shop
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="text-center mb-6 print:hidden">
        <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-2xl mx-auto mb-4">
          ✓
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Order placed!</h1>
        <p className="text-slate-500 mt-2">
          Thanks, {order.shipping.name.split(' ')[0]}. Your payment was successful and your order is confirmed.
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex items-start justify-between flex-wrap gap-3 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Receipt</h2>
            <p className="text-sm text-slate-500">Order #{order.id.slice(0, 8).toUpperCase()}</p>
          </div>
          <div className="text-right">
            <span className="inline-flex items-center rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold px-2.5 py-1 capitalize">
              {order.paymentStatus}
            </span>
            <p className="text-sm text-slate-500 mt-1">{formatDate(order.createdAt)}</p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-6 py-4 border-b border-slate-100">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase mb-1">Customer</p>
            <p className="text-sm text-slate-900 font-medium">{order.customerName || order.shipping.name}</p>
            {order.customerEmail && <p className="text-sm text-slate-600">{order.customerEmail}</p>}
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase mb-1">Ship to</p>
            <p className="text-sm text-slate-600">{order.shipping.address}</p>
            <p className="text-sm text-slate-600">
              {order.shipping.city}, {order.shipping.zip}
            </p>
            <p className="text-sm text-slate-600">{order.shipping.phone}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase mb-1">Payment method</p>
            <p className="text-sm text-slate-600">{order.paymentMethod}</p>
          </div>
        </div>

        <div className="py-4">
          <p className="text-xs font-semibold text-slate-400 uppercase mb-2">Items</p>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-slate-400 uppercase">
                <th className="font-medium pb-2">Item</th>
                <th className="font-medium pb-2 text-center">Qty</th>
                <th className="font-medium pb-2 text-right">Unit Price</th>
                <th className="font-medium pb-2 text-right">Line Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {order.items.map((item) => (
                <tr key={item.productId}>
                  <td className="py-2 text-slate-700">{item.name}</td>
                  <td className="py-2 text-center text-slate-700">{item.quantity}</td>
                  <td className="py-2 text-right text-slate-700">
                    {item.discountPercent > 0 && (
                      <span className="text-slate-400 line-through mr-1">${item.originalPrice.toFixed(2)}</span>
                    )}
                    ${item.price.toFixed(2)}
                  </td>
                  <td className="py-2 text-right font-medium text-slate-900">
                    ${(item.price * item.quantity).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {order.items.some((item) => item.discountPercent > 0) && (
          <div className="flex justify-between text-sm text-emerald-600 pt-2">
            <span>You saved</span>
            <span>
              -$
              {order.items
                .reduce((sum, item) => sum + (item.originalPrice - item.price) * item.quantity, 0)
                .toFixed(2)}
            </span>
          </div>
        )}

        <div className="flex justify-between text-base font-bold text-slate-900 border-t border-slate-100 pt-4 mt-2">
          <span>Total</span>
          <span>${order.total.toFixed(2)}</span>
        </div>
      </div>

      <div className="flex gap-3 justify-center flex-wrap mt-6 print:hidden">
        <button
          type="button"
          onClick={() => window.print()}
          className="rounded-lg border border-slate-300 text-slate-700 font-semibold px-5 py-2.5 hover:bg-slate-50 transition"
        >
          Print Receipt
        </button>
        <Link
          to="/orders"
          className="rounded-lg border border-slate-300 text-slate-700 font-semibold px-5 py-2.5 hover:bg-slate-50 transition"
        >
          View My Orders
        </Link>
        <Link
          to="/"
          className="rounded-lg bg-indigo-600 text-white font-semibold px-5 py-2.5 hover:bg-indigo-700 transition"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  )
}
