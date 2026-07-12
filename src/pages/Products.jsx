import { useEffect, useMemo, useState } from 'react'
import { CATEGORIES, SUBCATEGORIES } from '../data/categories'
import { fetchProducts } from '../api/client'
import ProductCard from '../components/ProductCard'

const PAGE_SIZE = 24

export default function Products() {
  const [products, setProducts] = useState([])
  const [status, setStatus] = useState('loading')
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All')
  const [subcategory, setSubcategory] = useState('All')
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

  useEffect(() => {
    fetchProducts()
      .then((data) => {
        setProducts(data)
        setStatus('ready')
      })
      .catch(() => setStatus('error'))
  }, [])

  const availableSubcategories = SUBCATEGORIES[category] || []

  function handleCategoryChange(value) {
    setCategory(value)
    setSubcategory('All')
  }

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesCategory = category === 'All' || p.category === category
      const matchesSubcategory = subcategory === 'All' || p.subcategory === subcategory
      const matchesQuery =
        query.trim() === '' ||
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.category.toLowerCase().includes(query.toLowerCase())
      return matchesCategory && matchesSubcategory && matchesQuery
    })
  }, [products, query, category, subcategory])

  useEffect(() => {
    setVisibleCount(PAGE_SIZE)
  }, [query, category, subcategory])

  const visibleProducts = filteredProducts.slice(0, visibleCount)

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Shop</h1>
        <p className="text-slate-500 mt-1">Browse our catalog and add items to your cart.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search products..."
          className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
        <select
          value={category}
          onChange={(e) => handleCategoryChange(e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="All">All Categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        {availableSubcategories.length > 0 && (
          <select
            value={subcategory}
            onChange={(e) => setSubcategory(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="All">All {category}</option>
            {availableSubcategories.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        )}
      </div>

      {status === 'loading' && <p className="text-slate-500 text-center py-16">Loading products...</p>}
      {status === 'error' && (
        <p className="text-slate-500 text-center py-16">Couldn't load products. Please try again later.</p>
      )}

      {status === 'ready' && filteredProducts.length === 0 && (
        <p className="text-slate-500 text-center py-16">No products match your search.</p>
      )}

      {status === 'ready' && filteredProducts.length > 0 && (
        <>
          <p className="text-sm text-slate-500 mb-4">
            Showing {visibleProducts.length} of {filteredProducts.length} products
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {visibleProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          {visibleCount < filteredProducts.length && (
            <div className="flex justify-center mt-8">
              <button
                type="button"
                onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                className="rounded-lg border border-slate-300 text-slate-700 font-semibold px-6 py-2.5 hover:bg-slate-50 transition"
              >
                Load More
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
