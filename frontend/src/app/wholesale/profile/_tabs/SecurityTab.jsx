// src/app/wholesale/profile/_tabs/SecurityTab.jsx
import Card from '../_shared/Card'
import { Field } from '../_shared/StatBox'

export default function SecurityTab({ pwForm, onChange, onSave, saving, success, error }) {
  return (
    <Card title="Change Password" icon={
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0110 0v4" />
      </svg>
    }>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 400 }}>
        {[
          { label: 'Current Password', name: 'old_password' },
          { label: 'New Password',     name: 'new_password' },
          { label: 'Confirm New',      name: 'confirm'      },
        ].map(({ label, name }) => (
          <Field key={name} label={label} name={name} type="password"
            value={pwForm[name]} onChange={onChange} />
        ))}

        {success && (
          <div style={{ background: '#D1FAE5', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#065F46', display: 'flex', alignItems: 'center', gap: 8 }}>
            <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5" /></svg>
            Password changed successfully.
          </div>
        )}
        {error && (
          <div style={{ background: '#FEE2E2', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#991B1B' }}>
            {error}
          </div>
        )}

        <button onClick={onSave} disabled={saving} style={{
          padding: '11px 24px', background: '#00694C', color: 'white',
          border: 'none', borderRadius: 10, fontSize: 13.5, fontWeight: 700,
          cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
          opacity: saving ? 0.65 : 1, width: 'fit-content',
        }}>
          {saving ? 'Changing…' : 'Update Password'}
        </button>
      </div>
    </Card>
  )
}