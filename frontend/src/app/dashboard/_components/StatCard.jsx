const iconColors = {
  blue:    { icon: "bg-blue-50 text-blue-600",    val: "text-slate-800" },
  indigo:  { icon: "bg-indigo-50 text-indigo-600", val: "text-slate-800" },
  emerald: { icon: "bg-emerald-50 text-emerald-600", val: "text-emerald-600" },
  amber:   { icon: "bg-amber-50 text-amber-600",  val: "text-slate-800" },
  violet:  { icon: "bg-violet-50 text-violet-600", val: "text-slate-800" },
  red:     { icon: "bg-red-50 text-red-600",       val: "text-slate-800" },
  green:   { icon: "bg-green-50 text-green-600",   val: "text-green-600" },
  gray:    { icon: "bg-slate-100 text-slate-500",  val: "text-slate-800" },
};

export default function StatCard({ label, value, change, icon: Icon, color = "gray" }) {
  const isPositive = change >= 0;
  const colors = iconColors[color] || iconColors.gray;
  return (
    <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-center justify-between mb-3">
        {Icon && (
          <div className={`p-2 rounded-lg ${colors.icon}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
        {change !== undefined && (
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${isPositive ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"}`}>
            {isPositive ? "+" : ""}{change}%
          </span>
        )}
      </div>
      <div className={`text-2xl font-black leading-tight ${colors.val}`}>{value}</div>
      <p className="text-xs font-semibold text-slate-400 mt-1 uppercase tracking-wider">{label}</p>
    </div>
  );
}
