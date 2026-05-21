import Link from 'next/link'

export default function CTASection() {
  return (
    <section className="about-section-pad" style={{ background: '#f2fdea' }}>
      <div style={{ maxWidth: '700px', margin: '0 auto', textAlign: 'center' }}>
        <h2 className="about-h2" style={{ fontFamily: '"Playfair Display", Georgia, serif', fontWeight: 700, color: '#151e13', lineHeight: 1.2, marginBottom: '14px' }}>
          Ready to taste the difference?
        </h2>
        <p style={{ fontSize: '15px', color: '#6D7A73', lineHeight: 1.8, marginBottom: '32px' }}>
          Whether you shop online or visit one of our stores, every product carries our promise — fresh, honest, and grown with care.
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/shop" style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            padding: '14px 28px', borderRadius: '12px', fontWeight: 700,
            fontSize: '14px', color: '#fff', textDecoration: 'none',
            background: 'linear-gradient(135deg, #00694c 0%, #008560 100%)',
            boxShadow: '0 4px 16px rgba(0,105,76,0.25)',
          }}>
            Shop All Produce
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </Link>
          <Link href="/stores" style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            padding: '14px 28px', borderRadius: '12px', fontWeight: 700,
            fontSize: '14px', color: '#151e13', textDecoration: 'none',
            background: '#ECF7E4', border: '1px solid rgba(0,105,76,0.12)',
          }}>
            Find Our Stores
          </Link>
        </div>
      </div>
    </section>
  )
}