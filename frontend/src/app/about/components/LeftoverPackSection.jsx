import Link from 'next/link'

export default function LeftoverPackSection() {
  return (
    <section className="about-section-pad" style={{ background: '#00694c' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
        <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}>
          <svg width="26" height="26" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 8C8 10 5.9 16.17 3.82 19.3A10 10 0 0 0 19 5c-1-1-2-1.71-2-1.71V8z"/>
            <path d="M3.82 19.3C4 18 5 13 9 11"/>
          </svg>
        </div>
        <h2 className="about-h2" style={{ fontFamily: '"Playfair Display", Georgia, serif', fontWeight: 700, color: '#fff', lineHeight: 1.2, marginBottom: '16px' }}>
          The Leftover Pack programme
        </h2>
        <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.75)', lineHeight: 1.8, maxWidth: '620px', margin: '0 auto 32px' }}>
          Every day, perfectly good produce goes unsold. Our Leftover Pack bundles these items at a reduced price — saving food from waste, saving you money, and supporting farmers who grew it. It's one of our proudest initiatives.
        </p>
        <Link href="/shop" style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          padding: '13px 24px', borderRadius: '12px', fontWeight: 700,
          fontSize: '14px', color: '#00694c', textDecoration: 'none',
          background: '#fff',
        }}>
          See stores with Leftover Pack
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </Link>
      </div>
    </section>
  )
}