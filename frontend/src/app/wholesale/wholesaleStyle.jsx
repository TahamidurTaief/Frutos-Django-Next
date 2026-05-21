export default function WholesaleStyles() {
  return (
    <style>{`
      /* ── Spacing ── */
      .ws-hero-pad    { padding: 60px 20px 56px; }
      .ws-section-pad { padding: 64px 20px; }
      .ws-section-pad-dark  { padding: 64px 20px; background: #0a2218; }
      .ws-section-pad-white { padding: 64px 20px; background: #fff; }
      .ws-section-pad-slate { padding: 64px 20px; background: #f7faf8; }

      /* ── Typography ── */
      .ws-h1 { font-size: clamp(2rem, 6vw, 3.8rem); }
      .ws-h2 { font-size: clamp(1.5rem, 4vw, 2.2rem); }

      /* ── Grids ── */
      .ws-stats-grid      { display: grid; grid-template-columns: repeat(2, 1fr); }
      .ws-benefits-grid   { display: grid; grid-template-columns: 1fr; gap: 12px; }
      .ws-categories-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
      .ws-steps-grid      { display: grid; grid-template-columns: 1fr; gap: 0; }
      .ws-tiers-grid      { display: grid; grid-template-columns: 1fr; gap: 16px; }
      .ws-testimonials-grid { display: grid; grid-template-columns: 1fr; gap: 16px; }
      .ws-req-grid        { display: grid; grid-template-columns: 1fr; gap: 12px; }

      /* ── Stat dividers ── */
      .ws-stat-cell { padding: 28px 20px; border-bottom: 1px solid rgba(255,255,255,0.08); }
      .ws-stat-cell:nth-child(odd)  { border-right: 1px solid rgba(255,255,255,0.08); }
      .ws-stat-cell:nth-last-child(-n+2) { border-bottom: none; }

      /* ── Tier highlight ── */
      .ws-tier-featured { border: 2px solid #00694c !important; }

      /* ── Hover effects ── */
      .ws-benefit-card:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(0,33,21,0.08); }
      .ws-category-card:hover { background: #e7f5e0 !important; }
      .ws-benefit-card, .ws-category-card { transition: all 0.2s ease; }

      @media (min-width: 768px) {
        .ws-hero-pad    { padding: 88px 40px 80px; }
        .ws-section-pad { padding: 80px 40px; }
        .ws-section-pad-dark  { padding: 80px 40px; }
        .ws-section-pad-white { padding: 80px 40px; }
        .ws-section-pad-slate { padding: 80px 40px; }

        .ws-stats-grid      { grid-template-columns: repeat(4, 1fr); }
        .ws-benefits-grid   { grid-template-columns: repeat(2, 1fr); gap: 16px; }
        .ws-categories-grid { grid-template-columns: repeat(3, 1fr); gap: 16px; }
        .ws-steps-grid      { grid-template-columns: repeat(4, 1fr); }
        .ws-tiers-grid      { grid-template-columns: repeat(3, 1fr); gap: 20px; }
        .ws-testimonials-grid { grid-template-columns: repeat(3, 1fr); gap: 20px; }
        .ws-req-grid        { grid-template-columns: repeat(2, 1fr); gap: 16px; }

        .ws-stat-cell { border-bottom: none !important; border-right: 1px solid rgba(255,255,255,0.08); }
        .ws-stat-cell:last-child { border-right: none !important; }
      }

      @media (min-width: 1024px) {
        .ws-benefits-grid { grid-template-columns: repeat(3, 1fr); }
        .ws-req-grid      { grid-template-columns: repeat(3, 1fr); }
      }
    `}</style>
  )
}