// src/app/wholesale/profile/_shared/Card.jsx
export default function Card({ title, icon, children }) {
  return (
    <div style={{ background: 'white', borderRadius: 16, border: '1px solid #E8F0EA', overflow: 'hidden' }}>
      <div style={{
        padding: '14px 18px', borderBottom: '1px solid #F0F5F2',
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <span style={{ color: '#00694C', flexShrink: 0 }}>{icon}</span>
        <h2 style={{
          fontFamily: '"Playfair Display", Georgia, serif',
          fontSize: 16, fontWeight: 700, color: '#151E13', margin: 0,
        }}>{title}</h2>
      </div>
      <div style={{ padding: '18px' }}>{children}</div>
    </div>
  )
}