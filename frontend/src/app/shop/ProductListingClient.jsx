'use client'
// src/app/shop/ProductListingClient.jsx

import { useState, useMemo, useEffect, useCallback } from 'react'
import ProductCard from '@/app/components/ProductCard'
import Link from 'next/link'

const SORT_OPTIONS = ['Promotional first', 'Price: Low to High', 'Price: High to Low', 'Newest arrivals']

// ─── Icons 
function SearchIcon() {
  return (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
    </svg>
  )
}
function FilterIcon() {
  return (
    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <line x1="4" y1="6" x2="20" y2="6" />
      <line x1="8" y1="12" x2="16" y2="12" />
      <line x1="10" y1="18" x2="14" y2="18" />
    </svg>
  )
}
function ChevronDown() {
  return (
    <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M6 9l6 6 6-6" />
    </svg>
  )
}
function ChevronRight() {
  return (
    <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M9 18l6-6-6-6" />
    </svg>
  )
}

// ─── Toggle ───────────────────────────────────────────────────────────────────
function Toggle({ checked, onChange }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      style={{
        position: 'relative', width: '44px', height: '24px',
        borderRadius: '999px', background: checked ? '#00694c' : '#BCCAC1',
        flexShrink: 0, overflow: 'hidden', transition: 'background 0.2s',
        border: 'none', cursor: 'pointer',
      }}
    >
      <span style={{
        position: 'absolute', top: '2px', left: '2px',
        width: '20px', height: '20px', borderRadius: '50%',
        background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
        transform: checked ? 'translateX(20px)' : 'translateX(0)',
        transition: 'transform 0.2s',
      }} />
    </button>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
// Props:
//   initialProducts — array of products fetched server-side from the API
//   categories      — ['All', 'Fruits', 'Vegetables', ...] from the API
export default function ProductListingClient({ initialProducts = [], categories = [] }) {

  const [products, setProducts] = useState(initialProducts)
  const [cats, setCats] = useState(categories)

  const fetchFresh = useCallback(async () => {
    try {
      const res = await fetch('/api/products-fresh')
      if (!res.ok) return
      const data = await res.json()
      setProducts(data.products)
      setCats(data.categories)
    } catch (e) {
    }
  }, [])

  useEffect(() => {
    const interval = setInterval(fetchFresh, 10_000) // 10 সেকেন্ড
    return () => clearInterval(interval)
  }, [fetchFresh])

  // Build CATEGORY_PILLS from API categories (same logic as before)
  const CATEGORY_PILLS = ['All Produce', ...categories.filter(c => c !== 'All' && c !== 'On Sale')]

  const [activeCategory, setActiveCategory]   = useState('All Produce')
  const [sortBy, setSortBy]                   = useState('Promotional first')
  const [inStockOnly, setInStockOnly]         = useState(false)
  const maxProductPrice = useMemo(
    () => Math.ceil(Math.max(...products.map(p => p.price), 50)),  
    [products]
)
  const [priceMax, setPriceMax] = useState(maxProductPrice)
  const [showMobileFilter, setShowMobileFilter] = useState(false)
  const [visibleCount, setVisibleCount]       = useState(6)
  const [notified, setNotified]               = useState({})
  const [searchQuery, setSearchQuery]         = useState('')

  // Map "All Produce" → "All" for data layer
  const dataCat = activeCategory === 'All Produce' ? 'All' : activeCategory

  const filtered = useMemo(() => {
    let list = [...products]

    if (dataCat !== 'All')      list = list.filter(p => p.category === dataCat)
    if (dataCat === 'On Sale')  list = list.filter(p => p.onSale)
    if (inStockOnly)            list = list.filter(p => p.inStock)
    if (searchQuery)            list = list.filter(p =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.origin?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    list = list.filter(p => p.price <= priceMax)

    if (sortBy === 'Price: Low to High') list.sort((a, b) => a.price - b.price)
    if (sortBy === 'Price: High to Low') list.sort((a, b) => b.price - a.price)
    if (sortBy === 'Promotional first')  list.sort((a, b) => (b.onSale ? 1 : 0) - (a.onSale ? 1 : 0))

    return list
  },  [products, dataCat, inStockOnly, priceMax, sortBy, searchQuery])

  const visibleProducts = filtered.slice(0, visibleCount)

  function clearFilters() {
    setActiveCategory('All Produce')
    setInStockOnly(false)
    setPriceMax(50)
    setSortBy('Promotional first')
    setSearchQuery('')
  }

  function catCount(cat) {
    if (cat === 'All Produce') return products.length 
    return products.filter(p => p.category === cat).length 
}
  // ── Sidebar ───────────────────────────────────────────────────────────────
  const Sidebar = () => (
    <aside className="space-y-8">

      {/* Category */}
      <div>
        <h3 style={{ fontFamily: '"Newsreader", Georgia, serif', fontSize: '18px', fontWeight: 700, color: '#151e13', marginBottom: '16px' }}>
          Category
        </h3>
        <div className="space-y-2.5">
          {CATEGORY_PILLS.map((cat, index) => {
            const isActive = activeCategory === cat
            return (
              <button
                key={`sidebar-${cat}-${index}`}
                onClick={() => setActiveCategory(cat)}
                className="flex items-center justify-between w-full text-left"
                style={{ opacity: isActive ? 1 : 0.65, border: 'none', background: 'none', cursor: 'pointer', padding: '2px 0' }}
              >
                <span style={{ fontSize: '14px', fontWeight: isActive ? 700 : 500, color: isActive ? '#00694c' : '#151e13' }}>
                  {cat}
                </span>
                <span
                  className="px-2 py-0.5 rounded text-[10px] font-bold"
                  style={{ background: isActive ? '#adedd8' : '#e7f1df', color: isActive ? '#2f6d5d' : '#6D7A73' }}
                >
                  {catCount(cat)}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h3 style={{ fontFamily: '"Newsreader", Georgia, serif', fontSize: '18px', fontWeight: 700, color: '#151e13', marginBottom: '16px' }}>
          Price Range
        </h3>
        <input
          type="range" min={0} max={maxProductPrice} value={priceMax}
          onChange={e => setPriceMax(Number(e.target.value))}
          className="w-full cursor-pointer" style={{ accentColor: '#00694c', height: '4px' }}
        />
        <div className="flex justify-between mt-3">
          <span style={{ fontSize: '13px', fontWeight: 700, color: '#151e13' }}>€0</span>
          {/* <span style={{ fontSize: '13px', fontWeight: 700, color: '#00694c' }}>€0</span> */}
          <span>€{priceMax === maxProductPrice ? `${maxProductPrice}+` : priceMax}</span>

        </div>
      </div>

      {/* In Stock */}
      <div className="flex items-center justify-between">
        <span style={{ fontSize: '13px', fontWeight: 600, color: '#151e13' }}>In Stock Only</span>
        <Toggle checked={inStockOnly} onChange={setInStockOnly} />
      </div>

      {/* Clear */}
      <button
        onClick={clearFilters}
        className="w-full py-3 rounded-lg text-sm font-bold"
        style={{ border: '1px solid rgba(0,105,76,0.2)', color: '#00694c', background: 'transparent', cursor: 'pointer' }}
      >
        Clear filters
      </button>
    </aside>
  )

  return (
    <div style={{ background: '#f2fdea', minHeight: '100vh' }} className='pb-10'>

      {/*  DESKTOP  */}
      <div className="hidden md:block">
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 32px' }}>

          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 py-5" style={{ fontSize: '13px', color: '#6D7A73' }}>
            <Link href="/" style={{ color: '#6D7A73' }} className="hover:text-[#00694c]">Home</Link>
            <ChevronRight />
            <span style={{ color: '#151e13' }}>{activeCategory}</span>
          </nav>

          {/* Page header */}
          <div className="flex items-end justify-between mb-8">
            <div>
              <h1 style={{ fontFamily: '"Newsreader", Georgia, serif', fontSize: '40px', fontStyle: 'italic', color: '#151e13', lineHeight: 1.1, marginBottom: '6px' }}>
                {activeCategory}
              </h1>
              <p style={{ fontSize: '13px', color: '#6D7A73', fontWeight: 500 }}>
                {filtered.length} product{filtered.length !== 1 ? 's' : ''} found
              </p>
            </div>

            {/* Search + Sort */}
            <div className="flex items-center gap-3 bg-white rounded-2xl px-4 py-2.5"
              style={{ border: '0.5px solid rgba(188,202,193,0.35)', boxShadow: '0 1px 6px rgba(0,33,21,0.04)' }}>

              {/* Search */}
              <div className="flex items-center gap-2 rounded-xl px-3 py-2 flex-1 max-w-[260px]"
                style={{ background: '#f2fdea', border: '1px solid rgba(0,105,76,0.1)' }}>
                <span className="text-[#6D7A73] shrink-0"><SearchIcon /></span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search produce, origin…"
                  className="bg-transparent outline-none w-full"
                  style={{ fontSize: '13px', color: '#151e13', border: 'none' }}
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')}
                    className="w-4 h-4 rounded-full flex items-center justify-center shrink-0"
                    style={{ background: '#BCCAC1' }}>
                    <svg width="8" height="8" fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path d="M18 6L6 18M6 6l12 12"/>
                    </svg>
                  </button>
                )}
              </div>

              {/* Divider */}
              <div className="w-px h-6 shrink-0" style={{ background: 'rgba(188,202,193,0.4)' }} />

              {/* Sort */}
              <div className="flex items-center gap-2 shrink-0">
                <svg width="13" height="13" fill="none" stroke="#6D7A73" strokeWidth="2" viewBox="0 0 24 24">
                  <line x1="4" y1="6" x2="20" y2="6"/>
                  <line x1="8" y1="12" x2="16" y2="12"/>
                  <line x1="10" y1="18" x2="14" y2="18"/>
                </svg>
                <span style={{ fontSize: '12px', color: '#6D7A73', fontWeight: 500 }}>Sort:</span>
                <div className="relative">
                  <select
                    value={sortBy} onChange={e => setSortBy(e.target.value)}
                    className="appearance-none pl-3 pr-8 py-1.5 rounded-lg text-sm font-semibold focus:outline-none"
                    style={{ background: '#f2fdea', border: '1px solid rgba(0,105,76,0.1)', color: '#151e13', cursor: 'pointer' }}
                  >
                    {SORT_OPTIONS.map(o => <option key={o}>{o}</option>)}
                  </select>
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#6D7A73' }}>
                    <ChevronDown />
                  </span>
                </div>
              </div>

              {/* Divider */}
              <div className="w-px h-6 shrink-0" style={{ background: 'rgba(188,202,193,0.4)' }} />

              {/* Result count */}
              <span className="shrink-0 px-3 py-1 rounded-full text-xs font-semibold"
                style={{ background: 'var(--search-color)', color: 'var(--common-color)' }}>
                {filtered.length} product{filtered.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          {/* Main layout */}
          <div className="flex gap-12">

            {/* Sidebar */}
            <div style={{ width: '240px', flexShrink: 0 }}>
              <div className="sticky" style={{ top: '80px' }}>
                {Sidebar()}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              {/* Category pills */}
              <div className="flex gap-3 overflow-x-auto pb-2 mb-4" style={{ scrollbarWidth: 'none' }}>
                {CATEGORY_PILLS.map((pill, index) => {
                  const isActive = activeCategory === pill
                  return (
                    <button
                      key={`desktop-pill-${pill}-${index}`}

                      onClick={() => setActiveCategory(pill)}
                      className="shrink-0 px-6 py-2 rounded-full text-sm font-bold whitespace-nowrap"
                      style={{
                        background: isActive ? '#00694c' : '#fff',
                        color: isActive ? '#fff' : '#3d4943',
                        border: 'none', cursor: 'pointer',
                        boxShadow: isActive ? '0 4px 14px rgba(0,105,76,0.25)' : '0 1px 4px rgba(0,0,0,0.06)',
                      }}
                    >
                      {pill}
                    </button>
                  )
                })}
              </div>

              {/* Product grid */}
              {visibleProducts.length === 0 ? (
                <div className="text-center py-20">
                  <p style={{ fontSize: '16px', color: '#6D7A73' }}>No products match your filters.</p>
                  {/* <button onClick={clearFilters} className="mt-4 text-sm font-bold" style={{ color: '#00694c' }}>
                    Clear all filters
                  </button> */}
                </div>
              ) : (
                <div className="grid grid-cols-2 xl:grid-cols-3 gap-8">
                  {visibleProducts.map(p => (
                    <ProductCard
                      key={p.id}
                      product={p}
                      notified={!!notified[p.id]}
                      onNotify={() => setNotified(n => ({ ...n, [p.id]: true }))}
                    />
                  ))}
                </div>
              )}

              {/* Load more */}
              {visibleCount < filtered.length && (
                <div className="flex justify-center mt-16">
                  <button
                    onClick={() => setVisibleCount(v => v + 6)}
                    className="flex items-center gap-2 px-10 py-4 rounded-lg font-bold text-sm text-white"
                    style={{ background: 'linear-gradient(135deg, #00694c 0%, #008560 100%)', border: 'none', cursor: 'pointer', boxShadow: '0 4px 16px rgba(0,105,76,0.25)' }}
                  >
                    Load more products
                    <ChevronDown />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/*  MOBILE */}
      <div className="md:hidden" style={{ paddingBottom: '100px' }}>

        {/* Sub-header */}
        <div style={{ background: '#ecf7e4', padding: '16px 20px 0' }}>
          <div className="flex items-end justify-between mb-4">
            <div>
              <h1 style={{ fontFamily: '"Newsreader", Georgia, serif', fontSize: '36px', fontWeight: 700, color: '#151e13', lineHeight: 1.1 }}>
                Market
              </h1>
              <p style={{ fontFamily: '"Newsreader", Georgia, serif', fontSize: '13px', fontStyle: 'italic', color: '#00694c', opacity: 0.8 }}>
                Fresh from the garden
              </p>
            </div>
            <button
              onClick={() => setShowMobileFilter(!showMobileFilter)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold"
              style={{ background: '#fff', border: '1px solid rgba(188,202,193,0.3)', color: '#151e13', boxShadow: '0 1px 4px rgba(0,33,21,0.06)' }}
            >
              <FilterIcon />
              Filter
              {(inStockOnly || priceMax < 50) && (
                <span className="w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center" style={{ background: '#00694c', color: '#fff' }}>
                  {(inStockOnly ? 1 : 0) + (priceMax < 50 ? 1 : 0)}
                </span>
              )}
            </button>
          </div>

          {/* Mobile category pills */}
          <div className="flex gap-2 overflow-x-auto pb-4" style={{ scrollbarWidth: 'none' }}>
            {CATEGORY_PILLS.map((cat, index) => {
              const isActive = activeCategory === cat
              return (
                <button
                  key={`mobile-pill-${cat}-${index}`}

                  onClick={() => setActiveCategory(cat)}
                  className="shrink-0 px-5 py-2 rounded-full text-[11px] font-bold uppercase tracking-wider whitespace-nowrap"
                  style={{
                    background: isActive ? '#adedd8' : '#fff',
                    color: isActive ? '#2f6d5d' : 'rgba(21,30,19,0.5)',
                    border: '1px solid rgba(188,202,193,0.15)',
                  }}
                >
                  {cat}
                </button>
              )
            })}
          </div>
        </div>

        {/* Mobile filter drawer */}
        {showMobileFilter && (
          <div
            className="fixed inset-0 z-50 flex flex-col"
            style={{ background: 'rgba(0,0,0,0.4)' }}
            onClick={() => setShowMobileFilter(false)}
          >
            <div
              className="mt-auto rounded-t-3xl overflow-y-auto"
              style={{ background: '#f2fdea', maxHeight: '80vh', padding: '24px 20px 40px' }}
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-center mb-6">
                <div className="w-10 h-1 rounded-full" style={{ background: '#BCCAC1' }} />
              </div>
              <h2 style={{ fontFamily: '"Newsreader", Georgia, serif', fontSize: '22px', fontWeight: 700, color: '#151e13', marginBottom: '24px' }}>
                Filters
              </h2>
              {Sidebar()}
              <button
                onClick={() => setShowMobileFilter(false)}
                className="w-full py-4 rounded-xl font-bold text-sm text-white mt-6"
                style={{ background: 'linear-gradient(135deg, #00694c 0%, #008560 100%)', border: 'none' }}
              >
                Show {filtered.length} products
              </button>
            </div>
          </div>
        )}

        {/* Product count */}
        <div style={{ padding: '16px 20px 8px' }}>
          <p style={{ fontSize: '12px', color: '#6D7A73' }}>
            <span style={{ fontWeight: 700, color: '#151e13' }}>{filtered.length}</span> products found
          </p>
        </div>

        {/* Mobile grid */}
        <div style={{ padding: '0 16px' }}>
          {visibleProducts.length === 0 ? (
            <div className="text-center py-16">
              <p style={{ fontSize: '14px', color: '#6D7A73' }}>No products match your filters.</p>
              <button onClick={clearFilters} className="mt-3 text-sm font-bold" style={{ color: '#00694c' }}>Clear all filters</button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {visibleProducts.map(p => (
                <ProductCard
                  key={p.id}
                  product={p}
                  notified={!!notified[p.id]}
                  onNotify={() => setNotified(n => ({ ...n, [p.id]: true }))}
                />
              ))}
            </div>
          )}

          {visibleCount < filtered.length && (
            <div className="flex justify-center mt-10">
              <button
                onClick={() => setVisibleCount(v => v + 6)}
                className="px-8 py-3.5 rounded-xl font-bold text-sm text-white"
                style={{ background: 'linear-gradient(135deg, #00694c 0%, #008560 100%)', border: 'none' }}
              >
                Load more
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}