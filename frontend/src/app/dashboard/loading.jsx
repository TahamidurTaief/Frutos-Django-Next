import { Loader2 } from "lucide-react";

export default function DashboardLoading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] w-full bg-[#f8fafc]">
      <div className="p-4 bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center min-w-[200px]">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mb-4" />
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest animate-pulse">Loading Data...</p>
      </div>
    </div>
  );
}
