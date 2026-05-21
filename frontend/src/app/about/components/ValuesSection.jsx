export default function ValuesSection({ values }) {
  return (
    <section className="about-section-pad" style={{ background: '#f2fdea' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '44px' }}>
          <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#00694c', display: 'block', marginBottom: '10px' }}>
            What we stand for
          </span>
          <h2 className="about-h2" style={{ fontFamily: '"Playfair Display", Georgia, serif', fontWeight: 700, color: '#151e13', lineHeight: 1.2 }}>
            Our values
          </h2>
        </div>
        <div className="about-values-grid">
          {values.map((v, i) => (
            <div key={i} style={{
              background: '#fff', borderRadius: '16px', padding: '28px 20px',
              border: '1px solid rgba(188,202,193,0.2)',
            }}>
              <div style={{
                width: '52px', height: '52px', borderRadius: '14px',
                background: '#E7F1DF', display: 'flex', alignItems: 'center',
                justifyContent: 'center', marginBottom: '18px',
              }}>
                {v.icon}
              </div>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#151e13', marginBottom: '10px', lineHeight: 1.3 }}>
                {v.title}
              </h3>
              <p style={{ fontSize: '13px', color: '#6D7A73', lineHeight: 1.7 }}>{v.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}