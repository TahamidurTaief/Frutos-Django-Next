/**
 * src/lib/api_homepage.js  — pure JS, no JSX
 *
 * Fetches all homepage section data from the Django backend in one call.
 * Falls back to hardcoded defaults so the page never breaks during downtime.
 *
 * JSX icons live separately in:
 *   src/app/config/homepageIcons.jsx
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://elarbol.icommerce.com.bd/api'

const DEFAULT_MOBILE_IMAGE = 'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=800&auto=format&fit=crop'
const DEFAULT_DESKTOP_IMAGE = '/homepage/hero_image.png'
const DEFAULT_BANNER_IMAGE = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&auto=format&fit=crop'

// ── Fallback ──────────────────────────────────────────────────────────────────

const FALLBACK = {
    hero: {
        mobile_heading: 'Freshness from the Orchard to Your Table.',
        mobile_image_url: DEFAULT_MOBILE_IMAGE,
        desktop_heading: 'Fresh from the market, delivered to your door.',
        desktop_subtext: 'Experience the finest seasonal harvests sourced directly from local growers. We bring the artisanal market experience to your kitchen.',
        desktop_image_url: DEFAULT_DESKTOP_IMAGE,
        primary_cta_text: 'Shop Now',
        primary_cta_href: '/shop',
        secondary_cta_text: 'Find My Store',
        secondary_cta_href: '/stores',
    },
    how_it_works: { heading: 'How It Works' },
    steps: [
        { id: 1, icon_key: 'select', title: 'Select Your Harvest', desc: 'Choose from our daily updated inventory of organic produce.' },
        { id: 2, icon_key: 'delivery', title: 'Carbon-Free Delivery', desc: 'Our electric fleet ensures your groceries arrive fresh and green.' },
        { id: 3, icon_key: 'local', title: 'Enjoy Local Flavors', desc: 'Direct support to local farmers in every bite.' },
    ],
    leftover_banner: {
        heading: 'Leftover Pack — Save food, save money',
        description: 'Get a curated selection of seasonal surplus at 40% off. Perfectly good produce that deserves a home.',
        cta_text: 'Get Your Pack',
        cta_href: '/stores',
        image_url: DEFAULT_BANNER_IMAGE,
    },
}

// ── Main fetch ────────────────────────────────────────────────────────────────

export async function getHomepageData() {
    try {
        const res = await fetch(`${API_BASE}/homepage/`, {
            headers: { 'Content-Type': 'application/json' },
            cache: 'no-store',
        })
        if (!res.ok) throw new Error(`API error ${res.status}`)

        const data = await res.json()

        // Fill in default images if admin left fields blank
        if (!data.hero.mobile_image_url) data.hero.mobile_image_url = DEFAULT_MOBILE_IMAGE
        if (!data.hero.desktop_image_url) data.hero.desktop_image_url = DEFAULT_DESKTOP_IMAGE
        if (!data.leftover_banner.image_url) data.leftover_banner.image_url = DEFAULT_BANNER_IMAGE

        return data
    } catch (err) {
        console.warn('[api_homepage] fallback:', err.message)
        return FALLBACK
    }
}