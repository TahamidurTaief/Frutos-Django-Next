// 'use client'
// // src/app/basket/components/BasketShell.jsx

// import { useEffect, useState } from 'react'
// import { useSession } from 'next-auth/react'
// import { useCart } from '@/app/context/CartContext'

// import EmptyBasket         from './EmptyBasket'
// import FulfillmentSwitcher from './FulfillmentSwitcher'
// import BasketItemList      from './BasketItemList'
// import OrderSummary        from './OrderSummary'

// const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api'

// // ─── Fetch one product from the backend (no cache) ───────────────────────────

// async function fetchLiveProduct(id) {
//   try {
//     const res = await fetch(`${API_BASE}/products/${id}/`, { cache: 'no-store' })
//     return res.ok ? res.json() : null
//   } catch {
//     return null
//   }
// }

// // ─── Merge fresh backend fields onto a cart item ─────────────────────────────

// function mergeWithFresh(cartItem, fresh) {
//   if (!fresh) return cartItem
//   return {
//     ...cartItem,
//     // The fields most likely to change in admin:
//     minWholesaleQty:
//       fresh.minWholesaleQty  ??
//       fresh.min_wholesale_qty ??
//       cartItem.minWholesaleQty,
//     wholesalePrice:
//       fresh.wholesalePrice  != null ? Number(fresh.wholesalePrice)
//       : fresh.wholesale_price != null ? Number(fresh.wholesale_price)
//       : cartItem.wholesalePrice,
//     price:   fresh.price   ? Number(fresh.price)  : cartItem.price,
//     inStock: fresh.inStock ?? fresh.in_stock ?? cartItem.inStock,
//   }
// }

// // ─── Main component ───────────────────────────────────────────────────────────

// export default function BasketShell({ initialDelivery, initialStore }) {
//   const { data: session }   = useSession()
//   const isApprovedWholesale = session?.user?.isApproved === true

//   const {
//     items, subtotal, totalItems,
//     fulfillment, setFulfillment,
//     updateQty, removeItem,
//   } = useCart()

//   // liveItems = cart items enriched with the latest values from the API
//   const [liveItems, setLiveItems] = useState(items)

//   // ── 1. Re-fetch from API whenever the set of item IDs changes ──────────────
//   //       (i.e. on page load, and when an item is added or removed)
//   const itemIds = items.map(i => i.id).join(',')

//   useEffect(() => {
//     if (!itemIds) {
//       setLiveItems([])
//       return
//     }

//     let cancelled = false

//     Promise.all(items.map(item => fetchLiveProduct(item.id)))
//       .then(freshProducts => {
//         if (cancelled) return
//         setLiveItems(items.map((item, idx) => mergeWithFresh(item, freshProducts[idx])))
//       })

//     return () => { cancelled = true }
//   // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [itemIds])   // ← only re-fetch when IDs change, not on every qty update

//   // ── 2. Keep qty / effectivePrice in sync whenever cart changes ─────────────
//   //       (qty stepper changes don't need a full refetch, just update qty)
//   useEffect(() => {
//     setLiveItems(prev =>
//       items.map(item => {
//         const live = prev.find(l => l.id === item.id)
//         // Preserve the freshly-fetched minWholesaleQty / wholesalePrice etc,
//         // but always use the cart's latest qty and effectivePrice.
//         return live
//           ? { ...live, qty: item.qty, effectivePrice: item.effectivePrice }
//           : item
//       })
//     )
//   }, [items])

//   if (items.length === 0) return <EmptyBasket />

//   // Recalculate subtotal using liveItems so it reflects any price changes too
//   const liveSubtotal = liveItems.reduce(
//     (sum, item) => sum + (item.effectivePrice ?? item.price) * item.qty,
//     0,
//   )

//   return (
//     <div style={{ background: '#ffffff', minHeight: '100vh', width: '100%' }}>
//       <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12">
//         <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">

//           {/* ── Left column ───────────────────────────────────────────────── */}
//           <div className="lg:col-span-8 space-y-0">
//             <h1
//               className="text-4xl md:text-5xl font-light mb-6 md:mb-8 italic leading-tight"
//               style={{ fontFamily: '"Newsreader", Georgia, serif', color: '#151e13' }}
//             >
//               Your Basket{' '}
//               <span
//                 className="text-2xl font-normal not-italic ml-2"
//                 style={{ color: '#6d7a73' }}
//               >
//                 ({totalItems} {totalItems === 1 ? 'item' : 'items'})
//               </span>
//             </h1>

//             <FulfillmentSwitcher
//               fulfillment={fulfillment}
//               setFulfillment={setFulfillment}
//               initialDelivery={initialDelivery}
//               initialStore={initialStore}
//             />

//             {/* Pass liveItems so BasketItemList always shows fresh minWholesaleQty */}
//             <BasketItemList
//               items={liveItems}
//               updateQty={updateQty}
//               removeItem={removeItem}
//               isApprovedWholesale={isApprovedWholesale}
//             />
//           </div>

