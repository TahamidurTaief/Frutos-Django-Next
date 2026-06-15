// src/app/api/products-fresh/route.js
import { getProducts, getCategories } from '@/lib/api_product'
import { NextResponse } from 'next/server'
import { auth } from '@/auth'

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        const session = await auth()
        const token = session?.user?.accessToken

        const [products, categories] = await Promise.all([
            getProducts({ token }),
            getCategories(),
        ])
        return NextResponse.json({ products, categories })
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}