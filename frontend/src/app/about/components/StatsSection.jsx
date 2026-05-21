export default function StatsSection({ stats }) {
  return (
    <section style={{ background: '#00694c' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 20px' }}>
        <div className="about-stats-grid">
          {stats.map((s, i) => (
            <div key={i} className="stat-border-right" style={{ padding: '32px 24px' }}>
              <p style={{
                fontFamily: '"Playfair Display", Georgia, serif',
                fontSize: 'clamp(2rem, 6vw, 42px)', fontWeight: 700, color: '#fff',
                lineHeight: 1, marginBottom: '6px',
              }}>{s.value}</p>
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.65)', fontWeight: 500 }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}