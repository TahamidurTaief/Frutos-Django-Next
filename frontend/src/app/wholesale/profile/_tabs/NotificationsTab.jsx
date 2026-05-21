// src/app/wholesale/profile/_tabs/NotificationsTab.jsx
import Card from '../_shared/Card'

export default function NotificationsTab({ notifications, unreadCount, onMarkAllRead, onDelete }) {
  return (
    <Card title="Notifications" icon={
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" />
      </svg>
    }>
      {notifications.length > 0 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          {unreadCount > 0 && (
            <button onClick={onMarkAllRead}  style={{
              fontSize: 12.5, color: '#00694C', fontWeight: 600,
              background: 'none', border: 'none', cursor: 'pointer',
              padding: 0, fontFamily: 'inherit',
            }}>
              Mark all as read
            </button>
          )}
          <span style={{ fontSize: 12, color: '#9DAAA3', marginLeft: 'auto' }}>
            {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
          </span>
        </div>
      )}

      {notifications.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '32px 0', color: '#9DAAA3' }}>
          <svg width="34" height="34" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"
            style={{ margin: '0 auto 12px', display: 'block' }}>
            <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" />
          </svg>
          <p style={{ fontSize: 13.5, margin: 0 }}>No notifications yet.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {notifications.map(n => (
            <div key={n.id} style={{
              display: 'flex', gap: 10, padding: '13px 10px',
              borderBottom: '1px solid #F0F5F2',
              background: n.is_read ? 'transparent' : '#F7FCF9',
              borderRadius: 10, alignItems: 'flex-start',
            }}>
              <div style={{
                width: 7, height: 7, borderRadius: '50%',
                background: n.is_read ? 'transparent' : '#10B981',
                flexShrink: 0, marginTop: 6,
              }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontWeight: 600, fontSize: 13.5, color: '#151E13', margin: '0 0 3px' }}>{n.title}</p>
                <p style={{ fontSize: 13, color: '#6D7A73', margin: '0 0 5px', lineHeight: 1.5 }}>{n.message}</p>
                <p style={{ fontSize: 11, color: '#9DAAA3', margin: 0 }}>
                  {new Date(n.created_at).toLocaleDateString('en-GB', {
                    day: 'numeric', month: 'short', year: 'numeric',
                    hour: '2-digit', minute: '2-digit',
                  })}
                </p>
              </div>
              <button onClick={() => onDelete(n.id)} title="Remove" style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: '#BCCAC1', padding: 2, borderRadius: 6,
                display: 'flex', alignItems: 'center', flexShrink: 0,
              }}
                onMouseEnter={e => e.currentTarget.style.color = '#EF4444'}
                onMouseLeave={e => e.currentTarget.style.color = '#BCCAC1'}
              >
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <polyline points="3,6 5,6 21,6"/>
                  <path d="M19,6l-1,14H6L5,6M10,11v6M14,11v6M9,6V4h6v2"/>
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}