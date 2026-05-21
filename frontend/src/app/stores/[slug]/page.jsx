// src/app/stores/[slug]/page.jsx
//  SERVER COMPONENT — no 'use client'

import { getStoreBySlug, getStores } from '@/lib/stores-api'
import { notFound } from 'next/navigation'
import StoreDetailClient from './StoreDetailClient'

export const revalidate = 60

// Pre-generate all known slugs at build time for static optimisation
export async function generateStaticParams() {
  try {
    const stores = await getStores()
    return stores.map((s) => ({ slug: s.slug }))
  } catch {
    return []
  }
}

export async function generateMetadata({ params }) {
  const { slug } = await params
  const store    = await getStoreBySlug(slug)
  if (!store) return { title: 'Store Not Found' }
  return {
    title:       `${store.name} | El Árbol`,
    description: `Visit our ${store.name} location. ${store.address} — Artisan produce, delivered with care.`,
  }
}

export default async function StoreDetailPage({ params }) {
  const { slug } = await params
  const store    = await getStoreBySlug(slug)
  if (!store) notFound()

  return <StoreDetailClient store={store} />
}