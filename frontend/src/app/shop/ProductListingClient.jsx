'use client'
// src/app/shop/ProductListingClient.jsx

import { useState, useMemo, useEffect, useCallback } from 'react'
import ProductCard from '@/app/components/ProductCard'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

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

// ─── Pagination Component ───────────────────────────────────────────────────────
function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null

  const getVisiblePages = () => {
    let pages = []
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
        pages.push(i)
      } else if (pages[pages.length - 1] !== '...') {
        pages.push('...')
      }
    }
    return pages
  }

  return (
    <div className="flex items-center justify-center gap-2 mt-12">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="w-10 h-10 flex items-center justify-center rounded-lg border border-[#BCCAC1]/40 text-[#151E13] disabled:opacity-50 disabled:cursor-not-allowed transition-colors hover:bg-white cursor-pointer"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>

      {getVisiblePages().map((page, idx) => (
        page === '...' ? (
          <span key={`dots-${idx}`} className="text-[#6D7A73]">...</span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`w-10 h-10 flex items-center justify-center rounded-lg font-bold transition-colors cursor-pointer ${
              currentPage === page 
                ? 'bg-[#00694C] text-white' 
                : 'border border-[#BCCAC1]/40 text-[#151E13] hover:bg-white'
            }`}
          >
            {page}
          </button>
        )
      ))}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="w-10 h-10 flex items-center justify-center rounded-lg border border-[#BCCAC1]/40 text-[#151E13] disabled:opacity-50 disabled:cursor-not-allowed transition-colors hover:bg-white cursor-pointer"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>
    </div>
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

  const searchParams = useSearchParams()
  const initialCatParam = searchParams.get('category')

  // Build CATEGORY_PILLS from API categories (same logic as before)
  const CATEGORY_PILLS = ['All Produce', ...categories.filter(c => c !== 'All' && c !== 'On Sale')]

  const initCat = initialCatParam && CATEGORY_PILLS.includes(initialCatParam) ? initialCatParam : 'All Produce'

  const [activeCategory, setActiveCategory]   = useState(initCat)
  const [sortBy, setSortBy]                   = useState('Promotional first')
  const [inStockOnly, setInStockOnly]         = useState(false)
  const maxProductPrice = useMemo(
    () => Math.ceil(Math.max(...products.map(p => p.price), 50)),  
    [products]
)
  const [priceMax, setPriceMax] = useState(maxProductPrice)
  const [showMobileFilter, setShowMobileFilter] = useState(false)
  const [currentPage, setCurrentPage]         = useState(1)
  const itemsPerPage = 6
  const [notified, setNotified]               = useState({})
  const [searchQuery, setSearchQuery]         = useState('')

  // Map "All Produce" → "All" for data layer
  const dataCat = activeCategory === 'All Produce' ? 'All' : activeCategory

  const filtered = useMemo(() => {
    let list = [...products]

    const storeParam = searchParams.get('store')
    if (storeParam)             list = list.filter(p => (p.stores && p.stores.some(s => s.slug === storeParam)) || p.shop?.slug === storeParam)

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
  },  [products, dataCat, inStockOnly, priceMax, sortBy, searchQuery, searchParams])

  useEffect(() => {
    setCurrentPage(1)
  }, [dataCat, inStockOnly, priceMax, sortBy, searchQuery, searchParams])

  const totalPages = Math.ceil(filtered.length / itemsPerPage)
  const visibleProducts = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  function clearFilters() {
    setActiveCategory('All Produce')
    setInStockOnly(false)
    setPriceMax(50)
    setSortBy('Promotional first')
    setSearchQuery('')
  }

  function catCount(cat) {
    let list = products
    const storeParam = searchParams.get('store')
    if (storeParam) list = list.filter(p => (p.stores && p.stores.some(s => s.slug === storeParam)) || p.shop?.slug === storeParam)

    if (cat === 'All Produce') return list.length 
    return list.filter(p => p.category === cat).length 
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
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 lg:gap-0 mb-8">
            <div>
              <h1 style={{ fontFamily: '"Newsreader", Georgia, serif', fontSize: '40px', fontStyle: 'italic', color: '#151e13', lineHeight: 1.1, marginBottom: '6px' }}>
                {activeCategory}
              </h1>
              <p style={{ fontSize: '13px', color: '#6D7A73', fontWeight: 500 }}>
                {filtered.length} product{filtered.length !== 1 ? 's' : ''} found
              </p>
            </div>

            {/* Search + Sort */}
            <div className="flex flex-wrap items-center gap-3 bg-white rounded-2xl px-4 py-2.5 w-full lg:w-auto"
              style={{ border: '0.5px solid rgba(188,202,193,0.35)', boxShadow: '0 1px 6px rgba(0,33,21,0.04)' }}>

              {/* Search */}
              <div className="flex items-center gap-2 rounded-xl px-3 py-2 flex-1 min-w-[200px] lg:max-w-[260px]"
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

              {/* Pagination */}
              <Pagination 
                currentPage={currentPage} 
                totalPages={totalPages} 
                onPageChange={setCurrentPage} 
              />
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

          {/* Pagination */}
          <div className="pb-8">
            <Pagination 
              currentPage={currentPage} 
              totalPages={totalPages} 
              onPageChange={setCurrentPage} 
            />
          </div>
        </div>
      </div>
    </div>
  )
}