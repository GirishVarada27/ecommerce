import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { fetchProducts } from '../api/client'
import { getCart, addToCart, updateQuantity, removeFromCart, clearCart } from '../utils/cart'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [cart, setCart] = useState(getCart)
  const [products, setProducts] = useState([])

  useEffect(() => {
    setCart(getCart())
    fetchProducts()
      .then(setProducts)
      .catch(() => setProducts([]))
  }, [])

  const items = useMemo(() => {
    return cart
      .map((entry) => {
        const product = products.find((p) => p.id === entry.productId)
        if (!product) return null
        return { product, quantity: entry.quantity, lineTotal: product.discountedPrice * entry.quantity }
      })
      .filter(Boolean)
  }, [cart, products])

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)
  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0)
  const savings = items.reduce(
    (sum, item) => sum + (item.product.price - item.product.discountedPrice) * item.quantity,
    0
  )

  function addItem(productId, quantity = 1) {
    setCart(addToCart(productId, quantity))
  }

  function updateItem(productId, quantity) {
    setCart(updateQuantity(productId, quantity))
  }

  function removeItem(productId) {
    setCart(removeFromCart(productId))
  }

  function clear() {
    setCart(clearCart())
  }

  const value = { items, itemCount, subtotal, savings, addItem, updateItem, removeItem, clear }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart must be used within a CartProvider')
  return context
}
