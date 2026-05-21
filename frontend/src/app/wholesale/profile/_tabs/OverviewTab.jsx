// src/app/wholesale/profile/_tabs/OverviewTab.jsx
import Card from '../_shared/Card'
import { StatBox } from '../_shared/StatBox'

const VOLUME_LABELS = {
  '400_1000':  '€400 – €1,000 / month',
  '1000_3000': '€1,000 – €3,000 / month',
  '3000_7000': '€3,000 – €7,000 / month',
  '7000_plus': '€7,000+ / month',
}

export default function OverviewTab({ profile, orders }) {
  return (
    <>
      {/* Stats — always 3 cols, compact on mobile */}
      <div className="grid grid-cols-3 gap-3">
        <StatBox label="Total Orders" value={orders.length} />
        <StatBox
          label="Total Spent"
          value={`€${Number(profile.total_spent || 0).toLocaleString('de-DE', { minimumFractionDigits: 2 })}`}
        />
        <StatBox
          label="Monthly Vol."
          value={VOLUME_LABELS[profile.monthly_volume]?.split('/')[0]?.trim() || '—'}
          sub="estimated"
        />
      </div>

      {/* Details + Manager — 1 col on mobile, 2 on md+ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Card title="Account Details" icon={
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z" />
          </svg>
        }>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
            {[
              { label: 'Business', value: profile.business_name },
              { label: 'Contact',  value: profile.contact_name },
              { label: 'Email',    value: profile.email },
              { label: 'Phone',    value: profile.phone || '—' },
              { label: 'Postcode', value: profile.postcode || '—' },
              { label: 'Type',     value: profile.display_business_type || '—' },
            ].map(({ label, value }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, gap: 8 }}>
                <span style={{ color: '#6D7A73', fontWeight: 500, flexShrink: 0 }}>{label}</span>
                <span style={{ color: '#151E13', fontWeight: 600, textAlign: 'right', wordBreak: 'break-word', maxWidth: '60%' }}>{value}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Account Manager" icon={
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
            <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8 19.79 19.79 0 01.22 1.18 2 2 0 012.22 0h3a2 2 0 012 1.72A12.84 12.84 0 007.5 4.5a2 2 0 01-.45 2.11L5.91 7.74a16 16 0 006.29 6.29l1.13-1.14a2 2 0 012.11-.45 12.84 12.84 0 002.81.76A2 2 0 0122 14.92z" />
          </svg>
        }>
          {profile.account_manager_name ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <div style={{
                  width: 42, height: 42, borderRadius: '50%', flexShrink: 0,
                  background: 'linear-gradient(135deg,#00694C,#1D9E75)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <span style={{ color: 'white', fontWeight: 700, fontSize: 15 }}>
                    {profile.account_manager_name[0]}
                  </span>
                </div>
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontWeight: 700, color: '#151E13', fontSize: 14, margin: 0 }}>{profile.account_manager_name}</p>
                  <p style={{ color: '#6D7A73', fontSize: 12, margin: '2px 0 0', wordBreak: 'break-all' }}>{profile.account_manager_email}</p>
                </div>
              </div>
              <a href={`mailto:${profile.account_manager_email}`} style={{
                display: 'inline-flex', alignItems: 'center', gap: 7,
                background: '#E7F1DF', color: '#00694C', borderRadius: 8,
                padding: '8px 14px', fontSize: 13, fontWeight: 600, textDecoration: 'none',
                width: 'fit-content',
              }}>
                <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                Send Email
              </a>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '24px 0', color: '#9DAAA3' }}>
              <p style={{ fontSize: 13, margin: 0 }}>
                {profile.status === 'pending'
                  ? 'Assigned after approval.'
                  : 'No account manager yet.'}
              </p>
            </div>
          )}
        </Card>
      </div>

      {/* Dates */}
      {(profile.applied_at || profile.approved_at) && (
        <div style={{
          background: 'white', borderRadius: 12, border: '1px solid #E8F0EA',
          padding: '14px 18px', display: 'flex', gap: 24, flexWrap: 'wrap',
        }}>
          {profile.applied_at && (
            <div>
              <p style={{ fontSize: 11, fontWeight: 600, color: '#6D7A73', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 3px' }}>Applied</p>
              <p style={{ fontSize: 13, color: '#151E13', margin: 0, fontWeight: 500 }}>
                {new Date(profile.applied_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
          )}
          {profile.approved_at && (
            <div>
              <p style={{ fontSize: 11, fontWeight: 600, color: '#00694C', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 3px' }}>Approved</p>
              <p style={{ fontSize: 13, color: '#151E13', margin: 0, fontWeight: 500 }}>
                {new Date(profile.approved_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
          )}
        </div>
      )}
    </>
  )
}