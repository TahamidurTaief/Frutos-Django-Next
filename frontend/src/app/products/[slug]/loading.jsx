// src/app/products/[slug]/loading.jsx

export default function ProductDetailLoading() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-10 animate-pulse">

      {/* Breadcrumb skeleton */}
      <div className="h-4 w-48 bg-gray-200 rounded mb-8" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">

        {/* Image skeleton */}
        <div className="rounded-2xl bg-gray-200 h-80 md:h-[420px] w-full" />

        {/* Info skeleton */}
        <div className="flex flex-col gap-4">
          {/* Badge */}
          <div className="h-5 w-20 bg-gray-200 rounded-full" />
          {/* Title */}
          <div className="h-8 w-3/4 bg-gray-200 rounded" />
          <div className="h-5 w-1/2 bg-gray-200 rounded" />
          {/* Price */}
          <div className="h-9 w-28 bg-gray-200 rounded mt-2" />
          {/* Description lines */}
          <div className="space-y-2 mt-2">
            <div className="h-4 w-full bg-gray-200 rounded" />
            <div className="h-4 w-5/6 bg-gray-200 rounded" />
            <div className="h-4 w-4/6 bg-gray-200 rounded" />
          </div>
          {/* Button */}
          <div className="h-12 w-full bg-gray-200 rounded-xl mt-4" />
        </div>
      </div>

      {/* Related products skeleton */}
      <div className="mt-16">
        <div className="h-6 w-40 bg-gray-200 rounded mb-6" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-2xl overflow-hidden border border-gray-100">
              <div className="h-40 bg-gray-200" />
              <div className="p-4 space-y-2">
                <div className="h-4 w-3/4 bg-gray-200 rounded" />
                <div className="h-4 w-1/2 bg-gray-200 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}