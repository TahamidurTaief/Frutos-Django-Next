export default function TimelineSection({ milestones }) {
  return (
    <section className="about-section-pad-white">
      <div style={{ maxWidth: '860px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '44px' }}>
          <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#00694c', display: 'block', marginBottom: '10px' }}>
            How we got here
          </span>
          <h2 className="about-h2" style={{ fontFamily: '"Playfair Display", Georgia, serif', fontWeight: 700, color: '#151e13', lineHeight: 1.2 }}>
            Our journey
          </h2>
        </div>
        <div style={{ position: 'relative' }}>
          {/* Vertical line */}
          <div className="about-timeline-line" style={{ position: 'absolute', top: '8px', bottom: '8px', width: '1px', background: 'rgba(188,202,193,0.4)' }} />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {milestones.map((m, i) => (
              <div key={i} style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', paddingBottom: i < milestones.length - 1 ? '32px' : '0' }}>
                {/* Year */}
                <div className="about-timeline-year" style={{ flexShrink: 0, textAlign: 'right', paddingTop: '2px' }}>
                  <span style={{ fontFamily: '"Playfair Display", Georgia, serif', fontSize: '14px', fontWeight: 700, color: '#00694c' }}>{m.year}</span>
                </div>
                {/* Dot */}
                <div style={{ flexShrink: 0, marginTop: '6px', position: 'relative', zIndex: 1 }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#00694c', border: '3px solid #fff', outline: '1px solid #00694c' }} />
                </div>
                {/* Text */}
                <p style={{ fontSize: '14px', color: '#3d4943', lineHeight: 1.65 }}>{m.event}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}