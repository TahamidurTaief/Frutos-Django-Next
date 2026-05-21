// src/app/lib/slugify.js

export function slugify(text) {
    return text
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '') // remove special chars
        .replace(/\s+/g, '-') // spaces → hyphens
        .replace(/-+/g, '-') // collapse multiple hyphens
}

export function getProductBySlug(products, slug) {
    return products.find((p) => p.slug === slug || slugify(p.name) === slug) || null
}