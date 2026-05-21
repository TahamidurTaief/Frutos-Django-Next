export default function ShopLoading() {
  return (
    <div style={{ background: '#f2fdea', minHeight: '100vh' }}>

      {/* ════════════════════ DESKTOP ════════════════════ */}
      <div className="hidden md:block" style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 32px' }}>

        {/* Breadcrumb skeleton */}
        <div className="flex items-center gap-2 py-5">
          <div className="h-3 w-10 rounded-full animate-pulse" style={{ background: '#e1ebd9' }} />
          <div className="h-3 w-2 rounded-full animate-pulse" style={{ background: '#e1ebd9' }} />
          <div className="h-3 w-16 rounded-full animate-pulse" style={{ background: '#dbe6d4' }} />
        </div>

        {/* Title + sort */}
        <div className="flex items-end justify-between mb-10">
          <div>
            <div className="h-12 w-48 rounded-xl mb-3 animate-pulse" style={{ background: '#dbe6d4' }} />
            <div className="h-3 w-28 rounded-full animate-pulse" style={{ background: '#e1ebd9' }} />
          </div>
          <div className="h-9 w-44 rounded-lg animate-pulse" style={{ background: '#e1ebd9' }} />
        </div>

        <div className="flex gap-12">

          {/* Sidebar skeleton */}
          <div style={{ width: '240px', flexShrink: 0 }} className="space-y-8">
            {/* Category */}
            <div>
              <div className="h-5 w-24 rounded-lg mb-4 animate-pulse" style={{ background: '#dbe6d4' }} />
              <div className="space-y-3">
                {[100, 70, 60, 55, 50].map((w, i) => (
                  <div key={i} className="flex justify-between items-center">
                    <div className="h-3.5 rounded-full animate-pulse" style={{ background: '#e1ebd9', width: `${w}%` }} />
                    <div className="h-4 w-6 rounded animate-pulse" style={{ background: '#e1ebd9' }} />
                  </div>
                ))}
              </div>
            </div>
            {/* Subcategory */}
            <div>
              <div className="h-5 w-28 rounded-lg mb-4 animate-pulse" style={{ background: '#dbe6d4' }} />
              <div className="space-y-3">
                {[80, 90, 65, 75].map((w, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="h-4 w-4 rounded animate-pulse" style={{ background: '#e1ebd9' }} />
                    <div className="h-3 rounded-full animate-pulse" style={{ background: '#e1ebd9', width: `${w}%` }} />
                  </div>
                ))}
              </div>
            </div>
            {/* Price range */}
            <div>
              <div className="h-5 w-24 rounded-lg mb-4 animate-pulse" style={{ background: '#dbe6d4' }} />
              <div className="h-2 w-full rounded-full animate-pulse" style={{ background: '#e1ebd9' }} />
              <div className="flex justify-between mt-3">
                <div className="h-3 w-6 rounded animate-pulse" style={{ background: '#e1ebd9' }} />
                <div className="h-3 w-8 rounded animate-pulse" style={{ background: '#e1ebd9' }} />
              </div>
            </div>
            {/* Toggle */}
            <div className="flex justify-between items-center">
              <div className="h-3.5 w-24 rounded-full animate-pulse" style={{ background: '#e1ebd9' }} />
              <div className="h-6 w-11 rounded-full animate-pulse" style={{ background: '#dbe6d4' }} />
            </div>
          </div>

          {/* Product grid */}
          <div className="flex-1 min-w-0">
            {/* Pills */}
            <div className="flex gap-3 mb-10">
              {[88, 72, 60, 96, 120].map((w, i) => (
                <div key={i} className="h-8 rounded-full shrink-0 animate-pulse" style={{ background: '#e1ebd9', width: `${w}px` }} />
              ))}
            </div>

            {/* Cards */}
            <div className="grid grid-cols-2 xl:grid-cols-3 gap-8">
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ════════════════════ MOBILE ════════════════════ */}
      <div className="md:hidden" style={{ paddingBottom: '100px' }}>

        {/* Sub-header */}
        <div style={{ background: '#ecf7e4', padding: '16px 20px 0' }}>
          <div className="flex items-end justify-between mb-4">
            <div>
              <div className="h-9 w-32 rounded-xl mb-2 animate-pulse" style={{ background: '#dbe6d4' }} />
              <div className="h-3 w-36 rounded-full animate-pulse" style={{ background: '#e1ebd9' }} />
            </div>
            <div className="h-9 w-24 rounded-lg animate-pulse" style={{ background: '#e1ebd9' }} />
          </div>

          {/* Category pills */}
          <div className="flex gap-2 pb-4 overflow-hidden">
            {[80, 90, 65, 72, 60].map((w, i) => (
              <div key={i} className="h-8 rounded-full shrink-0 animate-pulse" style={{ background: '#dbe6d4', width: `${w}px` }} />
            ))}
          </div>
        </div>

        {/* Count */}
        <div style={{ padding: '16px 20px 8px' }}>
          <div className="h-3 w-28 rounded-full animate-pulse" style={{ background: '#e1ebd9' }} />
        </div>

        {/* Mobile grid */}
        <div style={{ padding: '0 16px' }}>
          <div className="grid grid-cols-2 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} isMobile />
            ))}
          </div>
        </div>
      </div>

      {/* Mobile bottom nav placeholder */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 rounded-t-2xl"
        style={{
          background: 'rgba(242,253,234,0.95)',
          backdropFilter: 'blur(12px)',
          boxShadow: '0 -4px 24px rgba(0,33,21,0.06)',
        }}
      >
        <div className="flex justify-around items-center px-4 pb-6 pt-3">
          {['eco', 'psychology_alt', 'location_on', 'shopping_basket'].map((icon, i) => (
            <div key={icon} className="flex flex-col items-center gap-1 px-5 py-2">
              <div
                className="w-6 h-6 rounded animate-pulse"
                style={{ background: i === 0 ? '#adedd8' : '#e1ebd9' }}
              />
              <div className="h-2 w-8 rounded-full animate-pulse" style={{ background: '#e1ebd9' }} />
            </div>
          ))}
        </div>
      </nav>

    </div>
  )
}

