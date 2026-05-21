"use client";

import { DollarSign, ShoppingCart, Users, Package, Loader2, TrendingUp, Clock, Store } from "lucide-react";
import useSWR from "swr";
import { AreaChart, Area, BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import Container from "@/app/dashboard/_components/Container";
import StatCard from "@/app/dashboard/_components/StatCard";
import { fetchAdminDashboardStats } from "@/app/dashboard/_lib/auth";
import { ordersService } from "@/app/dashboard/_lib/services";

const statusColors = {
  pending: "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400",
  processing: "bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400",
  shipped: "bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400",
  delivered: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400",
  cancelled: "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400",
};

export default function DashboardHomePage() {
  const { data: rawStats, isLoading: statsLoading } = useSWR("admin-dashboard-stats", fetchAdminDashboardStats, {
    revalidateOnFocus: false,
  });

  // Backend returns { statistics: { total_users, total_products, total_orders, total_revenue, ... }, ... }
  const stats = rawStats?.statistics || rawStats || {};

  // Fetch recent orders (50 for charts, first 6 shown in table)
  const { data: ordersRaw } = useSWR("dash-recent-orders", () => ordersService.list({ page_size: 50, ordering: "-ordered_at" }), { revalidateOnFocus: false });
  const allOrders = Array.isArray(ordersRaw) ? ordersRaw : (ordersRaw?.results || []);
  const recentOrders = allOrders.slice(0, 6);

  // Build last-14-day daily trend
  const dailyTrend = (() => {
    const map = {};
    const now = new Date();
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now); d.setDate(d.getDate() - i);
      const key = `${d.getMonth() + 1}/${d.getDate()}`;
      map[key] = { day: key, orders: 0, revenue: 0 };
    }
    allOrders.forEach(o => {
      const d = new Date(o.ordered_at);
      const key = `${d.getMonth() + 1}/${d.getDate()}`;
      if (map[key]) { map[key].orders += 1; map[key].revenue += Number(o.total_amount || 0); }
    });
    return Object.values(map);
  })();

  // Status count for bar chart
  const statusCounts = (() => {
    const m = {};
    allOrders.forEach(o => { m[o.status] = (m[o.status] || 0) + 1; });
    return Object.entries(m).map(([status, count]) => ({ status, count }));
  })();

  const STATUS_BAR_COLORS = { PENDING: "#f59e0b", PROCESSING: "#3b82f6", SHIPPED: "#8b5cf6", DELIVERED: "#10b981", CANCELLED: "#ef4444" };

  return (
    <Container title="Dashboard" description="Overview of your store performance">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg p-4 h-24 animate-pulse" />
          ))
        ) : (
          <>
            <StatCard label="Total Users" value={Number(stats?.total_users || 0).toLocaleString()} icon={Users} />
            <StatCard label="Total Products" value={Number(stats?.total_products || 0).toLocaleString()} icon={Package} />
            <StatCard label="Total Orders" value={Number(stats?.total_orders || 0).toLocaleString()} icon={ShoppingCart} />
            <StatCard label="Revenue" value={`৳${Number(stats?.total_revenue || 0).toLocaleString()}`} icon={DollarSign} />
          </>
        )}
      </div>

      {/* User + Business breakdown */}
      {!statsLoading && stats?.total_users > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            ["Customers", stats?.total_customers],
            ["Sellers", stats?.total_sellers],
            ["Vendors", stats?.total_vendors],
            ["Admins", stats?.total_admins],
            ["Pending Orders", stats?.pending_orders],
            ["Inactive Users", stats?.inactive_users],
          ].map(([label, val]) => (
            <div key={label} className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg px-4 py-3">
              <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">{Number(val || 0).toLocaleString()}</p>
            </div>
          ))}
        </div>
      )}

      {/* Trend Charts */}
      {allOrders.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* 14-day revenue trend */}
          <div className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Revenue — Last 14 Days</h3>
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailyTrend} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="dashRevGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="day" tick={{ fontSize: 10 }} stroke="#9ca3af" interval={3} />
                  <YAxis tick={{ fontSize: 10 }} stroke="#9ca3af" />
                  <Tooltip contentStyle={{ fontSize: "11px", borderRadius: "8px" }} formatter={(v, n) => [n === "revenue" ? `৳${Number(v).toLocaleString()}` : v, n === "revenue" ? "Revenue" : "Orders"]} />
                  <Area type="monotone" dataKey="revenue" stroke="#4f46e5" fill="url(#dashRevGrad)" strokeWidth={2} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Order status bar chart */}
          <div className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Orders by Status</h3>
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusCounts} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="status" tick={{ fontSize: 10 }} stroke="#9ca3af" />
                  <YAxis tick={{ fontSize: 10 }} stroke="#9ca3af" allowDecimals={false} />
                  <Tooltip contentStyle={{ fontSize: "11px", borderRadius: "8px" }} />
                  <Bar dataKey="count" name="Orders" radius={[4, 4, 0, 0]}>
                    {statusCounts.map((entry, i) => (
                      <Cell key={i} fill={STATUS_BAR_COLORS[entry.status] || "#6b7280"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Recent Orders */}
      <div className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg">
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-sm font-medium text-gray-900 dark:text-white">Recent Orders</h2>
        </div>
        {!ordersRaw ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-800">
                  <th className="px-4 py-2.5 text-left font-medium text-gray-500 dark:text-gray-400">Order</th>
                  <th className="px-4 py-2.5 text-left font-medium text-gray-500 dark:text-gray-400">Customer</th>
                  <th className="px-4 py-2.5 text-left font-medium text-gray-500 dark:text-gray-400">Total</th>
                  <th className="px-4 py-2.5 text-left font-medium text-gray-500 dark:text-gray-400">Status</th>
                  <th className="px-4 py-2.5 text-left font-medium text-gray-500 dark:text-gray-400">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.length === 0 ? (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">No orders yet</td></tr>
                ) : (
                  recentOrders.map((order) => (
                    <tr key={order.id || order.order_number} className="border-b border-gray-100 dark:border-gray-800/50 last:border-0">
                      <td className="px-4 py-2.5 font-medium text-gray-900 dark:text-white">{order.order_number}</td>
                      <td className="px-4 py-2.5 text-gray-600 dark:text-gray-300">{order.customer_name}</td>
                      <td className="px-4 py-2.5 text-gray-700 dark:text-gray-300">৳{Number(order.total_amount).toLocaleString()}</td>
                      <td className="px-4 py-2.5">
                        <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${statusColors[order.status?.toLowerCase()] || "bg-gray-100 text-gray-600"}`}>
                          {order.status_display || order.status}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-gray-500 dark:text-gray-400">
                        {order.ordered_at ? new Date(order.ordered_at).toLocaleDateString() : "—"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Container>
  );
}
