export default function FarmPartnersSection({ farms }) {
  return (
    <section className="about-section-pad" style={{ background: '#f2fdea' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        <div style={{ marginBottom: '36px' }}>
          <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#00694c', display: 'block', marginBottom: '10px' }}>
            Where it comes from
          </span>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <h2 className="about-h2" style={{ fontFamily: '"Playfair Display", Georgia, serif', fontWeight: 700, color: '#151e13', lineHeight: 1.2 }}>
              Our farm partners
            </h2>
            {/* <p style={{ fontSize: '13px', color: '#6D7A73', maxWidth: '260px', lineHeight: 1.6 }}>
              A selection of the growers we work with — every one personally visited and vetted.
            </p> */}
          </div>
        </div>
        <div className="about-farms-grid">
          {farms.map((f, i) => (
            <div key={i} style={{
              background: '#fff', borderRadius: '14px', padding: '20px',
              border: '1px solid rgba(188,202,193,0.2)',
              display: 'flex', alignItems: 'flex-start', gap: '14px',
            }}>
              <div style={{
                width: '44px', height: '44px', borderRadius: '12px',
                background: '#E7F1DF', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#00694c" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 8C8 10 5.9 16.17 3.82 19.3A10 10 0 0 0 19 5c-1-1-2-1.71-2-1.71V8z"/>
                  <path d="M3.82 19.3C4 18 5 13 9 11"/>
                </svg>
              </div>
              <div>
                <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#151e13', marginBottom: '3px' }}>{f.name}</h3>
                <p style={{ fontSize: '12px', color: '#00694c', fontWeight: 600, marginBottom: '3px' }}>{f.region}</p>
                <p style={{ fontSize: '12px', color: '#9aada3', fontStyle: 'italic', fontFamily: '"Newsreader", Georgia, serif' }}>{f.specialty}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}