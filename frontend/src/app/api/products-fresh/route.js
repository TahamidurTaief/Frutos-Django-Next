// src/app/api/products-fresh/route.js
import { getProducts, getCategories } from '@/lib/api_product'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        const [products, categories] = await Promise.all([
            getProducts(),
            getCategories(),
        ])
        return NextResponse.json({ products, categories })
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}