// src/app/products/[slug]/page.jsx
import { notFound } from 'next/navigation'
import { getProductBySlug, getProducts } from '@/lib/api_product'
import ProductDetailClient from './ProductDetailClient'


export const dynamic = 'force-dynamic'

// export async function generateStaticParams() {
//   const { slugify } = await import('@/app/lib/slugify')
//   const products = await getProducts()
//   return products.map(p => ({ slug: slugify(p.name) }))
// }

export async function generateMetadata({ params }) {
  const { slug } = await params
  try {
    const product = await getProductBySlug(slug)
    return {
      title: `${product.name} — El Árbol`,
      description: product.shortDesc || product.description,
    }
  } catch {
    return { title: 'Product — El Árbol' }
  }
}

export default async function ProductPage({ params }) {
  const { slug } = await params
  let product

  try {
    product = await getProductBySlug(slug)
  } catch {
    notFound()
  }

  return <ProductDetailClient product={product} related={product.related ?? []} />
}