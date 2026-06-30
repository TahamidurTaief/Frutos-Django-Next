"use client";
import { useState } from "react";
import Modal from "@/app/dashboard/_components/Modal";
import { Euro, CalendarDays, BarChart2, User, Briefcase, ShoppingBag, Package, CheckCircle } from "lucide-react";

export default function OrdersReportModal({ open, onClose, orders = [] }) {
  const [tab, setTab] = useState("weekly");

  const now = new Date();

  // Start of Week (Sunday)
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  // Start of Month (1st day)
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const filterOrders = (startPeriod) => {
    return orders.filter(o => {
      if (!o.ordered_at) return false;
      const date = new Date(o.ordered_at);
      return date >= startPeriod;
    });
  };

  const weeklyOrders = filterOrders(startOfWeek);
  const monthlyOrders = filterOrders(startOfMonth);

  const activeOrders = tab === "weekly" ? weeklyOrders : monthlyOrders;

  const wholesaleOrders = activeOrders.filter(o => o.is_wholesale_order);
  const retailOrders = activeOrders.filter(o => !o.is_wholesale_order);

  const calculateStats = (ordersArray) => {
    return {
      revenue: ordersArray.reduce((sum, o) => sum + Number(o.total_amount || 0), 0),
      count: ordersArray.length,
      itemsSold: ordersArray.reduce((sum, o) => sum + (o.items || []).reduce((itemSum, item) => itemSum + Number(item.quantity || 0), 0), 0)
    };
  };

  const wsStats = calculateStats(wholesaleOrders);
  const rtStats = calculateStats(retailOrders);
  const totalStats = calculateStats(activeOrders);

  const statusCounts = activeOrders.reduce((acc, o) => {
    const s = o.status?.toLowerCase() || 'pending';
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {});

  const deliveredCount = (statusCounts['delivered'] || 0) + (statusCounts['completed'] || 0);

  // Helper to format date ranges
  const formatDateRange = (start) => {
    const end = new Date();
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    return `${start.toLocaleDateString(undefined, options)} - ${end.toLocaleDateString(undefined, options)}`;
  };

  return (
    <Modal open={open} onClose={onClose} title={
      <div className="flex items-center gap-3">
        <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
          <BarChart2 className="w-5 h-5" />
        </div>
        Sales & Orders Report
      </div>
    } maxWidth="max-w-4xl">
      <div className="space-y-5 pb-2">
        {/* Tabs */}
        <div className="flex bg-slate-100/80 p-1.5 rounded-xl border border-slate-200/60">
          <button
            onClick={() => setTab("weekly")}
            className={`cursor-pointer flex-1 py-2.5 text-sm font-black rounded-lg transition-all flex justify-center items-center gap-2 ${tab === "weekly" ? "bg-white text-emerald-700 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] border border-slate-100" : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"}`}
          >
            <CalendarDays className="w-4 h-4" /> This Week
          </button>
          <button
            onClick={() => setTab("monthly")}
            className={`cursor-pointer flex-1 py-2.5 text-sm font-black rounded-lg transition-all flex justify-center items-center gap-2 ${tab === "monthly" ? "bg-white text-emerald-700 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] border border-slate-100" : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"}`}
          >
            <CalendarDays className="w-4 h-4" /> This Month
          </button>
        </div>

        <div className="flex justify-between items-center px-1">
          <h3 className="text-base font-black text-slate-800">
            {tab === "weekly" ? "Weekly Summary" : "Monthly Summary"}
          </h3>
          <span className="text-xs font-bold text-slate-400 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100">
            {tab === "weekly" ? formatDateRange(startOfWeek) : formatDateRange(startOfMonth)}
          </span>
        </div>

        {/* Compact Revenue Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          {/* Retail Box */}
          <div className="cursor-pointer bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:border-teal-300 hover:shadow-md transition-all">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <div className="p-1.5 bg-teal-50 text-teal-600 rounded-md"><User className="w-3.5 h-3.5" /></div> Retail Sales
            </h4>
            <div className="space-y-3.5">
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5"><Euro className="w-3.5 h-3.5 text-slate-400" /> Revenue</span>
                <span className="font-black text-slate-800 text-lg">€{rtStats.revenue.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5"><ShoppingBag className="w-3.5 h-3.5 text-slate-400" /> Orders</span>
                <span className="font-bold text-slate-700">{rtStats.count.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5"><Package className="w-3.5 h-3.5 text-slate-400" /> Items Sold</span>
                <span className="font-bold text-slate-700">{rtStats.itemsSold.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Wholesale Box */}
          <div className="cursor-pointer bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:border-amber-300 hover:shadow-md transition-all">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <div className="p-1.5 bg-amber-50 text-amber-600 rounded-md"><Briefcase className="w-3.5 h-3.5" /></div> Wholesale Sales
            </h4>
            <div className="space-y-3.5">
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5"><Euro className="w-3.5 h-3.5 text-slate-400" /> Revenue</span>
                <span className="font-black text-slate-800 text-lg">€{wsStats.revenue.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5"><ShoppingBag className="w-3.5 h-3.5 text-slate-400" /> Orders</span>
                <span className="font-bold text-slate-700">{wsStats.count.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5"><Package className="w-3.5 h-3.5 text-slate-400" /> Items Sold</span>
                <span className="font-bold text-slate-700">{wsStats.itemsSold.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Total Box */}
          <div className="cursor-pointer bg-[#00694C] rounded-xl p-5 shadow-md hover:shadow-lg transition-all text-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
              <Euro className="w-24 h-24 -mt-8 -mr-8" />
            </div>
            <div className="relative z-10">
              <h4 className="text-xs font-bold text-emerald-100 uppercase tracking-widest mb-4 flex items-center gap-2">
                <div className="p-1.5 bg-white/20 text-white rounded-md backdrop-blur-sm"><BarChart2 className="w-3.5 h-3.5" /></div> Total Performance
              </h4>
              <div className="space-y-3.5">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-emerald-100">Total Revenue</span>
                  <span className="font-black text-2xl text-white">€{totalStats.revenue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-emerald-100">Total Orders</span>
                  <span className="font-bold text-emerald-50">{totalStats.count.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-emerald-100">Items Sold</span>
                  <span className="font-bold text-emerald-50">{totalStats.itemsSold.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Breakdown */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden mt-2">
          <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/80 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-5 bg-emerald-500 rounded-full"></span>
              <h4 className="text-sm font-bold text-slate-800">Status Breakdown</h4>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100">
              <CheckCircle className="w-3.5 h-3.5" />
              {deliveredCount} Delivered
            </div>
          </div>
          <div className="p-4">
            {totalStats.count === 0 ? (
              <div className="text-center py-8 text-slate-400 font-bold bg-slate-50/50 rounded-lg border border-slate-100 border-dashed text-sm">
                No orders found for this period.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {Object.entries(statusCounts).sort((a, b) => b[1] - a[1]).map(([status, count]) => {
                  let badgeColors = "bg-slate-50 text-slate-700 border-slate-200";
                  if (status === 'delivered') badgeColors = "bg-emerald-50 text-emerald-700 border-emerald-200";
                  if (status === 'pending') badgeColors = "bg-amber-50 text-amber-700 border-amber-200";
                  if (status === 'processing') badgeColors = "bg-blue-50 text-blue-700 border-blue-200";
                  if (status === 'cancelled') badgeColors = "bg-red-50 text-red-700 border-red-200";
                  if (status === 'shipped') badgeColors = "bg-indigo-50 text-indigo-700 border-indigo-200";

                  return (
                    <div key={status} className={`cursor-pointer p-3 rounded-lg border flex flex-col items-center justify-center text-center shadow-sm hover:scale-105 transition-transform ${badgeColors}`}>
                      <span className="text-2xl font-black mb-0.5 opacity-90">{count}</span>
                      <span className="text-[9px] font-black uppercase tracking-widest opacity-80">{status}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
