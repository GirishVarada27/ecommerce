import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { placeOrder } from '../api/client'

const emptyShipping = { name: '', address: '', city: '', zip: '', phone: '' }
const emptyPayment = { cardholderName: '', cardNumber: '', expiry: '', cvv: '' }

const STEPS = ['Shipping', 'Review', 'Payment']

function formatCardNumber(value) {
  return value
    .replace(/\D/g, '')
    .slice(0, 19)
    .replace(/(.{4})/g, '$1 ')
    .trim()
}

function formatExpiry(value) {
  const digits = value.replace(/\D/g, '').slice(0, 4)
  if (digits.length <= 2) return digits
  return `${digits.slice(0, 2)}/${digits.slice(2)}`
}

export default function Checkout() {
  const navigate = useNavigate()
  const { items, subtotal, clear } = useCart()
  const [step, setStep] = useState(0)
  const [shipping, setShipping] = useState(emptyShipping)
  const [payment, setPayment] = useState(emptyPayment)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (items.length === 0) {
    return <Navigate to="/cart" replace />
  }

  function handleShippingSubmit(e) {
    e.preventDefault()
    if (!shipping.name.trim() || !shipping.address.trim() || !shipping.city.trim() || !shipping.zip.trim() || !shipping.phone.trim()) {
      setError('Please fill in all shipping details.')
      return
    }
    setError('')
    setStep(1)
  }

  function handleReviewContinue() {
    setError('')
    setStep(2)
  }

  async function handlePaymentSubmit(e) {
    e.preventDefault()

    if (!payment.cardholderName.trim() || !payment.cardNumber.trim() || !payment.expiry.trim() || !payment.cvv.trim()) {
      setError('Please fill in all payment details.')
      return
    }

    setSubmitting(true)
    setError('')

    try {
      const order = await placeOrder({
        items: items.map(({ product, quantity }) => ({ productId: product.id, quantity })),
        shipping,
        payment: {
          cardholderName: payment.cardholderName.trim(),
          cardNumber: payment.cardNumber.replace(/\s+/g, ''),
          expiry: payment.expiry.trim(),
          cvv: payment.cvv.trim(),
        },
      })
      clear()
      navigate(`/order-confirmation/${order.id}`, { replace: true })
    } catch (err) {
      setError(err.message)
      setSubmitting(false)
    }
  }

  return (
    <div>
      <Link to="/cart" className="text-sm text-indigo-600 hover:underline">
        ← Back to cart
      </Link>

      <h1 className="text-2xl font-bold text-slate-900 mt-4 mb-2">Checkout</h1>

      <ol className="flex items-center gap-2 mb-6 text-sm">
        {STEPS.map((label, i) => (
          <li key={label} className="flex items-center gap-2">
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
                i === step
                  ? 'bg-indigo-600 text-white'
                  : i < step
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-slate-100 text-slate-400'
              }`}
            >
              {i < step ? '✓' : i + 1}
            </span>
            <span className={i === step ? 'font-semibold text-slate-900' : 'text-slate-400'}>{label}</span>
            {i < STEPS.length - 1 && <span className="text-slate-300 ml-2">—</span>}
          </li>
        ))}
      </ol>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 flex flex-col gap-4">
          {step === 0 && (
            <form className="flex flex-col gap-4" onSubmit={handleShippingSubmit}>
              <h2 className="font-semibold text-slate-900">Shipping Details</h2>

              <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
                Full name
                <input
                  type="text"
                  value={shipping.name}
                  onChange={(e) => setShipping({ ...shipping, name: e.target.value })}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-normal focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Jane Doe"
                />
              </label>

              <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
                Address
                <input
                  type="text"
                  value={shipping.address}
                  onChange={(e) => setShipping({ ...shipping, address: e.target.value })}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-normal focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="123 Main Street"
                />
              </label>

              <div className="grid grid-cols-2 gap-4">
                <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
                  City
                  <input
                    type="text"
                    value={shipping.city}
                    onChange={(e) => setShipping({ ...shipping, city: e.target.value })}
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-normal focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Springfield"
                  />
                </label>
                <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
                  ZIP code
                  <input
                    type="text"
                    value={shipping.zip}
                    onChange={(e) => setShipping({ ...shipping, zip: e.target.value })}
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-normal focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="12345"
                  />
                </label>
              </div>

              <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
                Phone number
                <input
                  type="tel"
                  value={shipping.phone}
                  onChange={(e) => setShipping({ ...shipping, phone: e.target.value })}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-normal focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="e.g. 5551234567"
                />
              </label>

              {error && <p className="text-sm text-red-600">{error}</p>}

              <button
                type="submit"
                className="mt-2 rounded-lg bg-indigo-600 text-white font-semibold py-2.5 hover:bg-indigo-700 transition"
              >
                Continue to Review
              </button>
            </form>
          )}

          {step === 1 && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-slate-900">Review Your Order</h2>
                <button type="button" onClick={() => setStep(0)} className="text-sm text-indigo-600 hover:underline">
                  Edit shipping
                </button>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="text-xs font-medium text-slate-400 uppercase mb-1">Ship to</p>
                <p className="text-sm text-slate-900 font-medium">{shipping.name}</p>
                <p className="text-sm text-slate-600">{shipping.address}</p>
                <p className="text-sm text-slate-600">
                  {shipping.city}, {shipping.zip}
                </p>
                <p className="text-sm text-slate-600">{shipping.phone}</p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white divide-y divide-slate-100">
                {items.map(({ product, quantity, lineTotal }) => (
                  <div key={product.id} className="flex items-center gap-3 p-3">
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                      <img
                        src={product.image}
                        alt={product.name}
                        loading="lazy"
                        decoding="async"
                        width={40}
                        height={40}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">{product.name}</p>
                      <p className="text-xs text-slate-500">
                        ${product.discountedPrice.toFixed(2)} × {quantity}
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-slate-900">${lineTotal.toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={handleReviewContinue}
                className="mt-2 rounded-lg bg-indigo-600 text-white font-semibold py-2.5 hover:bg-indigo-700 transition"
              >
                Continue to Payment
              </button>
            </div>
          )}

          {step === 2 && (
            <form className="flex flex-col gap-4" onSubmit={handlePaymentSubmit}>
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-slate-900">Payment Details</h2>
                <button type="button" onClick={() => setStep(1)} className="text-sm text-indigo-600 hover:underline">
                  Back to review
                </button>
              </div>

              <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
                Cardholder name
                <input
                  type="text"
                  value={payment.cardholderName}
                  onChange={(e) => setPayment({ ...payment, cardholderName: e.target.value })}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-normal focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Jane Doe"
                />
              </label>

              <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
                Card number
                <input
                  type="text"
                  inputMode="numeric"
                  value={payment.cardNumber}
                  onChange={(e) => setPayment({ ...payment, cardNumber: formatCardNumber(e.target.value) })}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-normal focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="4111 1111 1111 1111"
                  maxLength={23}
                />
              </label>

              <div className="grid grid-cols-2 gap-4">
                <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
                  Expiry (MM/YY)
                  <input
                    type="text"
                    inputMode="numeric"
                    value={payment.expiry}
                    onChange={(e) => setPayment({ ...payment, expiry: formatExpiry(e.target.value) })}
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-normal focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="12/30"
                    maxLength={5}
                  />
                </label>
                <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
                  CVV
                  <input
                    type="text"
                    inputMode="numeric"
                    value={payment.cvv}
                    onChange={(e) => setPayment({ ...payment, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-normal focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="123"
                    maxLength={4}
                  />
                </label>
              </div>

              <p className="text-xs text-slate-400">
                This is a simulated payment — no real card is charged. Any 16-digit number with a future expiry
                will succeed.
              </p>

              {error && <p className="text-sm text-red-600">{error}</p>}

              <button
                type="submit"
                disabled={submitting}
                className="mt-2 rounded-lg bg-indigo-600 text-white font-semibold py-2.5 hover:bg-indigo-700 transition disabled:opacity-60"
              >
                {submitting ? 'Processing payment...' : `Pay $${subtotal.toFixed(2)}`}
              </button>
            </form>
          )}
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 h-fit">
          <h2 className="font-semibold text-slate-900 mb-4">Order Summary</h2>
          <ul className="divide-y divide-slate-100 mb-4">
            {items.map(({ product, quantity, lineTotal }) => (
              <li key={product.id} className="py-2 flex justify-between text-sm">
                <span className="text-slate-700">
                  {product.name} <span className="text-slate-400">× {quantity}</span>
                </span>
                <span className="font-medium text-slate-900">${lineTotal.toFixed(2)}</span>
              </li>
            ))}
          </ul>
          <div className="flex justify-between text-base font-bold text-slate-900 border-t border-slate-100 pt-4">
            <span>Total</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
