// src/app/wholesale/profile/_tabs/NotificationsTab.jsx
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Card from '../_shared/Card'
import StatusBadge from '../_shared/StatusBadge'
import ConfirmModal from '@/app/profile/components/ConfirmModal'

const fmt = (n) => Number(n || 0).toFixed(2)

const NOTIF_ICON_COLORS = {
  order:         '#00694C',
  order_update:  '#00694C',
  promo:         '#855000',
  price_change:  '#1976D2',
  leftover_pack: '#6D4C41',
  default:       '#6D7A73'
}

export default function NotificationsTab({ notifications, unreadCount, onMarkAllRead, onDelete, orders }) {
  const [expanded, setExpanded] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)

  const router = useRouter()

  function handleClick(notif) {
    if (notif.metadata?.ticket_id) {
      router.push(`/wholesale/profile?tab=support_tickets&ticket_id=${notif.metadata.ticket_id}`)
      return
    }
    setExpanded(p => p === notif.id ? null : notif.id)
  }

  return (
    <>
    {confirmDelete && (
      <ConfirmModal 
        onConfirm={() => { onDelete(confirmDelete); setConfirmDelete(null); }} 
        onCancel={() => setConfirmDelete(null)} 
      />
    )}
    <Card title="Notifications" icon={
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" />
      </svg>
    }>
      {notifications.length > 0 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {notifications.map(n => {
            const isExpanded = expanded === n.id
            const iconColor = NOTIF_ICON_COLORS[n.type] || NOTIF_ICON_COLORS.default
            const rawMeta = n.metadata || {}
            
            const matchedOrder = orders?.find(o => o.order_number === rawMeta.orderNumber)
            
            const meta = matchedOrder ? {
              orderNumber: matchedOrder.order_number || rawMeta.orderNumber,
              status: matchedOrder.status || rawMeta.status,
              customerName: matchedOrder.customer_name || rawMeta.customerName,
              street: matchedOrder.street_address || rawMeta.street,
              city: matchedOrder.city || rawMeta.city,
              postcode: matchedOrder.postcode || rawMeta.postcode,
              subtotal: matchedOrder.cart_subtotal ?? matchedOrder.subtotal ?? rawMeta.subtotal,
              deliveryFee: matchedOrder.delivery_fee ?? rawMeta.deliveryFee,
              total: matchedOrder.total_amount ?? rawMeta.total,
              items: matchedOrder.items?.map(i => ({
                product_name: i.product_name,
                product_image: i.product_image,
                quantity: i.quantity,
                unit_price: i.unit_price,
              })) || rawMeta.items
            } : rawMeta

            return (
              <div key={n.id} style={{
                border: `1px solid ${n.is_read ? '#eaeaea' : '#B3E5D0'}`,
                borderRadius: '12px', overflow: 'hidden',
                display: 'flex', flexDirection: 'column'
              }}>
                <div 
                  onClick={() => handleClick(n)}
                  style={{
                    display: 'flex', gap: 12, padding: '16px',
                    background: n.is_read ? '#fff' : '#F0FAF5',
                    cursor: 'pointer', alignItems: 'flex-start',
                    flex: 1
                  }}>
                  
                  <div style={{
                    width: 40, height: 40, borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    background: `${iconColor}18`
                  }}>
                    <span className="material-symbols-outlined" style={{ color: iconColor, fontSize: '20px', fontVariationSettings: "'FILL' 1" }}>
                      {rawMeta.icon || 'notifications'}
                    </span>
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                      <p style={{ fontWeight: 700, fontSize: 14, color: '#151E13', margin: '0 0 4px' }}>
                        {n.title.replace(/[\u{1F300}-\u{1F9FF}\u{2700}-\u{27BF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}]/gu, '').trim()}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                        {!n.is_read && <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#00694C' }} />}
                        <span className="material-symbols-outlined" style={{ 
                          color: '#BCCAC1', fontSize: '18px', 
                          transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', 
                          transition: 'transform 0.2s' 
                        }}>
                          expand_more
                        </span>
                      </div>
                    </div>
                    
                    <p style={{ fontSize: 13, color: '#6D7A73', margin: '0 0 6px', lineHeight: 1.5 }}>
                      {n.message}
                    </p>
                    
                    <p style={{ fontSize: 11, color: '#BCCAC1', margin: 0 }}>
                      {new Date(n.created_at).toLocaleDateString('en-GB', {
                        day: 'numeric', month: 'short', year: 'numeric',
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </p>
                  </div>

                  <button onClick={(e) => { e.stopPropagation(); setConfirmDelete(n.id); }} title="Remove" style={{
                    background: 'none', border: '1px solid #BCCAC1', cursor: 'pointer',
                    color: '#6D7A73', padding: '6px 12px', borderRadius: 8,
                    display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0,
                    fontSize: '12px', fontWeight: 600,
                    transition: 'all 0.15s ease'
                  }}
                    onMouseEnter={e => { e.currentTarget.style.color = '#BA1A1A'; e.currentTarget.style.borderColor = '#FEE2E2'; e.currentTarget.style.background = '#FEE2E2'; }}
                    onMouseLeave={e => { e.currentTarget.style.color = '#6D7A73'; e.currentTarget.style.borderColor = '#BCCAC1'; e.currentTarget.style.background = 'transparent'; }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>delete</span>
                    Remove
                  </button>
                </div>

                {isExpanded && (n.type === 'order' || n.type === 'order_update') && (
                  <div style={{ borderTop: '1px solid #E8F5EE', background: '#FAFDF9' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', borderBottom: '1px solid #E8F5EE' }}>
                      <span style={{ fontFamily: 'monospace', fontSize: 12, fontWeight: 700, color: '#3D4943' }}>
                        {meta.orderNumber || '—'}
                      </span>
                      {meta.status && <StatusBadge status={meta.status} />}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
                      <div style={{ padding: '16px', borderRight: '1px solid #E8F5EE', borderBottom: '1px solid #E8F5EE' }}>
                        <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: '#6D7A73', margin: '0 0 10px' }}>
                          Customer Details
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          {meta.customerName && <p style={{ fontSize: 12, color: '#3D4943', margin: 0 }}>{meta.customerName}</p>}
                          {meta.street && <p style={{ fontSize: 12, color: '#3D4943', margin: 0 }}>{meta.street}, {meta.city} {meta.postcode}</p>}
                        </div>
                      </div>

                      <div style={{ padding: '16px', borderBottom: '1px solid #E8F5EE' }}>
                        <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: '#6D7A73', margin: '0 0 10px' }}>
                          Order Summary
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          {meta.subtotal != null && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#6D7A73' }}>
                              <span>Subtotal</span><span>€{fmt(meta.subtotal)}</span>
                            </div>
                          )}
                          {meta.deliveryFee != null && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#6D7A73' }}>
                              <span>Delivery</span><span>{Number(meta.deliveryFee) === 0 ? 'Free' : `€${fmt(meta.deliveryFee)}`}</span>
                            </div>
                          )}
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, fontWeight: 700, marginTop: '6px', paddingTop: '6px', borderTop: '1px solid #E0EEE8' }}>
                            <span style={{ color: '#151E13' }}>Total</span>
                            <span style={{ color: '#855000' }}>€{fmt(meta.total)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {meta.items?.length > 0 && (
                      <div style={{ padding: '16px 20px' }}>
                        <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: '#6D7A73', margin: '0 0 10px' }}>
                          Items
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {meta.items.map((item, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              {item.product_image ? (
                                <img 
                                  src={item.product_image} 
                                  alt={item.product_name} 
                                  style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: '6px', backgroundColor: '#F0F4F0' }} 
                                />
                              ) : (
                                <div style={{ width: 40, height: 40, borderRadius: '6px', backgroundColor: '#F0F4F0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                  <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#BCCAC1' }}>inventory_2</span>
                                </div>
                              )}
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <p style={{ fontSize: 12, fontWeight: 600, color: '#151E13', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  {item.product_name}
                                </p>
                                <p style={{ fontSize: 10, color: '#6D7A73', margin: 0 }}>
                                  {item.quantity} × €{fmt(item.unit_price)}
                                </p>
                              </div>
                              <p style={{ fontSize: 12, fontWeight: 700, color: '#855000', margin: 0 }}>
                                €{fmt(item.quantity * item.unit_price)}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                {isExpanded && n.type !== 'order' && n.type !== 'order_update' && (
                  <div style={{ padding: '16px 20px', borderTop: '1px solid #E8F5EE', background: '#FAFDF9' }}>
                    <p style={{ fontSize: 13, color: '#3D4943', margin: 0, lineHeight: 1.6 }}>{n.message}</p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </Card>
    </>
  )
}