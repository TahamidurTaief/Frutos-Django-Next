// src/app/wholesale/profile/_tabs/SettingsTab.jsx
import Card from '../_shared/Card'
import { Field } from '../_shared/StatBox'

export default function SettingsTab({ profile, editForm, onChange, onSave, saving, success, error }) {
  return (
    <Card title="Edit Profile" icon={
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
      </svg>
    }>
      {/* 1 col mobile → 2 col md+ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Business Name" value={profile.business_name} readOnly hint="Contact support to change." />
        <Field label="Email" value={profile.email} readOnly hint="Contact support to change." />
        <Field label="Contact Name" name="contact_name" value={editForm.contact_name} onChange={onChange} />
        <Field label="Phone" name="phone" value={editForm.phone} onChange={onChange} type="tel" />
        <Field label="Delivery Postcode" name="postcode" value={editForm.postcode} onChange={onChange} />

        {/* Volume select */}
        <div>
          <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: '#6D7A73', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Monthly Volume
          </label>
          <select name="monthly_volume" value={editForm.monthly_volume} onChange={onChange} style={{
            width: '100%', boxSizing: 'border-box', padding: '9px 12px',
            borderRadius: 10, border: '1.5px solid #C8D5CC', background: 'white',
            fontSize: 13.5, color: '#151E13', outline: 'none', fontFamily: 'inherit',
          }}>
            <option value="400_1000">€400 – €1,000 / month</option>
            <option value="1000_3000">€1,000 – €3,000 / month</option>
            <option value="3000_7000">€3,000 – €7,000 / month</option>
            <option value="7000_plus">€7,000+ / month</option>
          </select>
        </div>
      </div>

      {success && (
        <div style={{ background: '#D1FAE5', borderRadius: 10, padding: '10px 14px', marginTop: 16, fontSize: 13, color: '#065F46', display: 'flex', alignItems: 'center', gap: 8 }}>
          <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5" /></svg>
          Profile updated successfully.
        </div>
      )}
      {error && (
        <div style={{ background: '#FEE2E2', borderRadius: 10, padding: '10px 14px', marginTop: 16, fontSize: 13, color: '#991B1B' }}>
          {error}
        </div>
      )}

      <button onClick={onSave} disabled={saving} style={{
        marginTop: 20, padding: '11px 24px', background: '#00694C', color: 'white',
        border: 'none', borderRadius: 10, fontSize: 13.5, fontWeight: 700,
        cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
        opacity: saving ? 0.65 : 1,
      }}>
        {saving ? 'Saving…' : 'Save Changes'}
      </button>
    </Card>
  )
}