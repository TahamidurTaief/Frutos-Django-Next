// src/app/wholesale/profile/_shared/StatBox.jsx
export function StatBox({ label, value, sub }) {
  return (
    <div style={{
      background: '#F7FAF8', borderRadius: 12, padding: '14px 10px',
      textAlign: 'center', border: '1px solid #E8F0EA',
    }}>
      <p style={{ fontSize: 18, fontWeight: 800, color: '#085041', margin: '0 0 2px', lineHeight: 1.1, wordBreak: 'break-word' }}>{value}</p>
      <p style={{ fontSize: 10.5, fontWeight: 600, color: '#6D7A73', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
      {sub && <p style={{ fontSize: 10.5, color: '#9DAAA3', margin: '3px 0 0' }}>{sub}</p>}
    </div>
  )
}

// src/app/wholesale/profile/_shared/Field.jsx
export function Field({ label, value, name, onChange, readOnly, type = 'text', hint }) {
  return (
    <div>
      <label style={{
        display: 'block', fontSize: 11.5, fontWeight: 600, color: '#6D7A73',
        marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.05em',
      }}>{label}</label>
      <input
        type={type} name={name} value={value || ''} onChange={onChange} readOnly={readOnly}
        style={{
          width: '100%', boxSizing: 'border-box', padding: '9px 12px',
          borderRadius: 10, border: `1.5px solid ${readOnly ? '#E8F0EA' : '#C8D5CC'}`,
          background: readOnly ? '#F7FAF8' : 'white',
          fontSize: 13.5, color: readOnly ? '#9DAAA3' : '#151E13',
          outline: 'none', fontFamily: 'inherit',
          cursor: readOnly ? 'not-allowed' : 'text',
        }}
      />
      {hint && <p style={{ fontSize: 11, color: '#9DAAA3', margin: '4px 0 0' }}>{hint}</p>}
    </div>
  )
}