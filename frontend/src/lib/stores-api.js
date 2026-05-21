// /**
//  * src/lib/stores-api.js
//  */

// // const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://elarbol.icommerce.com.bd/api'
// const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api'
// export async function getStores() {
//     const res = await fetch(`${API_BASE}/stores/`, {
//         cache: 'no-store'
//     });
//     if (!res.ok) throw new Error(`Failed to fetch stores: ${res.status}`)
//     const data = await res.json()
//     if (Array.isArray(data)) return data
//     if (data.results) return data.results
//     return []
// }

// export async function getStoreBySlug(slug) {
//     const res = await fetch(`${API_BASE}/stores/${slug}/`, {
//         next: { revalidate: 10 },
//     })
//     if (res.status === 404) return null
//     if (!res.ok) throw new Error(`Failed to fetch store "${slug}": ${res.status}`)
//     return res.json()
// }

// // ─── Pure JS helpers ───────────────────────────────────────────────────────────

// /** Haversine distance in km between two lat/lng pairs */
// export function haversineDistance(lat1, lon1, lat2, lon2) {
//     const R = 6371
//     const dLat = ((lat2 - lat1) * Math.PI) / 180
//     const dLon = ((lon2 - lon1) * Math.PI) / 180
//     const a =
//         Math.sin(dLat / 2) ** 2 +
//         Math.cos((lat1 * Math.PI) / 180) *
//         Math.cos((lat2 * Math.PI) / 180) *
//         Math.sin(dLon / 2) ** 2
//     return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
// }

// /** Sort store list by distance from user (closest first) */
// export function sortStoresByDistance(storeList, userLat, userLng) {
//     return [...storeList].sort((a, b) => {
//         if (a.lat == null) return 1
//         if (b.lat == null) return -1
//         return (
//             haversineDistance(userLat, userLng, a.lat, a.lng) -
//             haversineDistance(userLat, userLng, b.lat, b.lng)
//         )
//     })
// }

// /** Check if a store is currently open based on openTime / closeTime */
// export function isStoreOpen(store) {
//     if (!store || !store.openTime || !store.closeTime) return false

//     const now = new Date()
//     const nowMins = now.getHours() * 60 + now.getMinutes()

//     const toMins = (t) => {
//         const [h, m] = t.split(':').map(Number)
//         return h * 60 + m
//     }

//     const openMins = toMins(store.openTime)
//     const closeMins = toMins(store.closeTime)

//     if (closeMins <= openMins) {
//         return nowMins >= openMins || nowMins < closeMins
//     }

//     return nowMins >= openMins && nowMins < closeMins
// }

// /** Format km distance for display */
// export function formatDistance(km) {
//     if (km == null) return null
//     return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`
// }

// export const FEATURE_LABELS = {
//     leftoverPack: 'Leftover Pack',
//     organic: 'Organic',
//     delivery: 'Delivery',
//     pickup: 'Click & Collect',
//     clickCollect: 'Click & Collect',
// }


/**
 * src/lib/stores-api.js
 */

// const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://elarbol.icommerce.com.bd/api'
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api'

export async function getStores() {
    const res = await fetch(`${API_BASE}/stores/`, {
        next: { revalidate: 20, tags: ['stores'] },
    })
    if (!res.ok) throw new Error(`Failed to fetch stores: ${res.status}`)
    const data = await res.json()
    if (Array.isArray(data)) return data
    if (data.results) return data.results
    return []
}

export async function getStoreBySlug(slug) {
    const res = await fetch(`${API_BASE}/stores/${slug}/`, {
        next: { revalidate: 10, tags: ['stores'] },
    })
    if (res.status === 404) return null
    if (!res.ok) throw new Error(`Failed to fetch store "${slug}": ${res.status}`)
    return res.json()
}

// ─── Pure JS helpers ───────────────────────────────────────────────────────────

/** Haversine distance in km between two lat/lng pairs */
export function haversineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371
    const dLat = ((lat2 - lat1) * Math.PI) / 180
    const dLon = ((lon2 - lon1) * Math.PI) / 180
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) ** 2
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

/** Sort store list by distance from user (closest first) */
export function sortStoresByDistance(storeList, userLat, userLng) {
    return [...storeList].sort((a, b) => {
        if (a.lat == null) return 1
        if (b.lat == null) return -1
        return (
            haversineDistance(userLat, userLng, a.lat, a.lng) -
            haversineDistance(userLat, userLng, b.lat, b.lng)
        )
    })
}

/** Check if a store is currently open based on openTime / closeTime */
export function isStoreOpen(store) {
    if (!store || !store.openTime || !store.closeTime) return false

    const now = new Date()
    const nowMins = now.getHours() * 60 + now.getMinutes()

    const toMins = (t) => {
        const [h, m] = t.split(':').map(Number)
        return h * 60 + m
    }

    const openMins = toMins(store.openTime)
    const closeMins = toMins(store.closeTime)

    if (closeMins <= openMins) {
        return nowMins >= openMins || nowMins < closeMins
    }
    return nowMins >= openMins && nowMins < closeMins
}

/**
 * Convert 'HH:MM' or 'HH:MM:SS' → '8:00 AM' / '9:30 PM'
 * Use this wherever a time string is shown in the UI.
 */
export function formatTime12h(timeStr) {
    if (!timeStr) return ''
    const [h, m] = timeStr.split(':').map(Number)
    const period = h >= 12 ? 'PM' : 'AM'
    const hour12 = h % 12 || 12
    const mins = String(m || 0).padStart(2, '0')
    return `${hour12}:${mins} ${period}`
}

/** Format km distance for display */
export function formatDistance(km) {
    if (km == null) return null
    return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`
}

export const FEATURE_LABELS = {
    leftoverPack: 'Leftover Pack',
    organic: 'Organic',
    delivery: 'Delivery',
    pickup: 'Click & Collect',
    clickCollect: 'Click & Collect',
}