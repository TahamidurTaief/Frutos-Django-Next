export default function AboutStyles() {
  return (
    <style>{`
        .about-hero-pad   { padding: 36px 20px 32px; }
        .about-section-pad { padding: 40px 20px; }
        .about-section-pad-white { padding: 40px 20px; background: #fff; }
        .about-h1  { font-size: clamp(2rem, 7vw, 4rem); }
        .about-h2  { font-size: clamp(1.6rem, 5vw, 2.4rem); }
        .about-stats-grid { display: grid; grid-template-columns: repeat(2, 1fr); }
        .about-mission-grid { display: grid; grid-template-columns: 1fr; gap: 24px; }
        .about-values-grid  { display: grid; grid-template-columns: 1fr; gap: 10px; }
        .about-team-grid    { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
        .about-farms-grid   { display: grid; grid-template-columns: 1fr; gap: 10px; }
        .about-mission-img  { display: none; }
        .about-timeline-line { left: 52px; }
        .about-timeline-year { width: 52px; }
        .stat-border-right { border-right: none !important; border-bottom: 1px solid rgba(255,255,255,0.12); }
        .stat-border-right:nth-child(odd) { border-right: 1px solid rgba(255,255,255,0.12) !important; }
        .stat-border-right:nth-last-child(-n+2) { border-bottom: none !important; }

        @media (min-width: 768px) {
          .about-hero-pad    { padding: 52px 32px 48px; }
          .about-section-pad { padding: 60px 32px; }
          .about-section-pad-white { padding: 60px 32px; background: #fff; }
          .about-stats-grid  { grid-template-columns: repeat(4, 1fr); }
          .about-mission-grid { grid-template-columns: 1fr 1fr; gap: 48px; align-items: center; }
          .about-values-grid  { grid-template-columns: repeat(2, 1fr); gap: 16px; }
          .about-team-grid    { grid-template-columns: repeat(4, 1fr); gap: 16px; }
          .about-farms-grid   { grid-template-columns: repeat(3, 1fr); gap: 14px; }
          .about-mission-img  { display: block; }
          .about-timeline-line { left: 68px; }
          .about-timeline-year { width: 68px; }
          .stat-border-right { border-right: 1px solid rgba(255,255,255,0.12) !important; border-bottom: none !important; }
          .stat-border-right:last-child { border-right: none !important; }
        }

        @media (min-width: 1024px) {
          .about-values-grid { grid-template-columns: repeat(4, 1fr); }
        }
      `}</style>
  )
}