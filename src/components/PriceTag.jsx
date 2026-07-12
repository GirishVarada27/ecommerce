export default function PriceTag({ price, discountedPrice, discountPercent, large = false }) {
  const hasDiscount = discountPercent > 0
  const priceClass = large ? 'text-2xl' : 'text-base'

  return (
    <span className="inline-flex items-baseline gap-2 flex-wrap">
      <span className={`font-bold text-slate-900 ${priceClass}`}>${discountedPrice.toFixed(2)}</span>
      {hasDiscount && (
        <>
          <span className="text-sm text-slate-400 line-through">${price.toFixed(2)}</span>
          <span className="text-xs font-semibold text-emerald-600">-{Math.round(discountPercent * 100)}%</span>
        </>
      )}
    </span>
  )
}
