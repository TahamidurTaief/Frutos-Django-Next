/**
 * src/lib/api_about.js  — pure JS, no JSX
 *
 * Fetches About-page content from the Django backend.
 * Icons are defined separately in aboutIcons.jsx
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://elarbol.icommerce.com.bd/api'

// ── Fallback data (used when backend is unreachable) ──────────────────────────

const FALLBACK = {
    stats: [
        { value: '6+', label: 'Years of service' },
        { value: '40+', label: 'Local farm partners' },
        { value: '8', label: 'Store locations' },
        { value: '98%', label: 'Customer satisfaction' },
    ],
    values: [
        { icon_key: 'sustainability', title: 'Rooted in sustainability', body: 'Every product we source follows strict environmental criteria.' },
        { icon_key: 'community', title: 'Community first', body: 'We believe in fair prices for farmers and fair prices for customers.' },
        { icon_key: 'quality', title: 'Uncompromising quality', body: 'From harvest to doorstep in under 48 hours.' },
        { icon_key: 'provenance', title: 'Transparent provenance', body: 'Every product carries a story — the farm, the region, the farmer.' },
    ],
    milestones: [
        { year: '2018', event: 'Founded in Madrid with three farm partners and a single market stall.' },
        { year: '2019', event: 'Opened our first physical store in Chamberí; launched home delivery across Madrid.' },
        { year: '2021', event: 'Expanded to Barcelona and Sevilla; introduced the Leftover Pack programme.' },
        { year: '2023', event: 'Reached 40 partner farms across Spain; launched the El Árbol digital platform.' },
        { year: '2024', event: '8 store locations, 50,000+ happy customers, and still growing.' },
    ],
    farm_partners: [
        { name: 'Hacienda del Sol', region: 'Almería', specialty: 'Heirloom tomatoes & peppers' },
        { name: 'Finca La Paloma', region: 'Huelva', specialty: 'Strawberries & stone fruit' },
        { name: 'Rancho Verde', region: 'Murcia', specialty: 'Avocados & citrus' },
        { name: 'Serra dei Fiori', region: 'Liguria', specialty: 'Fresh herbs & greens' },
        { name: 'Huerta La Vega', region: 'Murcia', specialty: 'Spinach & root vegetables' },
        { name: 'Les Herbes du Midi', region: 'Provence', specialty: 'Wild-harvested herbs' },
    ],
    team: [
        { name: 'Sofía Martínez', role: 'Co-founder & CEO', initials: 'SM', origin: 'Madrid' },
        { name: 'Lucas Ferreira', role: 'Co-founder & Head of Sourcing', initials: 'LF', origin: 'Porto' },
        { name: 'Ana Delgado', role: 'Head of Operations', initials: 'AD', origin: 'Sevilla' },
        { name: 'Tomás Ruiz', role: 'Head of Technology', initials: 'TR', origin: 'Barcelona' },
    ],
}

// ── Main fetch function ───────────────────────────────────────────────────────

export async function getAboutPageData() {
    try {
        const res = await fetch(`${API_BASE}/about/`, {
            headers: { 'Content-Type': 'application/json' },
            cache: 'no-store',
        })
        if (!res.ok) throw new Error(`API error ${res.status}`)
        return res.json()
    } catch (err) {
        console.warn('[api_about] getAboutPageData fallback:', err.message)
        return FALLBACK
    }
}