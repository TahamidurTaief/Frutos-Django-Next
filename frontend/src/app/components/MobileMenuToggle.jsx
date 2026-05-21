'use client'

import { useState } from 'react'

export default function MobileMenuToggle() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="w-9 h-9 flex items-center justify-center"
        aria-label="Toggle menu"
      >
        <svg className="w-5 h-5 text-brand-black" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          {open ? (
            <path d="M18 6 6 18M6 6l12 12"/>
          ) : (
            <path d="M4 6h16M4 12h16M4 18h16"/>
          )}
        </svg>
      </button>

      {open && (
        <div className="fixed inset-0 top-[68px] bg-brand-cream z-40 p-6 flex flex-col gap-6">
          {['Shop', 'Recipes', 'Sustainability', 'About'].map((item) => (
            <a
              key={item}
              href="#"
              className="font-serif text-2xl font-semibold text-brand-black border-b border-brand-light-muted/40 pb-4"
              onClick={() => setOpen(false)}
            >
              {item}
            </a>
          ))}
          <div className="flex gap-3 mt-4">
            <a href="#" className="flex-1 text-center py-3 border border-brand-black rounded-full text-sm font-medium">Log In</a>
            <a href="#" className="flex-1 text-center py-3 bg-brand-green text-white rounded-full text-sm font-medium">Sign Up</a>
          </div>
        </div>
      )}
    </>
  )
}
