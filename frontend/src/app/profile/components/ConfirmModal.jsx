export default function ConfirmModal({ onConfirm, onCancel }) {
  return (
    <div onClick={onCancel} style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: 'rgba(0,0,0,0.35)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: '#fff', borderRadius: '20px',
        padding: '28px 28px 24px', width: '320px',
        boxShadow: '0 20px 60px rgba(0,0,0,.18)',
      }}>
        <div style={{
          width: '48px', height: '48px', borderRadius: '50%',
          background: '#FEE2E2',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 16px',
        }}>
          <span className="material-symbols-outlined"
            style={{ color: '#BA1A1A', fontSize: '24px', fontVariationSettings: "'FILL' 1" }}>
            delete
          </span>
        </div>
        <h3 style={{ textAlign: 'center', fontSize: '16px', fontWeight: 700, color: '#151e13', margin: '0 0 8px' }}>
          Delete Notification?
        </h3>
        <p style={{ textAlign: 'center', fontSize: '13px', color: '#6d7a73', margin: '0 0 24px', lineHeight: 1.5 }}>
          This notification will be permanently removed and cannot be recovered.
        </p>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={onCancel} style={{ flex: 1, padding: '11px', borderRadius: '12px', background: '#f0f4f0', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: 600, color: '#6d7a73' }}>
            Cancel
          </button>
          <button onClick={onConfirm} style={{ flex: 1, padding: '11px', borderRadius: '12px', background: '#BA1A1A', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: 600, color: 'white' }}>
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}