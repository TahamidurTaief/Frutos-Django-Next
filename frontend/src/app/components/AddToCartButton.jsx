'use client'
import { useState } from 'react'
import { useCart } from '@/app/context/CartContext'

export default function AddToCartButton({
  product,
  inStock         = true,
  isWholesale     = false,
  minWholesaleQty = 1,
  effectivePrice  = null,
  // Pass qty from product detail page; card always passes 1
  qty             = 1,
}) {
  const { addItem, setSidebarOpen } = useCart()
  const [added,     setAdded]     = useState(false)
  const [showError, setShowError] = useState(false)

  function handleClick(e) {
    e.preventDefault()
    e.stopPropagation()
    if (!inStock) return

    // Wholesale minimum check — only block if qty is genuinely below minimum
    if (isWholesale && product.wholesalePrice && qty < minWholesaleQty) {
      setShowError(true)
      setTimeout(() => setShowError(false), 3500)
      return
    }

    addItem(product, effectivePrice, qty)
    setAdded(true)
    setSidebarOpen(true)
    setTimeout(() => setAdded(false), 1500)
  }

  if (!inStock) return null

  return (
    <>
      {showError && (
        <div style={{
          position: 'fixed', bottom: '24px', left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 9999, width: 'min(380px, calc(100vw - 32px))',
          background: '#151E13', color: 'white',
          borderRadius: '14px', padding: '16px 18px',
          boxShadow: '0 16px 48px rgba(0,0,0,0.35)',
          display: 'flex', gap: '12px', alignItems: 'flex-start',
          animation: 'toastIn 0.25s ease',
        }}>
          <style>{`@keyframes toastIn{from{opacity:0;transform:translate(-50%,12px)}to{opacity:1;transform:translate(-50%,0)}}`}</style>
          <div style={{ flex: 1 }}>
            <p style={{ fontWeight: 700, fontSize: '13.5px', margin: '0 0 5px' }}>
              Wholesale Minimum Required
            </p>
            <p style={{ fontSize: '12.5px', color: 'rgba(255,255,255,0.65)', margin: 0, lineHeight: 1.55 }}>
              You need at least{' '}
              <strong style={{ color: 'white' }}>
                {minWholesaleQty} {product.wholesaleUnit || 'units'}
              </strong>{' '}
              to unlock the wholesale price of{' '}
              <strong style={{ color: '#6EE7B7' }}>
                €{Number(product.wholesalePrice).toFixed(2)}
              </strong>.{' '}
              {qty === 1 && 'Please set the quantity on the product page.'}
            </p>
          </div>
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowError(false) }}
            style={{ background: 'none', border: 'none', cursor: 'pointer',
                     color: 'rgba(255,255,255,0.4)', padding: 0, flexShrink: 0 }}>
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path d="M18 6 6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>
      )}

      <button
        onClick={handleClick}
        className="flex cursor-pointer items-center justify-center transition-all duration-200 active:scale-[0.97]"
        style={{
          background: added ? '#085041' : 'linear-gradient(135deg, #00694C 0%, #008560 100%)',
          color: 'white',
          borderRadius: '8px',
          border: 'none',
          padding: added ? '8px 12px' : '8px', // মোবাইলে ছোট প্যাডিং
          boxShadow: added ? 'none' : '0 2px 8px rgba(0,105,76,0.25)',
        }}
      >
        {added ? (
           <div className="flex items-center gap-1.5">
             <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
               <path d="M5 13l4 4L19 7" />
             </svg>
             <span className="hidden md:inline text-[13px] font-bold">Added</span>
           </div>
        ) : (
          <div className="flex items-center gap-2">
            {/* আপনার দেওয়া কার্ট আইকনটি এখানে */}
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
            {/* ডেস্কটপে টেক্সট দেখাবে, মোবাইলে হাইড থাকবে */}
            <span className="hidden md:inline text-[13px] font-bold pr-1">Add Item</span>
          </div>
        )}
      </button>
    </>
  )
}