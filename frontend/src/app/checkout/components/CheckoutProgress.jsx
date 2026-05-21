// src/app/checkout/_components/CheckoutProgress.jsx
// ✅ No hooks — server-safe

const steps = [
  {
    icon:   'local_shipping',
    label:  'Delivery',
    state:  'done',      // done | active | pending
  },
  {
    icon:   'payments',
    label:  'Payment',
    state:  'active',
  },
  {
    icon:   'check_circle',
    label:  'Confirm',
    state:  'pending',
  },
]

const COLORS = {
  done:    { circle: '#00694c', icon: '#ffffff', label: '#00694c', shadow: '0 4px 12px rgba(0,105,76,0.25)' },
  active:  { circle: '#ffffff', border: '#00694c', icon: '#00694c', label: '#151e13', shadow: '0 0 0 3px rgba(0,105,76,0.15)' },
  pending: { circle: '#f0f4f0', border: '#d0d8d0', icon: '#b0bcb5', label: '#9aaba0', shadow: 'none' },
}

export default function CheckoutProgress() {
  return (
    <div className="mb-10 md:mb-16 max-w-2xl mx-auto">

      {/* ── Step row ──────────────────────────────────────────────────────── */}
      <div className="flex items-center">

        {steps.map((step, idx) => {
          const c = COLORS[step.state]
          const isLast = idx === steps.length - 1

          // How many segments before this step are "done"?
          // Segment between step[idx] and step[idx+1] is green if step[idx] is done.
          const nextState    = !isLast ? steps[idx + 1].state : null
          const lineComplete = step.state === 'done'
          const lineActive   = step.state === 'active'

          return (
            <div key={step.label} className="flex items-center" style={{ flex: isLast ? 'none' : 1 }}>

              {/* ── Circle + label ──────────────────────────────────────────── */}
              <div className="flex flex-col items-center gap-2 flex-shrink-0">

                {/* Circle */}
                <div
                  style={{
                    width:           40,
                    height:          40,
                    borderRadius:    '50%',
                    display:         'flex',
                    alignItems:      'center',
                    justifyContent:  'center',
                    background:      c.circle,
                    border:          c.border ? `2px solid ${c.border}` : 'none',
                    boxShadow:       c.shadow,
                    transition:      'all 0.3s ease',
                  }}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{
                      fontSize:             20,
                      color:                c.icon,
                      fontVariationSettings: step.state === 'done' ? "'FILL' 1" : "'FILL' 0",
                    }}
                  >
                    {step.icon}
                  </span>
                </div>

                {/* Label */}
                <span
                  style={{
                    fontSize:      11,
                    fontWeight:    700,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color:         c.label,
                    whiteSpace:    'nowrap',
                    transition:    'color 0.3s ease',
                  }}
                >
                  {step.label}
                </span>
              </div>

              {/* ── Connector line (not after the last step) ────────────────── */}
              {!isLast && (
                <div
                  style={{
                    flex:          1,
                    height:        2,
                    marginBottom:  24,   /* lift line to circle centre (label below adds ~24px) */
                    marginLeft:    8,
                    marginRight:   8,
                    borderRadius:  2,
                    background:    lineComplete
                      ? '#00694c'             /* completed segment — solid green */
                      : lineActive
                        ? 'linear-gradient(to right, #00694c 0%, #d0d8d0 100%)'  /* half-and-half */
                        : '#e0e6e0',          /* future segment — light gray */
                    transition:    'background 0.4s ease',
                  }}
                />
              )}

            </div>
          )
        })}

      </div>
    </div>
  )
}