//           {/* ── Right column ──────────────────────────────────────────────── */}
//           <div className="lg:col-span-4">
//             {/* Pass liveItems so the popup uses fresh minWholesaleQty too */}
//             <OrderSummary subtotal={liveSubtotal} items={liveItems} isApprovedWholesale={isApprovedWholesale}/>
//           </div>

//         </div>
//       </div>
//     </div>
//   )
// }


'use client'
// src/app/basket/components/BasketShell.jsx

import { useEffect, useState } from 'react'
import { useSession }          from 'next-auth/react'
import { useCart }             from '@/app/context/CartContext'

import EmptyBasket         from './EmptyBasket'
import FulfillmentSwitcher from './FulfillmentSwitcher'
import BasketItemList      from './BasketItemList'
import OrderSummary        from './OrderSummary'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api'

async function fetchLiveProduct(id) {
    try {
        const res = await fetch(`${API_BASE}/products/${id}/`, { cache: 'no-store' })
        return res.ok ? res.json() : null
    } catch { return null }
}

function mergeWithFresh(cartItem, fresh) {
    if (!fresh) return cartItem
    return {
        ...cartItem,
        minWholesaleQty:
            fresh.minWholesaleQty ?? fresh.min_wholesale_qty ?? cartItem.minWholesaleQty,
        wholesalePrice:
            fresh.wholesalePrice != null ? Number(fresh.wholesalePrice)
            : fresh.wholesale_price != null ? Number(fresh.wholesale_price)
            : cartItem.wholesalePrice,
        price:   fresh.price   ? Number(fresh.price)  : cartItem.price,
        inStock: fresh.inStock ?? fresh.in_stock ?? cartItem.inStock,
    }
}

// ── Delivery fee calculation (client-side mirror of Django logic) ─────────────

function calcDeliveryFee(config, subtotal) {
    if (!config || !config.is_active || config.charge_type === 'free') return 0
    if (config.charge_type === 'flat') return Number(config.flat_fee)
    if (config.charge_type === 'threshold') {
        return subtotal >= Number(config.free_threshold)
            ? 0
            : Number(config.flat_fee)
    }
    return 0
}

// ── Main component ────────────────────────────────────────────────────────────

export default function BasketShell({ initialDelivery, initialStore }) {
    const { data: session }   = useSession()
    const isApprovedWholesale = session?.user?.isApproved === true

    const {
        items, totalItems,
        fulfillment, setFulfillment,
        updateQty, removeItem,
    } = useCart()

    const [liveItems, setLiveItems] = useState(items)
    const itemIds = items.map(i => i.id).join(',')

    useEffect(() => {
        if (!itemIds) { setLiveItems([]); return }
        let cancelled = false
        Promise.all(items.map(item => fetchLiveProduct(item.id)))
            .then(freshProducts => {
                if (cancelled) return
                setLiveItems(items.map((item, idx) => mergeWithFresh(item, freshProducts[idx])))
            })
        return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [itemIds])

    useEffect(() => {
        setLiveItems(prev =>
            items.map(item => {
                const live = prev.find(l => l.id === item.id)
                return live
                    ? { ...live, qty: item.qty, effectivePrice: item.effectivePrice }
                    : item
            })
        )
    }, [items])

    if (items.length === 0) return <EmptyBasket />

    // ── Totals ────────────────────────────────────────────────────────────────
    const liveSubtotal = liveItems.reduce(
        (sum, item) => sum + (item.effectivePrice ?? item.price) * item.qty, 0,
    )

    const deliveryFee  = calcDeliveryFee(initialDelivery, liveSubtotal)
    const grandTotal   = liveSubtotal + deliveryFee

    return (
        <div style={{ background: '#ffffff', minHeight: '100vh', width: '100%' }}>
            <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">

                    {/* Left column */}
                    <div className="lg:col-span-8 space-y-0">
                        <h1
                            className="text-4xl md:text-5xl font-light mb-6 md:mb-8 italic leading-tight"
                            style={{ fontFamily: '"Newsreader", Georgia, serif', color: '#151e13' }}
                        >
                            Your Basket{' '}
                            <span className="text-2xl font-normal not-italic ml-2" style={{ color: '#6d7a73' }}>
                                ({totalItems} {totalItems === 1 ? 'item' : 'items'})
                            </span>
                        </h1>

                        <FulfillmentSwitcher
                            fulfillment={fulfillment}
                            setFulfillment={setFulfillment}
                            initialDelivery={initialDelivery}
                            initialStore={initialStore}
                        />

                        <BasketItemList
                            items={liveItems}
                            updateQty={updateQty}
                            removeItem={removeItem}
                            isApprovedWholesale={isApprovedWholesale}
                        />
                    </div>

                    {/* Right column */}
                    <div className="lg:col-span-4">
                        <OrderSummary
                            subtotal={liveSubtotal}
                            deliveryFee={deliveryFee}
                            deliveryConfig={initialDelivery}
                            grandTotal={grandTotal}
                            items={liveItems}
                            isApprovedWholesale={isApprovedWholesale}
                        />
                    </div>

                </div>
            </div>
        </div>
    )
}