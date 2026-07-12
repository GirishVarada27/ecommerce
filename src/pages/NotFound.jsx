import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="text-center py-24">
      <p className="text-6xl font-bold text-slate-200">404</p>
      <h1 className="text-xl font-bold text-slate-900 mt-4">Page not found</h1>
      <p className="text-slate-500 mt-2">The page you're looking for doesn't exist.</p>
      <Link
        to="/"
        className="inline-block mt-6 rounded-lg bg-indigo-600 text-white font-semibold px-5 py-2.5 hover:bg-indigo-700 transition"
      >
        Back to Shop
      </Link>
    </div>
  )
}
