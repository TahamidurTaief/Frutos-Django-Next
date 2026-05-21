'use client'
// src/app/checkout/_components/PaymentSection.jsx

const PAYMENT_METHODS = [
  { id: 'card',   label: 'Debit / Credit Card', icon: 'credit_card'            },
  { id: 'paypal', label: 'PayPal',               icon: 'account_balance_wallet' },
  { id: 'cash',   label: 'Cash',                 icon: 'payments'               },
]

const INPUT_STYLE = {
  background: '#f8faf8', border: '1px solid #e8eee8', color: '#151e13',
  width: '100%', height: '44px', padding: '0 16px',
  borderRadius: '8px', fontSize: '14px', outline: 'none',
}

function onFocus(e) { e.target.style.borderColor = '#00694c' }
function onBlur(e)  { e.target.style.borderColor = '#e8eee8' }

export default function PaymentSection({ paymentMethod, setPaymentMethod, cardForm, setCardForm }) {
  return (
    <section
      className="p-6 md:p-8 rounded-xl"
      style={{
        background:  '#fff',
        border:      '1px solid #eaeaea',
        borderTop:   '5px solid #c8e8d4',
        boxShadow:   '0 1px 8px rgba(0,0,0,0.04)',
      }}
    >
      <h2
        className="text-2xl md:text-3xl italic mb-6 md:mb-8"
        style={{ fontFamily: '"Newsreader", Georgia, serif', color: '#151e13' }}
      >
        Secure Payment
      </h2>

      {/* Method selector */}
      <div className="flex gap-3 md:gap-4 mb-6 md:mb-8">
        {PAYMENT_METHODS.map(method => {
          const active = paymentMethod === method.id
          return (
            <button
              key={method.id}
              onClick={() => setPaymentMethod(method.id)}
              className="flex-1 p-3 md:p-4 rounded-xl flex items-center justify-center gap-2 md:gap-3 transition-all cursor-pointer"
              style={{
                background: active ? '#f0f8f4' : '#f5f5f5',
                border:     active ? '2px solid #00694c' : '1.5px solid #e0e6e0',
              }}
            >
              <span
                className="material-symbols-outlined text-lg md:text-xl"
                style={{
                  color:                active ? '#00694c' : '#5a6b63',
                  fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0",
                }}
              >
                {method.icon}
              </span>
              <span
                className="hidden md:block text-sm font-bold"
                style={{ color: active ? '#00694c' : '#3d4943' }}
              >
                {method.label}
              </span>
            </button>
          )
        })}
      </div>

      {/* Card fields */}
      {paymentMethod === 'card' && (
        <div className="space-y-4 md:space-y-6">
          <div>
            <label className="block text-[10px] uppercase tracking-widest font-bold mb-2" style={{ color: '#6d7a73' }}>
              Card Number *
            </label>
            <input
              type="text" placeholder="0000 0000 0000 0000"
              value={cardForm.number}
              onChange={e => setCardForm({ ...cardForm, number: e.target.value })}
              style={INPUT_STYLE} onFocus={onFocus} onBlur={onBlur}
            />
          </div>
          <div className="grid grid-cols-2 gap-4 md:gap-6">
            <div>
              <label className="block text-[10px] uppercase tracking-widest font-bold mb-2" style={{ color: '#6d7a73' }}>
                Expiry *
              </label>
              <input
                type="text" placeholder="MM/YY"
                value={cardForm.expiry}
                onChange={e => setCardForm({ ...cardForm, expiry: e.target.value })}
                style={INPUT_STYLE} onFocus={onFocus} onBlur={onBlur}
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-widest font-bold mb-2" style={{ color: '#6d7a73' }}>
                CVV *
              </label>
              <input
                type="text" placeholder="123"
                value={cardForm.cvv}
                onChange={e => setCardForm({ ...cardForm, cvv: e.target.value })}
                style={INPUT_STYLE} onFocus={onFocus} onBlur={onBlur}
              />
            </div>
          </div>
        </div>
      )}

      {paymentMethod !== 'card' && (
        <div
          className="flex items-center justify-center h-24 rounded-xl"
          style={{ background: '#f8faf8', border: '1px solid #e8eee8' }}
        >
          <p className="text-sm italic" style={{ fontFamily: '"Newsreader", Georgia, serif', color: '#6d7a73' }}>
            You'll be redirected to complete payment securely.
          </p>
        </div>
      )}
    </section>
  )
}