// ─── Skeleton card ────────────────────────────────────────────────
function SkeletonCard({ isMobile = false }) {
  return (
    <div
      style={{
        background: '#ffffff',
        borderRadius: '12px',
        border: '1px solid rgba(188,202,193,0.2)',
        overflow: 'hidden',
      }}
    >
      {/* Image placeholder */}
      <div
        className="w-full animate-pulse"
        style={{ aspectRatio: '4/3', background: 'linear-gradient(135deg, #e1ebd9 0%, #ecf7e4 50%, #e1ebd9 100%)', backgroundSize: '200% 200%', animation: 'shimmer 1.8s ease infinite' }}
      />

      <div style={{ padding: isMobile ? '12px' : '20px' }} className="space-y-2.5">
        {/* Provenance */}
        <div className="h-2.5 w-16 rounded-full animate-pulse" style={{ background: '#ecf7e4' }} />
        {/* Name */}
        <div className="h-4 w-full rounded-lg animate-pulse" style={{ background: '#e1ebd9' }} />
        <div className="h-4 w-3/4 rounded-lg animate-pulse" style={{ background: '#e1ebd9' }} />
        {/* Unit */}
        <div className="h-2.5 w-24 rounded-full animate-pulse" style={{ background: '#ecf7e4' }} />

        {/* Price + button */}
        <div className="flex items-center justify-between pt-2">
          <div className="h-5 w-14 rounded-lg animate-pulse" style={{ background: '#dbe6d4' }} />
          <div className="rounded-lg animate-pulse" style={{ background: '#dbe6d4', width: isMobile ? '32px' : '36px', height: isMobile ? '32px' : '36px' }} />
        </div>
      </div>

      <style>{`
        @keyframes shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  )
}