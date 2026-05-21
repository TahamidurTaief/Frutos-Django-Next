

// ── Feature card icons ────────────────────────────────────────────────────────

export const FEATURE_ICONS = {
  delivery: (
    <svg width="28" height="28" fill="none" stroke="#00694C" strokeWidth="1.6" viewBox="0 0 24 24">
      <rect x="1" y="3" width="15" height="13" rx="1" />
      <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
      <circle cx="5.5" cy="18.5" r="2.5" />
      <circle cx="18.5" cy="18.5" r="2.5" />
    </svg>
  ),
  collect: (
    <svg width="28" height="28" fill="none" stroke="#00694C" strokeWidth="1.6" viewBox="0 0 24 24">
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  ),
  fresh: (
    <svg width="28" height="28" fill="none" stroke="#00694C" strokeWidth="1.6" viewBox="0 0 24 24">
      <path d="M12 22V12" />
      <path d="M12 12C12 12 7 9 7 4a5 5 0 0 1 10 0c0 5-5 8-5 8z" />
      <path d="M12 12C12 12 17 9 17 4" />
      <path d="M8 20h8" />
    </svg>
  ),
  natural: (
    <svg width="28" height="28" fill="none" stroke="#00694C" strokeWidth="1.6" viewBox="0 0 24 24">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <polyline points="9 12 11 14 15 10" />
    </svg>
  ),
}

// ── How It Works step icons (desktop) ────────────────────────────────────────

export const STEP_ICONS = {
  select: (
    <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24">
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  ),
  delivery: (
    <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  local: (
    <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24">
      <path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z" />
      <path d="M8.56 2.75c4.37 6.03 6.02 9.42 8.03 17.72m2.54-15.38c-3.72 4.35-8.94 5.66-16.88 5.85m19.5 1.9c-3.5-.93-6.63-.82-8.94 0-2.58.92-5.01 2.86-7.44 6.32" />
    </svg>
  ),
}

// ── Normalizers ───────────────────────────────────────────────────────────────

/** Attach JSX icon to each feature card from the API */
export function normalizeFeatureCards(rawCards) {
  const cards = Array.isArray(rawCards) ? rawCards : []
  return cards.map((c) => ({
    ...c,
    icon: FEATURE_ICONS?.[c?.icon_key] ?? FEATURE_ICONS.delivery,
  }))
}

/** Attach desktop JSX icon + step number string to each step from the API */
export function normalizeSteps(rawSteps) {
  const steps = Array.isArray(rawSteps) ? rawSteps : []
  return steps.map((s, i) => ({
    ...s,
    num:         String(i + 1),
    desktopIcon: STEP_ICONS?.[s?.icon_key] ?? STEP_ICONS.select,
  }))
}