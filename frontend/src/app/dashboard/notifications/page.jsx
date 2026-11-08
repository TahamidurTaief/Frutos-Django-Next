"use client";

import { useState } from "react";
import useSWR from "swr";
import Link from "next/link";
import api from "@/app/dashboard/_lib/api";
import { Bell, CheckCircle2, Trash2, FileText, Eye, Receipt, Store, ShoppingBag, Package, AlertTriangle, AlertCircle } from "lucide-react";
import Modal from "@/app/dashboard/_components/Modal";
import { ordersService } from "@/app/dashboard/_lib/services";

const getIcon = (name, className = "w-5 h-5 sm:w-6 sm:h-6") => {
  switch (name?.toLowerCase()) {
    case 'store':
    case 'storefront': return <Store className={className} />;
    case 'shopping_cart':
    case 'shopping_bag':
    case 'order': return <ShoppingBag className={className} />;
    case 'package':
    case 'inventory': return <Package className={className} />;
    case 'warning': return <AlertTriangle className={className} />;
    case 'error': return <AlertCircle className={className} />;
    case 'receipt':
    case 'invoice': return <Receipt className={className} />;
    default: return <Bell className={className} />;
  }
};

function StatusBadge({ value }) {
  const colors = {
    pending: "bg-amber-50 text-amber-700",
    processing: "bg-blue-50 text-blue-700",
    shipped: "bg-blue-50 text-blue-700",
    delivered: "bg-emerald-50 text-emerald-700",
    completed: "bg-emerald-50 text-emerald-700",
    cancelled: "bg-red-50 text-red-700",
    paid: "bg-emerald-50 text-emerald-700",
    unpaid: "bg-amber-50 text-amber-700",
    refunded: "bg-red-50 text-red-700",
  };
  const key = String(value || "").toLowerCase();
  return (
    <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full capitalize ${colors[key] || "bg-slate-100 text-slate-600"}`}>
      {key.replace(/_/g, " ") || "—"}
    </span>
  );
}

export default function NotificationsPage() {
  const [page, setPage] = useState(1);
  const { data: rawNotifs, mutate } = useSWR(
    `dashboard-notifications-page-${page}-admin`,
    () => api.get(`/api/auth/notifications/?page=${page}&page_size=20&context=dashboard`),
    { revalidateOnFocus: true, refreshInterval: 10000, dedupingInterval: 5000 }
  );

  const [selectedIds, setSelectedIds] = useState([]);
  const [viewNotif, setViewNotif] = useState(null);

  const orderNum = viewNotif?.metadata?.order_number || viewNotif?.metadata?.orderNumber;

  const { data: orderDetails, isLoading: orderLoading } = useSWR(
    orderNum ? `admin-order-${orderNum}` : null,
    () => ordersService.get(orderNum),
    { revalidateOnFocus: false }
  );

  const notifications = rawNotifs?.results || (Array.isArray(rawNotifs) ? rawNotifs : []);
  const totalPages = rawNotifs?.total_pages || 1;

  const handleMarkAsRead = async (id) => {
    try {
      await api.post(`/api/auth/notifications/mark-read/`, { ids: [id], context: 'dashboard' });
      mutate(); // Refresh the list
    } catch (err) {
      console.error("Failed to mark notification as read", err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.post("/api/auth/notifications/mark-read/", { all: true, context: 'dashboard' });
      mutate();
    } catch (err) {
      console.error("Failed to mark all as read", err);
    }
  };

  const handleToggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === notifications.length && notifications.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(notifications.map((n) => n.id));
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) return;
    try {
      await api.delete("/api/auth/notifications/bulk-delete/", {
        body: JSON.stringify({ ids: selectedIds }),
      });
      setSelectedIds([]);
      mutate();
    } catch (err) {
      console.error("Failed to delete notifications", err);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Notifications</h1>
          <p className="text-sm text-slate-500 mt-1">Stay updated with the latest system alerts and activity.</p>
        </div>
        <div className="flex gap-3">
          {selectedIds.length > 0 && (
            <button
              onClick={handleDeleteSelected}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200 rounded-lg text-sm font-semibold text-red-600 hover:bg-red-100 transition-colors shadow-sm"
            >
              <Trash2 className="w-4 h-4" />
              Delete ({selectedIds.length})
            </button>
          )}
          <button
            onClick={handleMarkAllAsRead}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            Mark all as read
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {notifications.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <Bell className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-700">No notifications yet</h3>
            <p className="text-slate-500 mt-1 text-sm">When you get notifications, they'll show up here.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            <div className="p-4 sm:px-5 sm:py-3 bg-slate-50 flex items-center gap-4 border-b border-slate-200">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600 cursor-pointer"
                checked={notifications.length > 0 && selectedIds.length === notifications.length}
                onChange={handleSelectAll}
              />
              <span className="text-sm font-semibold text-slate-600">Select All</span>
            </div>
            {notifications.map((notif) => {
              const isUnread = !notif.is_read;
              const iconName = notif.icon || notif.metadata?.icon || 'notifications';

              return (
                <div 
                  key={notif.id} 
                  className={`p-3 sm:p-5 flex gap-3 sm:gap-4 transition-all cursor-pointer border-b border-slate-100 last:border-0 hover:shadow-sm ${isUnread ? 'bg-[#f8fafc] hover:bg-[#f1f5f9]' : 'bg-white hover:bg-slate-50'}`}
                  onClick={() => {
                    setViewNotif(notif);
                    if (isUnread) handleMarkAsRead(notif.id);
                  }}
                >
                  <div className="shrink-0 flex items-center pt-1.5 sm:pt-2" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-slate-300 text-[#085041] focus:ring-[#085041] cursor-pointer"
                      checked={selectedIds.includes(notif.id)}
                      onChange={() => handleToggleSelect(notif.id)}
                    />
                  </div>
                  <div className={`mt-0.5 sm:mt-1 p-2 sm:p-3 rounded-xl sm:rounded-2xl shrink-0 h-fit shadow-sm border ${isUnread ? 'bg-white text-[#085041] border-[#085041]/20' : 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                    {getIcon(iconName)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:justify-between items-start gap-1 sm:gap-4">
                      <h4 className={`text-sm sm:text-base leading-snug sm:leading-normal pr-4 sm:pr-0 ${isUnread ? 'font-bold text-slate-900' : 'font-semibold text-slate-800'}`}>
                        {notif.title.replace(/[\u{1F300}-\u{1F6FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{1F1E6}-\u{1F1FF}\u{2300}-\u{23FF}\u{2B50}\u{2B06}]/gu, '').trim()}
                      </h4>
                      <span className="text-[10px] sm:text-xs font-medium sm:font-semibold text-slate-400 sm:whitespace-nowrap sm:bg-slate-50 sm:px-2.5 sm:py-1 sm:rounded-md sm:border border-slate-100 shrink-0">
                        {new Date(notif.created_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                      </span>
                    </div>
                    <p className="text-[13px] sm:text-sm text-slate-600 mt-1 sm:mt-2 leading-relaxed line-clamp-2">
                      {notif.message}
                    </p>
                  </div>
                  
                  {isUnread && (
                    <div className="shrink-0 flex items-center" onClick={(e) => e.stopPropagation()}>
                      <button 
                        onClick={() => handleMarkAsRead(notif.id)}
                        className="p-2 text-[#085041] hover:bg-[#085041]/10 rounded-lg transition-colors"
                        title="Mark as read"
                      >
                        <CheckCircle2 className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 bg-white border border-slate-200 rounded-xl">
          <button
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
            className="px-3 py-1.5 text-sm font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-slate-600">Page {page} of {totalPages}</span>
          <button
            disabled={page === totalPages}
            onClick={() => setPage(p => p + 1)}
            className="px-3 py-1.5 text-sm font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {/* View Notification Modal */}
      <Modal open={!!viewNotif} onClose={() => setViewNotif(null)} title={orderNum ? `Order Details: ${orderNum}` : "Notification Details"} maxWidth={orderNum ? "max-w-3xl" : "max-w-2xl"}>
        {viewNotif && (
          <div className="space-y-6 pb-2">
            {!orderNum ? (
              <>
                <div className="flex items-start gap-4 p-5 bg-slate-50 border border-slate-100 rounded-2xl shadow-sm">
                  <div className={`p-3 rounded-2xl shrink-0 shadow-sm border bg-white text-[#085041] border-[#085041]/20`}>
                    {getIcon(viewNotif.icon || viewNotif.metadata?.icon, "w-7 h-7")}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-800">{viewNotif.title.replace(/[\u{1F300}-\u{1F6FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{1F1E6}-\u{1F1FF}\u{2300}-\u{23FF}\u{2B50}\u{2B06}]/gu, '').trim()}</h3>
                    <p className="text-xs font-semibold text-slate-500 mt-1">
                      {new Date(viewNotif.created_at).toLocaleString([], { dateStyle: 'full', timeStyle: 'short' })}
                    </p>
                  </div>
                </div>
                
                <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm text-slate-700 leading-relaxed text-[15px]">
                  {viewNotif.message}
                </div>

                <div className="flex justify-end pt-2">
                  <button 
                    onClick={() => setViewNotif(null)}
                    className="bg-white border border-slate-300 text-slate-700 px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm hover:bg-slate-50 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </>
            ) : orderLoading ? (
              <div className="p-12 text-center text-slate-500">Loading order details...</div>
            ) : orderDetails ? (
              <>
                {/* Header: Status & Summary */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between shadow-sm">
                  <div className="space-y-3">
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Current Status</p>
                    <div className="flex flex-wrap gap-3">
                      <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                        <span className="text-xs text-slate-500 font-medium">Order:</span>
                        <StatusBadge value={orderDetails.status} />
                      </div>
                      <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                        <span className="text-xs text-slate-500 font-medium">Payment:</span>
                        <StatusBadge value={orderDetails.payment_status} />
                      </div>
                    </div>
                  </div>
                  <div className="sm:text-right w-full sm:w-auto pt-4 sm:pt-0 border-t border-slate-100 sm:border-0">
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">Total Amount</p>
                    <p className="text-3xl font-black text-slate-800 tracking-tight">€{Number(orderDetails.total_amount).toLocaleString()}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Order Info Card */}
                  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                    <h4 className="text-sm font-bold text-slate-800 mb-5 flex items-center gap-2.5 border-b border-slate-50 pb-3">
                      <div className="p-1.5 bg-blue-50 rounded-lg"><FileText className="w-4 h-4 text-blue-600" /></div>
                      Order Information
                    </h4>
                    <div className="space-y-4">
                      <div className="flex flex-col">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Date</span>
                        <span className="text-sm font-semibold text-slate-800 mt-0.5">{orderDetails.ordered_at ? new Date(orderDetails.ordered_at).toLocaleString() : "—"}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Tracking</span>
                        <span className="text-sm font-semibold text-slate-800 mt-0.5">{orderDetails.tracking_number || "—"}</span>
                      </div>
                      {orderDetails.is_wholesale_order && (
                        <div className="flex flex-col pt-2 border-t border-slate-50">
                          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Order Type</span>
                          <span className="inline-block mt-1 self-start text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-100">WHOLESALE</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Customer Info Card */}
                  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                    <h4 className="text-sm font-bold text-slate-800 mb-5 flex items-center gap-2.5 border-b border-slate-50 pb-3">
                      <div className="p-1.5 bg-emerald-50 rounded-lg"><Eye className="w-4 h-4 text-emerald-600" /></div>
                      Customer Details
                    </h4>
                    <div className="space-y-4">
                      <div className="flex flex-col">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Name</span>
                        <span className="text-sm font-semibold text-slate-800 mt-0.5">{orderDetails.customer_name}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Email</span>
                        <span className="text-sm font-semibold text-blue-600 mt-0.5 break-all">{orderDetails.customer_email}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Phone</span>
                        <span className="text-sm font-semibold text-slate-800 mt-0.5">{orderDetails.customer_phone || "—"}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Info */}
                {orderDetails.payment && (
                  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <h4 className="text-sm font-bold text-slate-800 mb-5 flex items-center gap-2.5 border-b border-slate-50 pb-3">
                      <div className="p-1.5 bg-purple-50 rounded-lg"><Receipt className="w-4 h-4 text-purple-600" /></div>
                      Payment Details
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      <div className="flex flex-col">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Method</span>
                        <span className="text-sm font-semibold text-slate-800 mt-0.5 capitalize">{orderDetails.payment.payment_method}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Transaction ID</span>
                        <span className="text-sm font-mono text-slate-600 bg-slate-50 px-2 py-0.5 rounded mt-0.5 inline-block self-start border border-slate-100">{orderDetails.payment.transaction_id || "—"}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Sender</span>
                        <span className="text-sm font-semibold text-slate-800 mt-0.5">{orderDetails.payment.sender_number || "—"}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Admin A/C</span>
                        <span className="text-sm font-semibold text-slate-800 mt-0.5">{orderDetails.payment.admin_account_number || "—"}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Items List */}
                {orderDetails.items?.length > 0 && (
                  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="p-5 border-b border-slate-100 bg-slate-50/50">
                      <h4 className="text-sm font-bold text-slate-800">Ordered Items ({orderDetails.items.length})</h4>
                    </div>
                    <div className="divide-y divide-slate-100">
                      {orderDetails.items.map((item, i) => (
                        <div key={i} className="p-5 hover:bg-slate-50/50 transition-colors flex items-center gap-5">
                          <div className="w-14 h-14 bg-white border border-slate-100 shadow-sm rounded-xl flex items-center justify-center shrink-0 p-1">
                            {item.product_image ? (
                              <img src={item.product_image} alt={item.product_name} className="w-full h-full object-cover rounded-lg" />
                            ) : (
                              <FileText className="w-5 h-5 text-slate-300" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[15px] font-bold text-slate-800 truncate mb-1">{item.product_name || `Product #${item.product}`}</p>
                            <p className="inline-block px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs font-semibold">
                              {[item.color_name, item.size_name].filter(Boolean).join(" / ") || "Standard"}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-[15px] font-black text-slate-900">€{(item.quantity * Number(item.unit_price)).toLocaleString()}</p>
                            <p className="text-[11px] font-bold text-slate-400 uppercase mt-1">{item.quantity} × €{Number(item.unit_price).toLocaleString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="bg-slate-50 border-t border-slate-100 p-5 flex justify-between items-center text-slate-800">
                      <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Subtotal</span>
                      <span className="text-xl font-black text-slate-800">€{Number(orderDetails.cart_subtotal || orderDetails.total_amount).toLocaleString()}</span>
                    </div>
                  </div>
                )}

                {/* Status History Timeline */}
                {orderDetails.updates?.length > 0 && (
                  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <h4 className="text-sm font-bold text-slate-800 mb-6 flex items-center gap-2.5 border-b border-slate-50 pb-3">
                      Status History
                    </h4>
                    <div className="relative pl-4 border-l-2 border-slate-100 space-y-6 ml-2">
                      {orderDetails.updates.map((u, i) => (
                        <div key={i} className="relative">
                          <div className="absolute -left-[21px] top-1.5 w-3 h-3 bg-blue-600 rounded-full ring-4 ring-white shadow-sm" />
                          <div className="pl-4">
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                              <span className="text-sm font-bold text-slate-800">{u.status}</span>
                              <span className="text-xs font-semibold text-slate-400">{u.timestamp ? new Date(u.timestamp).toLocaleString() : ""}</span>
                            </div>
                            {u.notes && (
                              <div className="mt-2.5 bg-slate-50 p-3 rounded-xl border border-slate-100/60">
                                <p className="text-[13px] text-slate-600">{u.notes}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Invoice Links - Hidden for Wholesale */}
                {!orderDetails.is_wholesale_order && (
                  <div className="flex flex-wrap gap-3 pt-4 justify-end">
                    <Link href={`/dashboard/orders/${orderDetails.order_number}/invoice`} className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold border border-slate-200 rounded-xl text-slate-700 bg-white hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm">
                      <FileText className="w-4 h-4 text-blue-600" /> Print A4 Invoice
                    </Link>
                    <Link href={`/dashboard/orders/${orderDetails.order_number}/invoice?type=pos`} className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold border border-slate-200 rounded-xl text-slate-700 bg-white hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm">
                      <Receipt className="w-4 h-4 text-emerald-600" /> Print POS Receipt
                    </Link>
                  </div>
                )}
              </>
            ) : (
              <div className="p-12 text-center text-red-500 font-semibold">Failed to load order details.</div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
