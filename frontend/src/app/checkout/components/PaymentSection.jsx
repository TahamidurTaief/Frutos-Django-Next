'use client'
// src/app/checkout/components/PaymentSection.jsx

const PAYMENT_METHODS = [
  { id: 'card',   label: 'Debit / Credit Card', icon: 'credit_card'            },
  { id: 'tpv',    label: 'TPV',                 icon: 'point_of_sale'          },
  { id: 'paypal', label: 'PayPal',              icon: 'account_balance_wallet' },
  { id: 'cash',   label: 'Cash',                icon: 'payments'               },
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
      <div className="flex items-center justify-between mb-6 md:mb-8 flex-wrap gap-2">
        <h2
          className="text-2xl md:text-3xl italic"
          style={{ fontFamily: '"Newsreader", Georgia, serif', color: '#151e13' }}
        >
          Secure Payment
        </h2>
        <div className="flex items-center gap-1.5 text-xs text-[#00694c] font-medium bg-[#eaf5ef] px-2.5 py-1 rounded-full">
          <span className="material-symbols-outlined text-sm">lock</span>
          <span>End-to-end Encrypted</span>
        </div>
      </div>

      {/* Method selector */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
        {PAYMENT_METHODS.map(method => {
          const active = paymentMethod === method.id
          return (
            <button
              key={method.id}
              type="button"
              onClick={() => setPaymentMethod(method.id)}
              className="p-3 md:p-4 rounded-xl flex items-center justify-center gap-2 md:gap-2.5 transition-all cursor-pointer select-none"
              style={{
                background: active ? '#f0f8f4' : '#f5f5f5',
                border:     active ? '2px solid #00694c' : '1.5px solid #e0e6e0',
                boxShadow:  active ? '0 2px 8px rgba(0,105,76,0.12)' : 'none',
              }}
            >
              <span
                className="material-symbols-outlined text-lg md:text-xl"
                style={{
                  color:                 active ? '#00694c' : '#5a6b63',
                  fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0",
                }}
              >
                {method.icon}
              </span>
              <span
                className="text-xs md:text-sm font-bold truncate"
                style={{ color: active ? '#00694c' : '#3d4943' }}
              >
                {method.label}
              </span>
            </button>
          )
        })}
      </div>

      {/* ── Debit / Credit Card Fields ── */}
      {paymentMethod === 'card' && (
        <div className="space-y-4 md:space-y-6">
          <div>
            <label className="block text-[10px] uppercase tracking-widest font-bold mb-2" style={{ color: '#6d7a73' }}>
              Card Number *
            </label>
            <input
              type="text" placeholder="0000 0000 0000 0000"
              value={cardForm.number || ''}
              onChange={e => {
                const input = e.target.value
                if (input.length < (cardForm.number || '').length) {
                  setCardForm({ ...cardForm, number: input.endsWith(' ') ? input.slice(0, -1) : input })
                  return
                }
                let val = input.replace(/\D/g, '')
                val = val.substring(0, 16)
                setCardForm({ ...cardForm, number: val.match(/.{1,4}/g)?.join(' ') || val })
              }}
              className="font-mono"
              style={INPUT_STYLE} onFocus={onFocus} onBlur={onBlur}
            />
          </div>
          <div className="grid grid-cols-2 gap-4 md:gap-6">
            <div>
              <label className="block text-[10px] uppercase tracking-widest font-bold mb-2" style={{ color: '#6d7a73' }}>
                Expiry *
              </label>
              <div className="relative">
                <div 
                  className="absolute top-0 left-0 h-full flex items-center pointer-events-none font-mono text-[14px]"
                  style={{ paddingLeft: '16px' }}
                >
                  <span className="opacity-0">{cardForm.expiry || ''}</span>
                  <span className="text-gray-400">{"MM/YY".substring((cardForm.expiry || '').length)}</span>
                </div>
                <input
                  type="text"
                  value={cardForm.expiry || ''}
                  onChange={e => {
                    const input = e.target.value
                    if (input.length < (cardForm.expiry || '').length) {
                      setCardForm({ ...cardForm, expiry: input.endsWith('/') ? input.slice(0, -1) : input })
                      return
                    }
                    let digits = input.replace(/\D/g, '')
                    digits = digits.substring(0, 4)
                    if (digits.length >= 2) {
                      let m = digits.substring(0, 2)
                      if (parseInt(m, 10) > 12) m = '12'
                      if (m === '00') m = '01'
                      const y = digits.substring(2)
                      setCardForm({ ...cardForm, expiry: y ? `${m}/${y}` : `${m}/` })
                    } else {
                      setCardForm({ ...cardForm, expiry: digits })
                    }
                  }}
                  className="w-full bg-transparent font-mono relative z-10 text-[#151e13]"
                  style={INPUT_STYLE} onFocus={onFocus} onBlur={onBlur}
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-widest font-bold mb-2" style={{ color: '#6d7a73' }}>
                CVV *
              </label>
              <input
                type="text" placeholder="123"
                value={cardForm.cvv || ''}
                onChange={e => {
                  let val = e.target.value.replace(/\D/g, '')
                  setCardForm({ ...cardForm, cvv: val.substring(0, 4) })
                }}
                className="font-mono"
                style={INPUT_STYLE} onFocus={onFocus} onBlur={onBlur}
              />
            </div>
          </div>
        </div>
      )}

      {/* ── TPV (Terminal Punto de Venta / Virtual POS) ── */}
      {paymentMethod === 'tpv' && (
        <div
          className="p-5 md:p-6 rounded-xl space-y-4 animate-in fade-in duration-200"
          style={{ background: '#f8faf8', border: '1px solid #d4ede5' }}
        >
          <div className="flex items-start gap-3.5">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm"
              style={{ background: '#d4ede5', color: '#00694c' }}
            >
              <span className="material-symbols-outlined text-2xl">point_of_sale</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-bold text-[#151e13]">
                  TPV Virtual / Pasarela Bancaria Oficial
                </h3>
                <span
                  className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase"
                  style={{ background: '#00694c', color: '#ffffff' }}
                >
                  Redsys · 3D Secure
                </span>
              </div>
              <p className="text-xs text-[#5a6b63] mt-1 leading-relaxed">
                Terminal Punto de Venta para pago bancario seguro con tarjeta de crédito/débito o datáfono.
              </p>
            </div>
          </div>

          <div
            className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 p-3 rounded-lg text-xs"
            style={{ background: '#ffffff', border: '1px solid #e8eee8' }}
          >
            <div className="flex items-center gap-2 text-[#3d4943]">
              <span className="material-symbols-outlined text-base" style={{ color: '#00694c' }}>
                lock
              </span>
              <span className="font-medium">Cifrado SSL 256-bit</span>
            </div>
            <div className="flex items-center gap-2 text-[#3d4943]">
              <span className="material-symbols-outlined text-base" style={{ color: '#00694c' }}>
                verified_user
              </span>
              <span className="font-medium">Protocolo 3D Secure</span>
            </div>
            <div className="flex items-center gap-2 text-[#3d4943]">
              <span className="material-symbols-outlined text-base" style={{ color: '#00694c' }}>
                bolt
              </span>
              <span className="font-medium">Autorización Directa</span>
            </div>
          </div>

          <div className="flex items-center justify-between flex-wrap gap-2 pt-2 border-t border-[#e8eee8]">
            <p className="text-[11px] text-[#6d7a73] italic" style={{ fontFamily: '"Newsreader", Georgia, serif' }}>
              Compatible con Visa, Mastercard, Maestro y Bizum a través del sistema TPV bancario.
            </p>
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#00694c] bg-[#eaf5ef] px-2.5 py-1 rounded-md">
              <span className="material-symbols-outlined text-xs">check_circle</span>
              <span>TPV Gateway Activo</span>
            </div>
          </div>
        </div>
      )}

      {/* ── PayPal Info ── */}
      {paymentMethod === 'paypal' && (
        <div
          className="p-5 md:p-6 rounded-xl space-y-3 animate-in fade-in duration-200"
          style={{ background: '#f8faf8', border: '1px solid #e8eee8' }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm"
              style={{ background: '#003087', color: '#ffffff' }}
            >
              <span className="material-symbols-outlined text-xl">account_balance_wallet</span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#151e13]">PayPal Checkout</h3>
              <p className="text-xs text-[#5a6b63]">
                Paga de forma rápida y protegida con tu cuenta de PayPal o tarjeta asociada.
              </p>
            </div>
          </div>
          <p className="text-xs text-[#6d7a73] italic" style={{ fontFamily: '"Newsreader", Georgia, serif' }}>
            Serás redirigido a la plataforma oficial de PayPal para autorizar tu compra de forma protegida.
          </p>
        </div>
      )}

      {/* ── Cash on Delivery Info ── */}
      {paymentMethod === 'cash' && (
        <div
          className="p-5 md:p-6 rounded-xl space-y-3 animate-in fade-in duration-200"
          style={{ background: '#f8faf8', border: '1px solid #e8eee8' }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm"
              style={{ background: '#eaf5ef', color: '#00694c' }}
            >
              <span className="material-symbols-outlined text-xl">payments</span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#151e13]">Pago en Efectivo (Contra Reembolso)</h3>
              <p className="text-xs text-[#5a6b63]">
                Paga en efectivo directamente al repartidor cuando entregue tu pedido en mano.
              </p>
            </div>
          </div>
          <p className="text-xs text-[#6d7a73] italic" style={{ fontFamily: '"Newsreader", Georgia, serif' }}>
            Por favor, procura tener el importe exacto listo en el momento de la entrega.
          </p>
        </div>
      )}
    </section>
  )
}
