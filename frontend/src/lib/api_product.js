/**
 * src/lib/api_product.js
 *
 * Fetches data from the Django DRF backend.
 * Handles both plain array responses and paginated { count, results } responses.
 */

const PLACEHOLDER = 'https://placehold.co/400x400/ECF7E4/00694C?text=No+Image'
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://elarbol.icommerce.com.bd/api'
const MEDIA_BASE = API_BASE.replace('/api', '')
const PRODUCT_BASE = '/products/products'

// ─── Core fetch helper ────────────────────────────────────────────────────────

async function apiFetch(path, options = {}) {
    const url = API_BASE + path
    const res = await fetch(url, {
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
        ...options,
    })

    if (!res.ok) {
        throw new Error('API error ' + res.status + ' for ' + url)
    }

    return res.json()
}

// ─── Safe array extractor ─────────────────────────────────────────────────────
// Django REST framework sometimes paginates: { count, next, previous, results: [] }
// This handles both plain arrays and paginated responses safely.

function toArray(data) {
    if (Array.isArray(data)) return data
    if (data && Array.isArray(data.results)) return data.results
    return []
}

// ─── Normalizer ───────────────────────────────────────────────────────────────

function normalizeProduct(p) {
    let image = p.image_url || p.image || null

    if (image && !image.startsWith('http')) {
        image = MEDIA_BASE + '/media/' + image.replace(/^\/+/, '')
    }

    return {
        ...p,
        category: p.category || p.sub_category ? .category ? .name || null,
        price: Number(p.price),
        oldPrice: p.oldPrice != null ? Number(p.oldPrice) : (p.old_price != null ? Number(p.old_price) : null),
        rating: Number(p.rating),
        inStock: p.inStock !== undefined ? p.inStock : (p.in_stock !== undefined ? p.in_stock : p.stock),
        onSale: p.onSale !== undefined ? p.onSale : (p.on_sale !== undefined ? p.on_sale : (p.discount_price != null && Number(p.discount_price) < Number(p.price))),
        badgeColor: p.badgeColor || p.badge_color || '',
        wholesalePrice: p.wholesalePrice != null ? Number(p.wholesalePrice) : null,
        minWholesaleQty: p.minWholesaleQty || 1,
        image: image || PLACEHOLDER,
    }
}

// ─── Products ─────────────────────────────────────────────────────────────────

export async function getProducts({ category, search, inStock } = {}) {
    const params = new URLSearchParams()
    if (category && category !== 'All') params.set('category', category)
    if (search) params.set('search', search)
    if (inStock !== undefined) params.set('in_stock', inStock)

    const query = params.toString() ? '?' + params.toString() : ''

    const data = await apiFetch(PRODUCT_BASE + '/' + query, { next: { tags: ['products'] } })

    // toArray handles both [] and { results: [] } safely
    return toArray(data).map(normalizeProduct)
}

export async function getProductById(id) {
    const data = await apiFetch(`${PRODUCT_BASE}/${id}/`, { next: { tags: [`product-${id}`, 'products'] } })
    return {
        ...normalizeProduct(data),
        related: toArray(data.related).map(normalizeProduct),
    }
}

export async function getProductBySlug(slug) {
    const data = await apiFetch(`${PRODUCT_BASE}/slug/${slug}/`, { next: { tags: ['products'] } })
    return {
        ...normalizeProduct(data),
        related: toArray(data.related).map(normalizeProduct),
    }
}

// ─── Categories ───────────────────────────────────────────────────────────────

export async function getCategories() {
    const data = await apiFetch('/products/categories/')
    const names = toArray(data).map(function(cat) { return cat.name })
    return ['All'].concat(names).concat(['On Sale'])
}

export async function getCategoryObjects() {
    const data = await apiFetch('/products/categories/')
    return toArray(data)
}