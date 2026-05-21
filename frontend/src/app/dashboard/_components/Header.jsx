"use client";

import { useDashboardAuth } from "@/app/dashboard/_context/DashboardAuthContext";
import { Sun, Moon, Bell, Search, ShoppingCart, Package, X, ExternalLink } from "lucide-react";
import { useTheme } from "next-themes";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import useSWR from "swr";
import { ordersService } from "@/app/dashboard/_lib/services";
import api from "@/app/dashboard/_lib/api";

function NotificationDropdown({ onClose }) {
  const { data: rawOrders } = useSWR(
    "header-pending-orders",
    () => ordersService.list({ ordering: "-ordered_at" }),
    { revalidateOnFocus: false, dedupingInterval: 60000 }
  );

  const orders = rawOrders?.results || (Array.isArray(rawOrders) ? rawOrders : []);
  const pending = orders.filter((o) => o.status?.toUpperCase() === "PENDING");
  const recent = orders.slice(0, 5);

  return (
    <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl shadow-lg z-50 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Notifications</h3>
        <button onClick={onClose} className="p-0.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {pending.length > 0 && (
        <div className="px-4 py-2.5 bg-amber-50 dark:bg-amber-950/30 border-b border-amber-100 dark:border-amber-900/50">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
            <p className="text-xs font-medium text-amber-700 dark:text-amber-400">
              {pending.length} order{pending.length > 1 ? "s" : ""} pending your attention
            </p>
          </div>
        </div>
      )}

      <div className="max-h-64 overflow-y-auto">
        {recent.length === 0 ? (
          <div className="px-4 py-6 text-center text-sm text-gray-400">No recent activity</div>
        ) : (
          recent.map((order) => {
            const statusColor = {
              PENDING: "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400",
              PROCESSING: "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400",
              SHIPPED: "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400",
              DELIVERED: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400",
              CANCELLED: "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400",
            }[order.status?.toUpperCase()] || "bg-gray-100 text-gray-600";
            return (
              <div key={order.id || order.order_number} className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors border-b border-gray-50 dark:border-gray-900 last:border-0">
                <div className="p-1.5 bg-gray-100 dark:bg-gray-800 rounded-md shrink-0">
                  <Package className="w-3 h-3 text-gray-500 dark:text-gray-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-900 dark:text-white truncate">#{order.order_number}</p>
                  <p className="text-[11px] text-gray-400 truncate">{order.customer_name} · ৳{Number(order.total_amount || 0).toLocaleString()}</p>
                </div>
                <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded capitalize shrink-0 ${statusColor}`}>
                  {order.status?.toLowerCase()}
                </span>
              </div>
            );
          })
        )}
      </div>

      <div className="px-4 py-2 border-t border-gray-100 dark:border-gray-800">
        <Link href="/dashboard/orders" onClick={onClose} className="flex items-center justify-center gap-1 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors">
          View all orders <ExternalLink className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}

export default function Header({ onMenuClick }) {
  const { user } = useDashboardAuth();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const notifRef = useRef(null);

  useEffect(() => setMounted(true), []);

  // Close notification dropdown on outside click
  useEffect(() => {
    if (!showNotifications) return;
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showNotifications]);

  // Get pending order count for badge
  const { data: rawOrders } = useSWR(
    "header-pending-orders",
    () => ordersService.list({ ordering: "-ordered_at" }),
    { revalidateOnFocus: false, dedupingInterval: 60000 }
  );
  const orders = rawOrders?.results || (Array.isArray(rawOrders) ? rawOrders : []);
  const pendingCount = orders.filter((o) => o.status?.toUpperCase() === "PENDING").length;

  // Get unread notification count (admin only)
  const isAdmin = user?.userType === "ADMIN";
  const { data: unreadData, mutate: mutateUnread } = useSWR(
    isAdmin ? "header-unread-notifications" : null,
    () => api.get("/api/auth/notifications/unread-count/"),
    { revalidateOnFocus: false, dedupingInterval: 30000 }
  );
  const unreadCount = (unreadData?.unread_count || 0) + pendingCount;

  return (
    <header className="h-14 shrink-0 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 flex items-center px-4 md:px-6 sticky top-0 z-30">
      {/* Left side — mobile sidebar toggle */}
      {onMenuClick && (
        <button
          onClick={onMenuClick}
          className="md:hidden p-1.5 mr-3 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      )}

      {/* Breadcrumb area placeholder */}
      <div className="flex-1" />

      {/* Right side — all controls */}
      <div className="flex items-center gap-1">
        {/* Search bar (desktop) */}
        <div className="hidden md:flex items-center">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              className="w-48 lg:w-60 pl-8 pr-3 py-1.5 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300 dark:focus:ring-gray-600 focus:border-gray-300 dark:focus:border-gray-600 focus:w-72 transition-all duration-200"
            />
          </div>
        </div>

        {/* Search button (mobile) */}
        <button
          onClick={() => setShowSearch(!showSearch)}
          className="md:hidden p-2 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <Search className="w-4 h-4" />
        </button>

        {/* Theme toggle */}
        {mounted && (
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title={theme === "dark" ? "Light mode" : "Dark mode"}
          >
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        )}

        {/* Notification bell */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 relative transition-colors"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 min-w-[14px] h-3.5 flex items-center justify-center bg-red-500 text-white text-[9px] font-bold rounded-full px-0.5">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>
          {showNotifications && (
            <NotificationDropdown onClose={() => setShowNotifications(false)} />
          )}
        </div>

        {/* Divider */}
        <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1" />

        {/* User avatar + name */}
        <div className="flex items-center gap-2 pl-1">
          <div className="w-7 h-7 rounded-full bg-gray-900 dark:bg-white flex items-center justify-center shrink-0">
            <span className="text-xs font-semibold text-white dark:text-gray-900">
              {user?.name?.charAt(0)?.toUpperCase() || "A"}
            </span>
          </div>
          <div className="hidden lg:block">
            <p className="text-xs font-medium text-gray-900 dark:text-white leading-tight whitespace-nowrap">{user?.name || "Admin"}</p>
            <p className="text-[10px] text-gray-400 leading-tight capitalize">
              {user?.userType === "VENDOR" && user?.vendorStatus
                ? `Vendor (${user.vendorStatus.toLowerCase()})`
                : user?.userType?.toLowerCase() || "admin"}
            </p>
          </div>
        </div>
      </div>

      {/* Mobile search bar (expandable) */}
      {showSearch && (
        <div className="absolute left-0 right-0 top-14 px-4 py-2 bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 md:hidden">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              autoFocus
              type="text"
              placeholder="Search..."
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300"
            />
          </div>
        </div>
      )}
    </header>
  );
}
