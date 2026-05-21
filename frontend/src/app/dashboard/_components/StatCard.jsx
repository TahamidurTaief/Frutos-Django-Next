export default function StatCard({ label, value, change, icon: Icon }) {
  const isPositive = change >= 0;
  return (
    <div className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-gray-500 dark:text-gray-400">{label}</span>
        {Icon && <Icon className="w-4 h-4 text-gray-400" />}
      </div>
      <div className="text-2xl font-semibold text-gray-900 dark:text-white">{value}</div>
      {change !== undefined && (
        <p className={`text-xs mt-1 ${isPositive ? "text-emerald-600" : "text-red-500"}`}>
          {isPositive ? "+" : ""}{change}% from last month
        </p>
      )}
    </div>
  );
}
