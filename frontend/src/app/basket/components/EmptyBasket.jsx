// src/app/basket/_components/EmptyBasket.jsx
// ✅ No hooks — can be used inside both server & client trees

import Link from 'next/link'

export default function EmptyBasket() {
  return (
    <div style={{ background: '#ffffff', minHeight: '100vh', width: '100%' }}>
      <div className="max-w-2xl mx-auto px-6 py-24 text-center">
        <div
          className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6"
          style={{ background: '#f0f4f0' }}
        >
          <span className="material-symbols-outlined text-5xl text-[#bccac1]">
            shopping_basket
          </span>
        </div>

        <h1
          className="text-4xl italic mb-4"
          style={{ fontFamily: '"Newsreader", Georgia, serif', color: '#151e13' }}
        >
          Your basket is empty
        </h1>

        <p className="mb-8" style={{ color: '#6d7a73' }}>
          Discover fresh, seasonal produce from local artisans.
        </p>

        <Link
          href="/"
          className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-white transition-all hover:brightness-110"
          style={{ background: 'linear-gradient(135deg, #00694c 0%, #008560 100%)' }}
        >
          <span className="material-symbols-outlined">storefront</span>
          Browse Market
        </Link>
      </div>
    </div>
  )
}