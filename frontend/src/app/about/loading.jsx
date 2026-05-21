export default function AboutLoading() {
  return (
    <div style={{ background: '#f2fdea', minHeight: '100vh' }}>
      <style>{`
        @keyframes shimmer {
          0%   { background-position: -800px 0; }
          100% { background-position:  800px 0; }
        }
        .sk {
          background: linear-gradient(90deg, #e4f5da 25%, #f0fae6 50%, #e4f5da 75%);
          background-size: 800px 100%;
          animation: shimmer 1.6s infinite linear;
          border-radius: 8px;
        }
        .sk-white {
          background: linear-gradient(90deg, #efefef 25%, #f8f8f8 50%, #efefef 75%);
          background-size: 800px 100%;
          animation: shimmer 1.6s infinite linear;
          border-radius: 8px;
        }
        .sk-dark {
          background: linear-gradient(90deg, rgba(255,255,255,0.12) 25%, rgba(255,255,255,0.22) 50%, rgba(255,255,255,0.12) 75%);
          background-size: 800px 100%;
          animation: shimmer 1.6s infinite linear;
          border-radius: 8px;
        }

        /* responsive grids — mirror AboutStyles exactly */
        .sk-stats-grid  { display: grid; grid-template-columns: repeat(2, 1fr); }
        .sk-values-grid { display: grid; grid-template-columns: 1fr; gap: 10px; }
        .sk-farms-grid  { display: grid; grid-template-columns: 1fr; gap: 10px; }
        .sk-team-grid   { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }

        @media (min-width: 768px) {
          .sk-stats-grid  { grid-template-columns: repeat(4, 1fr); }
          .sk-values-grid { grid-template-columns: repeat(2, 1fr); gap: 16px; }
          .sk-farms-grid  { grid-template-columns: repeat(3, 1fr); gap: 14px; }
          .sk-team-grid   { grid-template-columns: repeat(4, 1fr); gap: 16px; }
        }
        @media (min-width: 1024px) {
          .sk-values-grid { grid-template-columns: repeat(4, 1fr); }
        }
      `}</style>

      {/* ── HERO ── */}
      <section style={{ background: '#fff', borderBottom: '1px solid rgba(188,202,193,0.2)', padding: 'clamp(36px, 5vw, 52px) clamp(20px, 4vw, 32px)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          {/* eyebrow */}
          <div className="sk-white" style={{ height: '11px', width: '80px', marginBottom: '18px' }} />
          {/* h1 line 1 */}
          <div className="sk-white" style={{ height: 'clamp(28px, 5vw, 48px)', width: 'min(480px, 80%)', marginBottom: '12px' }} />
          {/* h1 line 2 */}
          <div className="sk-white" style={{ height: 'clamp(28px, 5vw, 48px)', width: 'min(340px, 60%)', marginBottom: '22px' }} />
          {/* body text lines */}
          {[100, 95, 72].map((w, i) => (
            <div key={i} className="sk-white" style={{ height: '14px', width: `min(${w}%, 560px)`, marginBottom: '8px' }} />
          ))}
          {/* buttons */}
          <div style={{ display: 'flex', gap: '12px', marginTop: '24px', flexWrap: 'wrap' }}>
            <div className="sk-white" style={{ height: '44px', width: '160px', borderRadius: '12px' }} />
            <div className="sk-white" style={{ height: '44px', width: '130px', borderRadius: '12px' }} />
          </div>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <section style={{ background: '#00694c' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 20px' }}>
          <div className="sk-stats-grid">
            {[...Array(4)].map((_, i) => (
              <div key={i} style={{ padding: '28px 24px', borderRight: i < 3 ? '1px solid rgba(255,255,255,0.12)' : 'none' }}>
                <div className="sk-dark" style={{ height: '36px', width: '72px', marginBottom: '8px' }} />
                <div className="sk-dark" style={{ height: '12px', width: '100px' }} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MISSION ── */}
      <section style={{ background: '#fff', padding: 'clamp(40px, 5vw, 60px) clamp(20px, 4vw, 32px)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          {/* eyebrow */}
          <div className="sk-white" style={{ height: '11px', width: '90px', marginBottom: '14px' }} />
          {/* heading */}
          <div className="sk-white" style={{ height: '32px', width: 'min(380px, 70%)', marginBottom: '18px' }} />
          {/* body lines */}
          {[100, 96, 88, 100, 92].map((w, i) => (
            <div key={i} className="sk-white" style={{ height: '13px', width: `min(${w}%, 520px)`, marginBottom: '8px' }} />
          ))}
          {/* bullet points */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '20px' }}>
            {[...Array(3)].map((_, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div className="sk-white" style={{ width: '20px', height: '20px', borderRadius: '50%', flexShrink: 0 }} />
                <div className="sk-white" style={{ height: '13px', width: `min(${[75, 65, 55][i]}%, 400px)` }} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── VALUES ── */}
      <section style={{ background: '#f2fdea', padding: 'clamp(40px, 5vw, 60px) clamp(20px, 4vw, 32px)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          {/* section header */}
          <div style={{ textAlign: 'center', marginBottom: '36px' }}>
            <div className="sk" style={{ height: '11px', width: '110px', margin: '0 auto 12px' }} />
            <div className="sk" style={{ height: '28px', width: '160px', margin: '0 auto' }} />
          </div>
          <div className="sk-values-grid">
            {[...Array(4)].map((_, i) => (
              <div key={i} style={{ background: '#fff', borderRadius: '16px', padding: '24px 18px', border: '1px solid rgba(188,202,193,0.2)' }}>
                <div className="sk-white" style={{ width: '48px', height: '48px', borderRadius: '12px', marginBottom: '16px' }} />
                <div className="sk-white" style={{ height: '14px', width: '75%', marginBottom: '10px' }} />
                {[100, 90, 80].map((w, j) => (
                  <div key={j} className="sk-white" style={{ height: '11px', width: `${w}%`, marginBottom: '6px' }} />
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TIMELINE ── */}
      <section style={{ background: '#fff', padding: 'clamp(40px, 5vw, 60px) clamp(20px, 4vw, 32px)' }}>
        <div style={{ maxWidth: '860px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '36px' }}>
            <div className="sk-white" style={{ height: '11px', width: '100px', margin: '0 auto 12px' }} />
            <div className="sk-white" style={{ height: '28px', width: '140px', margin: '0 auto' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', paddingLeft: '20px' }}>
            {[...Array(5)].map((_, i) => (
              <div key={i} style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                <div className="sk-white" style={{ width: '44px', height: '14px', flexShrink: 0, marginTop: '3px' }} />
                <div className="sk-white" style={{ width: '12px', height: '12px', borderRadius: '50%', flexShrink: 0, marginTop: '1px' }} />
                <div style={{ flex: 1 }}>
                  <div className="sk-white" style={{ height: '13px', width: `${[85, 70, 90, 75, 60][i]}%`, marginBottom: '6px' }} />
                  <div className="sk-white" style={{ height: '13px', width: `${[55, 40, 60, 45, 35][i]}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FARM PARTNERS ── */}
      <section style={{ background: '#f2fdea', padding: 'clamp(40px, 5vw, 60px) clamp(20px, 4vw, 32px)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div className="sk" style={{ height: '11px', width: '110px', marginBottom: '12px' }} />
          <div className="sk" style={{ height: '28px', width: 'min(260px, 60%)', marginBottom: '28px' }} />
          <div className="sk-farms-grid">
            {[...Array(6)].map((_, i) => (
              <div key={i} style={{ background: '#fff', borderRadius: '14px', padding: '18px', border: '1px solid rgba(188,202,193,0.2)', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div className="sk-white" style={{ width: '44px', height: '44px', borderRadius: '12px', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div className="sk-white" style={{ height: '13px', width: '70%', marginBottom: '6px' }} />
                  <div className="sk-white" style={{ height: '11px', width: '45%', marginBottom: '6px' }} />
                  <div className="sk-white" style={{ height: '11px', width: '80%' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TEAM ── */}
      <section style={{ background: '#fff', padding: 'clamp(40px, 5vw, 60px) clamp(20px, 4vw, 32px)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '36px' }}>
            <div className="sk-white" style={{ height: '11px', width: '110px', margin: '0 auto 12px' }} />
            <div className="sk-white" style={{ height: '28px', width: '160px', margin: '0 auto' }} />
          </div>
          <div className="sk-team-grid">
            {[...Array(4)].map((_, i) => (
              <div key={i} style={{ background: '#f2fdea', borderRadius: '16px', padding: '24px 16px', textAlign: 'center', border: '1px solid rgba(188,202,193,0.2)' }}>
                <div className="sk" style={{ width: '60px', height: '60px', borderRadius: '50%', margin: '0 auto 14px' }} />
                <div className="sk" style={{ height: '13px', width: '70%', margin: '0 auto 8px' }} />
                <div className="sk" style={{ height: '11px', width: '55%', margin: '0 auto 8px' }} />
                <div className="sk" style={{ height: '10px', width: '40%', margin: '0 auto' }} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── LEFTOVER PACK ── */}
      <section style={{ background: '#00694c', padding: 'clamp(40px, 5vw, 60px) clamp(20px, 4vw, 32px)' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
          <div className="sk-dark" style={{ width: '52px', height: '52px', borderRadius: '14px', margin: '0 auto 18px' }} />
          <div className="sk-dark" style={{ height: '28px', width: 'min(320px, 70%)', margin: '0 auto 14px' }} />
          {[100, 90, 60].map((w, i) => (
            <div key={i} className="sk-dark" style={{ height: '13px', width: `min(${w}%, 560px)`, margin: '0 auto 8px' }} />
          ))}
          <div className="sk-dark" style={{ height: '44px', width: '220px', borderRadius: '12px', margin: '24px auto 0' }} />
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ background: '#f2fdea', padding: 'clamp(40px, 5vw, 60px) clamp(20px, 4vw, 32px)' }}>
        <div style={{ maxWidth: '700px', margin: '0 auto', textAlign: 'center' }}>
          <div className="sk" style={{ height: '28px', width: 'min(300px, 70%)', margin: '0 auto 14px' }} />
          {[90, 75].map((w, i) => (
            <div key={i} className="sk" style={{ height: '13px', width: `min(${w}%, 480px)`, margin: '0 auto 8px' }} />
          ))}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '24px', flexWrap: 'wrap' }}>
            <div className="sk" style={{ height: '48px', width: '160px', borderRadius: '12px' }} />
            <div className="sk" style={{ height: '48px', width: '140px', borderRadius: '12px' }} />
          </div>
        </div>
      </section>

    </div>
  )
}