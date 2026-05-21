// src/app/not-found.jsx
import Link from 'next/link'

export const metadata = {
  title: '404 — Page Not Found | El Árbol',
}

function LeafIcon() {
  return (
    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M17 8C8 10 5.9 16.17 3.82 19.3A10 10 0 0 0 19 5c-1-1-2-1.71-2-1.71V8z"
        stroke="#00694c" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
        fill="rgba(0,105,76,0.08)"
      />
      <path d="M3.82 19.3C4 18 5 13 9 11" stroke="#00694c" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}

export default function NotFound() {
  return (
    <div
      className="min-h-[calc(100vh-0px)] flex flex-col items-center justify-center px-6 text-center"
      style={{ background: '#f2fdea' }}
    >
      {/* Decorative top line */}
      {/* <div className="flex items-center gap-3 mb-10 opacity-30">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="w-1.5 h-1.5 rounded-full bg-[#00694c]" />
        ))}
      </div> */}

      <LeafIcon />

      {/* 404 */}
      <p
        className="mt-6 mb-2 font-bold tracking-[0.2em] uppercase"
        style={{ fontSize: '11px', color: '#00694c', letterSpacing: '0.25em' }}
      >
        Error 404
      </p>

      <h1
        style={{
          fontFamily: '"Playfair Display", Georgia, serif',
          fontSize: 'clamp(2.5rem, 8vw, 4rem)',
          fontWeight: 500,
          color: '#151e13',
          lineHeight: 1.1,
          marginBottom: '16px',
        }}
      >
        Page not found
      </h1>

      <p
        style={{
          fontFamily: '"Newsreader", Georgia, serif',
          fontSize: '18px',
          fontStyle: 'italic',
          color: '#6D7A73',
          maxWidth: '420px',
          lineHeight: 1.6,
          marginBottom: '40px',
        }}
      >
        Looks like this page wandered off the path. Let's get you back to fresh produce.
      </p>

      {/* CTAs */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <Link
          href="/"
          className="px-8 py-3.5 rounded-xl font-bold text-sm text-white transition-all hover:brightness-105 active:scale-[0.98]"
          style={{
            background: 'linear-gradient(135deg, #00694c 0%, #008560 100%)',
            boxShadow: '0 4px 16px rgba(0,105,76,0.25)',
          }}
        >
          Back to Home
        </Link>
        <Link
          href="/shop"
          className="px-8 py-3.5 rounded-xl font-bold text-sm transition-all hover:bg-[#e7f1df] active:scale-[0.98]"
          style={{
            background: '#ECF7E4',
            color: '#151e13',
          }}
        >
          Browse the Market
        </Link>
      </div>

      {/* Quick links */}
      <div className="mt-14 flex flex-wrap justify-center gap-x-8 gap-y-2">
        {[
          { label: 'Shop',    href: '/shop' },
          { label: 'Stores',  href: '/stores' },
          { label: 'Recipes', href: '/recipes' },
          { label: 'About',   href: '/about' },
        ].map(({ label, href }) => (
          <Link
            key={label}
            href={href}
            className="text-sm font-semibold transition-colors hover:text-[#00694c]"
            style={{ color: '#6D7A73' }}
          >
            {label}
          </Link>
        ))}
      </div>

      {/* Bottom decoration */}
      <div className="flex items-center gap-3 mt-12 opacity-20">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="w-1.5 h-1.5 rounded-full bg-[#00694c]" />
        ))}
      </div>
    </div>
  )
}
