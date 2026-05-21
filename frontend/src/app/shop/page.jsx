// src/app/shop/page.jsx
import { getProducts, getCategories } from '@/lib/api_product'
import ProductListingClient from './ProductListingClient'

export const dynamic = 'force-dynamic'


export const metadata = {
  title: 'Market — El Árbol',
  description: 'Fresh produce, sourced with care.',
}

export default async function MarketPage() {
  // Fetch in parallel — both resolve before the page renders
  const [products, categories] = await Promise.all([
    getProducts(),
    getCategories(),
  ])

  return (
    <ProductListingClient
      initialProducts={products}
      categories={categories}
    />
  )
}