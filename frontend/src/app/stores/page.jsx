// src/app/stores/page.jsx
// SERVER COMPONENT — no 'use client'

import { getStores, isStoreOpen, FEATURE_LABELS } from '@/lib/stores-api'
import StoreFinderClient from './StoreFinderClient'

export const metadata = {
  title: 'Our Stores | El Árbol',
  description: 'Find our artisan produce stores near you and experience care in every delivery.',
}

// Revalidate every 60 s so store data stays fresh without a full rebuild
export const revalidate = 60

export default async function StorePage() {
  // Fetch on the server — zero client JS for the data layer
  const stores = await getStores()

  return <StoreFinderClient initialStores={stores} />
}