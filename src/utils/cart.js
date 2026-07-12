const STORAGE_KEY = 'shoply-cart'

export function getCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveCart(cart) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cart))
  return cart
}

export function addToCart(productId, quantity = 1) {
  const cart = getCart()
  const existing = cart.find((item) => item.productId === productId)

  if (existing) {
    existing.quantity += quantity
  } else {
    cart.push({ productId, quantity })
  }

  return saveCart(cart)
}

export function updateQuantity(productId, quantity) {
  const cart = getCart()

  if (quantity <= 0) {
    return saveCart(cart.filter((item) => item.productId !== productId))
  }

  const existing = cart.find((item) => item.productId === productId)
  if (existing) existing.quantity = quantity

  return saveCart(cart)
}

export function removeFromCart(productId) {
  const cart = getCart().filter((item) => item.productId !== productId)
  return saveCart(cart)
}

export function clearCart() {
  return saveCart([])
}
