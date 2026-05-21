

'use client'
// src/app/basket/components/FulfillmentSwitcher.jsx

// import { useState, useEffect } from 'react'
// import { getDeliveryOption, getNearestStore } from '@/lib/api'

const MODES = [
  { id: 'delivery', label: 'Home Delivery'   },
  { id: 'collect',  label: 'Click & Collect' },
]

// ── Skeleton ───────────────────────────────────────────────────────────────────

function PanelSkeleton() {
  return (
    <div
      className="mt-4 p-4 rounded-xl animate-pulse"
      style={{ background: '#f5f9f5', border: '1px solid #d4ede5', minHeight: 76 }}
    />
  )
}

// ── Inline error ───────────────────────────────────────────────────────────────

function InlineError({ message }) {
  return (
    <div
      className="mt-4 p-3 rounded-xl text-xs flex items-center gap-2"
      style={{ background: '#fff5f5', border: '1px solid #fecaca', color: '#b91c1c' }}
    >
      <span className="material-symbols-outlined text-[16px]">error</span>
      {message}
    </div>
  )
}

// ── Delivery panel ─────────────────────────────────────────────────────────────

function DeliveryPanel({ data, error }) {
  if (error) return <InlineError message={error} />

  const isFree    = !data || !data.is_active || data.charge_type === 'free'
  const fee       = isFree ? 0 : Number(data.flat_fee)
  const isThresh  = data?.charge_type === 'threshold'
  const threshold = isThresh ? Number(data.free_threshold) : null

  return (
    <div
      className="mt-4 p-4 rounded-xl flex items-start gap-3"
      style={{ background: '#f5f9f5', border: '1px solid #d4ede5' }}
    >
      <span
        className="material-symbols-outlined mt-0.5 flex-shrink-0"
        style={{ color: '#00694c', fontSize: '20px', fontVariationSettings: "'FILL' 1" }}
      >
        local_shipping
      </span>
      <div>
        <p className="font-semibold text-sm" style={{ color: '#151e13' }}>
          Home delivery
        </p>
        {isFree || fee === 0 ? (
          <p className="text-xs mt-1 font-medium" style={{ color: '#00694c' }}>
            Free delivery
          </p>
        ) : (
          <p className="text-xs mt-1 font-medium" style={{ color: '#00694c' }}>
            Delivery charge: €{fee.toFixed(2)}
            {isThresh && threshold && (
              <span style={{ color: '#6d7a73' }}>
                {' '}(free over €{threshold.toFixed(2)})
              </span>
            )}
          </p>
        )}
      </div>
    </div>
  )
}

// ── Collect panel ──────────────────────────────────────────────────────────────

function CollectPanel({ data, error }) {
  if (error) return <InlineError message={error} />

  const distanceText = data?.distance_km != null
    ? `${data.distance_km} km away`
    : null

  const readyMins  = data?.collect_ready_minutes ?? 120
  const readyLabel = readyMins >= 60
    ? `≈ ${readyMins / 60} hour${readyMins / 60 !== 1 ? 's' : ''}`
    : `≈ ${readyMins} min`

  return (
    <div
      className="mt-4 rounded-xl overflow-hidden"
      style={{ border: '1px solid #d4ede5' }}
    >
      {/* Store header */}
      <div
        className="px-4 py-3 flex items-center gap-3"
        style={{ background: '#f5f9f5', borderBottom: '1px solid #d4ede5' }}
      >
        <span
          className="material-symbols-outlined flex-shrink-0"
          style={{ color: '#00694c', fontSize: '20px', fontVariationSettings: "'FILL' 1" }}
        >
          store
        </span>

        <div className="min-w-0">
          <p className="font-semibold text-sm truncate" style={{ color: '#151e13' }}>
            {data ? `${data.name} — ${data.address}` : '—'}
          </p>
          <p className="text-xs" style={{ color: '#6d7a73' }}>
            {data ? data.city : ''}
            {distanceText ? ` · ${distanceText}` : ''}
          </p>
        </div>

        {data && (
          <span
            className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
            style={
              data.is_open_now
                ? { background: '#d4ede5', color: '#095041' }
                : { background: '#fde8e8', color: '#9b1c1c' }
            }
          >
            {data.is_open_now ? 'OPEN' : 'CLOSED'}
          </span>
        )}
      </div>

      {/* Hours — uses the single `hours` display string from stores.Store */}
      {data?.hours && (
        <div
          className="px-4 py-3 flex items-center gap-2"
          style={{ borderBottom: '1px solid #d4ede5' }}
        >
          <span
            className="material-symbols-outlined text-[16px] flex-shrink-0"
            style={{ color: '#6d7a73' }}
          >
            schedule
          </span>
          <span className="text-xs" style={{ color: '#6d7a73' }}>
            Opening hours:{' '}
            <span className="font-medium" style={{ color: '#151e13' }}>
              {data.hours}
            </span>
          </span>
          {data.map_link && (
            <a
              href={data.map_link}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-auto text-[11px] font-semibold flex items-center gap-1 flex-shrink-0"
              style={{ color: '#00694c' }}
            >
              <span className="material-symbols-outlined text-[14px]">map</span>
              Directions
            </a>
          )}
        </div>
      )}

      {/* Ready-in banner */}
      <div
        className="px-4 py-3 flex items-center gap-2"
        style={{ background: '#edf7f2' }}
      >
        <span
          className="material-symbols-outlined text-[18px] flex-shrink-0"
          style={{ color: '#00694c' }}
        >
          inventory_2
        </span>
        <p className="text-xs" style={{ color: '#3d4943' }}>
          Your order will be ready for collection in{' '}
          <span className="font-bold" style={{ color: '#00694c' }}>{readyLabel}</span>.
          {data?.sms_notification && ' We\'ll send you an SMS when it\'s ready.'}
        </p>
      </div>
    </div>
  )
}

// ── Main export ────────────────────────────────────────────────────────────────

// ── Main export ────────────────────────────────────────────────────────────────

export default function FulfillmentSwitcher({
  fulfillment,
  setFulfillment,
  initialDelivery = null,  
  initialStore    = null,   
}) {
  const deliveryError = !initialDelivery ? 'Could not load delivery info.' : null
  const storeError    = !initialStore    ? 'Could not load store info.'    : null

  return (
    <div className="mb-8 md:mb-10">
      {/* Pills */}
      <div className="inline-flex p-1 rounded-xl" style={{ background: '#f0f4f0' }}>
        {MODES.map(mode => {
          const active = fulfillment === mode.id
          return (
            <button
              key={mode.id}
              onClick={() => setFulfillment(mode.id)}
              className="px-4 md:px-6 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer"
              style={{
                background: active ? '#ffffff' : 'transparent',
                color:      active ? '#00694c' : '#3d4943',
                boxShadow:  active ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                whiteSpace: 'nowrap',
              }}
            >
              {mode.label}
            </button>
          )
        })}
      </div>

      {fulfillment === 'delivery' ? (
        <DeliveryPanel data={initialDelivery} error={deliveryError} />
      ) : (
        <CollectPanel data={initialStore} error={storeError} />
      )}
    </div>
  )
}