import { NavLink, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useSession, signOut } from '../lib/auth-client'

const linkClass = ({ isActive }) =>
  `text-sm font-medium px-1 pb-1 border-b-2 transition-colors ${
    isActive ? 'text-indigo-600 border-indigo-600' : 'text-slate-600 border-transparent hover:text-slate-900'
  }`

export default function Navbar() {
  const { itemCount } = useCart()
  const { data: session } = useSession()
  const navigate = useNavigate()

  async function handleSignOut() {
    await signOut()
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-10 bg-white border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        <NavLink to="/" className="text-xl font-bold text-indigo-600">
          Shoply
        </NavLink>
        <nav className="flex items-center gap-6">
          <NavLink to="/" end className={linkClass}>
            Shop
          </NavLink>
          <NavLink to="/orders" className={linkClass}>
            My Orders
          </NavLink>
          <NavLink to="/cart" className="relative flex items-center gap-1.5">
            <span className="text-sm font-medium text-slate-600 hover:text-slate-900">Cart</span>
            {itemCount > 0 && (
              <span className="inline-flex items-center justify-center min-w-5 h-5 px-1 rounded-full bg-indigo-600 text-white text-xs font-semibold">
                {itemCount}
              </span>
            )}
          </NavLink>
          {session ? (
            <span className="flex items-center gap-3">
              <span className="text-sm font-medium text-slate-700">{session.user.name || session.user.email}</span>
              <button
                type="button"
                onClick={handleSignOut}
                className="text-sm font-medium text-slate-600 border border-slate-300 rounded-lg px-3 py-1.5 hover:bg-slate-50 transition"
              >
                Sign Out
              </button>
            </span>
          ) : (
            <NavLink to="/login" className={linkClass}>
              Sign In
            </NavLink>
          )}
        </nav>
      </div>
    </header>
  )
}
