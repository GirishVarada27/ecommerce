// Category-wide promotional discounts. Centralized here so the storefront
// display and the amount actually charged at checkout can never drift apart.
const CATEGORY_DISCOUNTS = {
  Electronics: 0.1,
  Men: 0.2,
  Women: 0.2,
  Kids: 0.2,
}

export function getDiscountPercent(category) {
  return CATEGORY_DISCOUNTS[category] || 0
}

export function getDiscountedPrice(price, category) {
  const percent = getDiscountPercent(category)
  return Math.round(price * (1 - percent) * 100) / 100
}
