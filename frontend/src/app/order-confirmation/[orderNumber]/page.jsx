// src/app/order-confirmation/[orderNumber]/page.jsx
// Server Component — Django থেকে real order data fetch করে

import { notFound } from 'next/navigation'
import OrderConfirmationClient from './OrderConfirmationClient'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api'

async function getOrder(orderNumber) {
  try {
    const res = await fetch(`${API_BASE}/orders/${orderNumber}/`, {
      cache: 'no-store',
    })
    if (res.status === 404) return null
    if (!res.ok) throw new Error(`API ${res.status}`)
    return res.json()
  } catch (err) {
    console.error('[OrderConfirmation] fetch failed:', err)
    return null
  }
}

// Next.js 15 — generateMetadata তেও params await করতে হয়
export async function generateMetadata({ params }) {
  const { orderNumber } = await params
  return {
    title: `Order ${orderNumber} — El Árbol`,
  }
}

// Next.js 15 — params এখন Promise, তাই await করতে হবে
export default async function OrderConfirmationPage({ params }) {
  const { orderNumber } = await params

  const order = await getOrder(orderNumber)

  if (!order) notFound()

  return <OrderConfirmationClient order={order} />
}