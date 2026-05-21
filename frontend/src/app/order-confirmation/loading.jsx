// src/app/order-confirmation/loading.jsx

export default function OrderConfirmationLoading() {
  return (
    <div
      style={{ background: '#ffffff', minHeight: '100vh', width: '100%' }}
      className="flex flex-col items-center justify-center gap-5"
    >
      {/* Spinner */}
      <div className="relative w-16 h-16">
        <div
          className="absolute inset-0 rounded-full border-4 animate-spin"
          style={{
            borderColor: '#e8eee8',
            borderTopColor: '#00694c',
            animationDuration: '0.75s',
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className="material-symbols-outlined text-2xl"
            style={{
              color: '#00694c',
              fontVariationSettings: "'FILL' 1",
            }}
          >
            order_approve
          </span>
        </div>
      </div>

      {/* Text */}
      <div className="text-center space-y-1">
        <p
          className="text-xl italic"
          style={{ fontFamily: '"Newsreader", Georgia, serif', color: '#151e13' }}
        >
          Confirming your order…
        </p>
        <p className="text-sm" style={{ color: '#6d7a73' }}>
          Almost there, thank you for your patience
        </p>
      </div>
    </div>
  )
}