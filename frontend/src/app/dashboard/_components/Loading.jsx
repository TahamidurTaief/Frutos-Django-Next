export default function Loading() {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="flex items-center gap-2 text-sm text-gray-400">
        <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
        Loading...
      </div>
    </div>
  );
}

