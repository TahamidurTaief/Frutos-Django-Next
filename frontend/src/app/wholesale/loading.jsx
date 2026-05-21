// src/app/wholesale/loading.jsx
// Shown by Next.js while the server component fetches data.
// Matches the visual weight of the actual page so there's no layout shift.

export default function WholesaleLoading() {
  return (
    <>
      <style>{`
        @keyframes ws-shimmer {
          0%   { background-position: -600px 0; }
          100% { background-position:  600px 0; }
        }
        .ws-skel {
          background: linear-gradient(90deg, #f0f4f1 25%, #e4ece6 50%, #f0f4f1 75%);
          background-size: 600px 100%;
          animation: ws-shimmer 1.4s ease infinite;
          border-radius: 8px;
        }
        .ws-skel-dark {
          background: linear-gradient(90deg, #0f2318 25%, #163320 50%, #0f2318 75%);
          background-size: 600px 100%;
          animation: ws-shimmer 1.4s ease infinite;
          border-radius: 8px;
        }
      `}</style>

      {/* ── Hero skeleton ─────────────────────────────────────────────── */}
      <section style={{ background: '#fff', padding: '0 40px', minHeight: '88vh', display: 'flex', alignItems: 'center' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px', padding: '56px 0' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="ws-skel" style={{ height: '14px', width: '120px' }} />
            <div className="ws-skel" style={{ height: '52px', width: '90%' }} />
            <div className="ws-skel" style={{ height: '52px', width: '70%' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
              <div className="ws-skel" style={{ height: '16px', width: '100%' }} />
              <div className="ws-skel" style={{ height: '16px', width: '85%' }} />
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '14px' }}>
              <div className="ws-skel" style={{ height: '44px', width: '180px', borderRadius: '11px' }} />
              <div className="ws-skel" style={{ height: '44px', width: '140px', borderRadius: '11px' }} />
            </div>
          </div>
          <div className="ws-skel" style={{ height: '400px', borderRadius: '20px' }} />
        </div>
      </section>

      {/* ── Stats skeleton ─────────────────────────────────────────────── */}
      <section style={{ background: '#071a10', padding: '0 40px' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)' }}>
          {[...Array(4)].map((_, i) => (
            <div key={i} style={{ padding: '28px', borderLeft: i > 0 ? '1px solid rgba(255,255,255,0.06)' : 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div className="ws-skel-dark" style={{ height: '32px', width: '32px' }} />
              <div className="ws-skel-dark" style={{ height: '36px', width: '80px' }} />
              <div className="ws-skel-dark" style={{ height: '14px', width: '120px' }} />
              <div className="ws-skel-dark" style={{ height: '12px', width: '100px' }} />
            </div>
          ))}
        </div>
      </section>

      {/* ── Benefits skeleton ──────────────────────────────────────────── */}
      <section style={{ background: '#fff', padding: '56px 40px' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ marginBottom: '40px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div className="ws-skel" style={{ height: '12px', width: '100px' }} />
            <div className="ws-skel" style={{ height: '36px', width: '380px' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px' }}>
            {[...Array(6)].map((_, i) => (
              <div key={i} style={{ background: '#F7FAF8', borderRadius: '14px', padding: '22px 20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div className="ws-skel" style={{ height: '42px', width: '42px', borderRadius: '11px' }} />
                <div className="ws-skel" style={{ height: '14px', width: '140px' }} />
                <div className="ws-skel" style={{ height: '12px', width: '100%' }} />
                <div className="ws-skel" style={{ height: '12px', width: '85%' }} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Categories skeleton ────────────────────────────────────────── */}
      <section style={{ background: '#F7FAF8', padding: '64px 40px' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ marginBottom: '36px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div className="ws-skel" style={{ height: '12px', width: '80px' }} />
            <div className="ws-skel" style={{ height: '36px', width: '200px' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '14px' }}>
            {[...Array(6)].map((_, i) => (
              <div key={i} style={{ background: '#fff', borderRadius: '14px', padding: '20px 18px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div className="ws-skel" style={{ height: '40px', width: '40px', borderRadius: '10px' }} />
                  <div className="ws-skel" style={{ height: '22px', width: '70px', borderRadius: '100px' }} />
                </div>
                <div className="ws-skel" style={{ height: '14px', width: '130px' }} />
                <div className="ws-skel" style={{ height: '12px', width: '100%' }} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works skeleton ──────────────────────────────────────── */}
      <section style={{ background: '#fff', padding: '56px 40px' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', marginBottom: '48px' }}>
            <div className="ws-skel" style={{ height: '12px', width: '100px' }} />
            <div className="ws-skel" style={{ height: '40px', width: '420px' }} />
            <div className="ws-skel" style={{ height: '40px', width: '320px' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '0' }}>
            {[...Array(4)].map((_, i) => (
              <div key={i} style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                <div className="ws-skel" style={{ height: '72px', width: '72px', borderRadius: '50%' }} />
                <div className="ws-skel" style={{ height: '12px', width: '60px' }} />
                <div className="ws-skel" style={{ height: '16px', width: '120px' }} />
                <div className="ws-skel" style={{ height: '12px', width: '140px' }} />
                <div className="ws-skel" style={{ height: '12px', width: '110px' }} />
              </div>
            ))}
          </div>
          <div className="ws-skel" style={{ marginTop: '44px', height: '88px', borderRadius: '14px' }} />
        </div>
      </section>
    </>
  )
}