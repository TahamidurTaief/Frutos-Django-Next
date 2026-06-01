'use client'

import { useState, useEffect } from 'react'
// import { products, categories } from '@/app/data/products'

import { getProducts, getCategories } from '@/lib/api_product'

import ProductCard from '@/app/components/ProductCard'
import Link from 'next/link'



export default function ProductGrid({ initialProducts = [], categories = [] }) {
  const [products, setProducts] = useState(initialProducts)
  const [active, setActive] = useState('All')
  const [notified, setNotified] = useState({})

  // Props change হলে sync করো
  useEffect(() => { setProducts(initialProducts) }, [initialProducts])

  const filtered =
    active === 'All'      ? products
    : active === 'On Sale'  ? products.filter(p => p.onSale)
    : products.filter(p => p.category === active) 

  return (
    <section className="bg-[var(--section-color)] pb-12 md:pb-20">
      <div className="max-w-[1280px] mx-auto px-4 md:px-6 lg:px-10">

        {/* ── Category filter pills ──────────────────── */}
        <div
          className="flex items-center gap-2 overflow-x-auto pb-2 pt-5 md:pt-8"
          style={{ scrollbarWidth: 'none' }}
        >
          {categories.map((cat,index) => {
            const isActive = active === cat
            return (
              <button
                key={`${cat}-${index}`}
                onClick={() => setActive(cat)}
                className="shrink-0 rounded-full transition-all duration-200"
                style={{
                  fontSize: '12.5px',
                  fontWeight: 500,
                  padding: '6px 16px',
                  border: isActive
                    ? '1.5px solid #00694C'
                    : '1.5px solid var(--common-color)',
                  background: isActive ? '#00694C' : 'white',
                  color: isActive ? '#fff' : 'var(--common-color)',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                {cat}
              </button>
            )
          })}
        </div>

        {/* ── Section heading ─────────────────────────── */}
        <div className="flex items-end justify-between mt-6 md:mt-10 mb-4 md:mb-6">
          {/* Mobile: "Harvest Favorites" | Desktop: "Seasonal Favorites" */}
          <h2
            style={{
              fontFamily: '"Playfair Display", Georgia, serif',
              fontSize: 'clamp(1.4rem, 2.8vw, 2.1rem)',
              fontWeight: 700,
              color: '#151E13',
              lineHeight: 1.15,
            }}
          >
            <span className="md:hidden">Harvest Favorites</span>
            <span className="hidden md:inline">Seasonal Favorites</span>
          </h2>

          {/* See All — visible on both mobile and desktop */}
          <Link
            href="/shop"
            className="flex items-center gap-1 hover:underline"
            style={{ fontSize: '13px', fontWeight: 500, color: '#00694C', whiteSpace: 'nowrap' }}
          >
            See All
            <svg width="14" height="14" fill="none" stroke="#00694C" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* ── Product grid ─────────────────────────────── */}
        {/* Mobile: 2 cols | Desktop: 3-4 cols */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
          {filtered.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              notified={!!notified[p.id]}
              onNotify={() => setNotified((n) => ({ ...n, [p.id]: true }))}
            />
          ))}
        </div>

        {filtered.length === 0 && (
          <p className="py-20 text-center" style={{ color: '#6D7A73', fontSize: '14px' }}>
            No products in this category.
          </p>
        )}
      </div>
    </section>
  )
}