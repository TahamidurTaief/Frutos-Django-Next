const STATUS_CONFIG = {
  pending:          { label: 'Pending',         color: '#6D7A73', bg: '#F0F0F0' },
  confirmed:        { label: 'Confirmed',        color: '#00694C', bg: '#D4EDE5' },
  preparing:        { label: 'Preparing',        color: '#855000', bg: '#FEF3C7' },
  out_for_delivery: { label: 'Out for Delivery', color: '#1976D2', bg: '#DBEAFE' },
  delivered:        { label: 'Delivered',        color: '#2E7D32', bg: '#D4EDE5' },
  cancelled:        { label: 'Cancelled',        color: '#BA1A1A', bg: '#FEE2E2' },
}

export default function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending
  return (
    <span style={{
      background: cfg.bg, color: cfg.color,
      fontSize: '11px', fontWeight: 700,
      padding: '3px 10px', borderRadius: '99px',
      letterSpacing: '0.05em', textTransform: 'uppercase',
      whiteSpace: 'nowrap',
    }}>
      {cfg.label}
    </span>
  )
}