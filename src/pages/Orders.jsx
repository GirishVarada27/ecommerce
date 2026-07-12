import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchOrders } from '../api/client'
import OrderCard from '../components/OrderCard'

export default function Orders() {
  const [orders, setOrders] = useState([])
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    fetchOrders()
      .then((data) => {
        setOrders(data)
        setStatus('ready')
      })
      .catch(() => setStatus('error'))
  }, [])

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">My Orders</h1>

      {status === 'loading' && <p className="text-slate-500 text-center py-16">Loading orders...</p>}
      {status === 'error' && (
        <p className="text-slate-500 text-center py-16">Couldn't load orders. Please try again later.</p>
      )}

      {status === 'ready' && orders.length === 0 && (
        <div className="text-center py-16">
          <p className="text-slate-500 mb-4">You haven't placed any orders yet.</p>
          <Link
            to="/"
            className="inline-block rounded-lg bg-indigo-600 text-white font-semibold px-5 py-2.5 hover:bg-indigo-700 transition"
          >
            Browse Products
          </Link>
        </div>
      )}

      {status === 'ready' && orders.length > 0 && (
        <div className="flex flex-col gap-4">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  )
}
