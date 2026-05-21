export default function WeekendBox() {
  return (
    <>
      {/* ── Mobile: Weekend Box banner ── */}
      <section
        className="md:hidden mx-4 my-6 rounded-2xl overflow-hidden"
        style={{
          backgroundColor: '#174D3A',
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      >
        <div className="px-7 pt-10 pb-9">
          <h2
            className="text-white mb-3"
            style={{
              fontFamily: '"Playfair Display", Georgia, serif',
              fontSize: '1.85rem',
              fontWeight: 700,
              lineHeight: 1.2,
            }}
          >
            Weekend Box
          </h2>
          <p
            className="mb-7"
            style={{
              color: 'rgba(255,255,255,0.62)',
              fontSize: '13.5px',
              lineHeight: 1.65,
              maxWidth: '260px',
            }}
          >
            Curated selection of seasonal greens delivered every Saturday.
          </p>
          <a
            href="#"
            className="inline-block rounded-lg font-semibold"
            style={{
              border: '1.5px solid rgba(255,255,255,0.55)',
              color: '#ffffff',
              fontSize: '13px',
              letterSpacing: '0.06em',
              padding: '12px 28px',
              background: 'rgba(255,255,255,0.08)',
            }}
          >
            PRE-ORDER NOW
          </a>
        </div>
      </section>

      {/* ── Desktop: this component is invisible — LeftoverPackBanner handles desktop ── */}
    </>
  )
}