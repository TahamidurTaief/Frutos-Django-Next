/**
 * src/app/about/config/aboutIcons.jsx
 *
 * JSX icon map for the Values section.
 * Kept separate from api_about.js so plain .js files stay JSX-free.
 *
 * To add a new icon:
 *  1. Add a choice to ICON_CHOICES in Django models.py
 *  2. Add the matching key + SVG here
 */

export const ABOUT_ICONS = {
  sustainability: (
    <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="#00694c" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 8C8 10 5.9 16.17 3.82 19.3A10 10 0 0 0 19 5c-1-1-2-1.71-2-1.71V8z" />
      <path d="M3.82 19.3C4 18 5 13 9 11" />
    </svg>
  ),
  community: (
    <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="#00694c" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  quality: (
    <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="#00694c" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  provenance: (
    <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="#00694c" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  ),
}

/**
 * Attaches the correct JSX icon to each value object from the API.
 * Falls back to the sustainability icon if the key is unrecognised.
 */
export function normalizeValues(rawValues) {
  return rawValues.map((v) => ({
    ...v,
    icon: ABOUT_ICONS[v.icon_key] ?? ABOUT_ICONS.sustainability,
  }))
}