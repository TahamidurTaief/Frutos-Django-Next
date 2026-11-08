"use client";

import { useState } from "react";
import Link from "next/link";
import useSWR from "swr";
import api from "@/app/dashboard/_lib/api";
import { Search, Loader2, ShoppingCart, Check, Package, RefreshCw, Pencil, Trash2, Eye, FileText, Receipt } from "lucide-react";
import { useToastContext } from "@/app/dashboard/_components/Toaster";
import DataTable from "@/app/dashboard/_components/DataTable";
import Modal from "@/app/dashboard/_components/Modal";
import FormModal from "@/app/dashboard/_components/FormModal";
import ConfirmDialog from "@/app/dashboard/_components/ConfirmDialog";
import ProductForm from "@/app/dashboard/_components/ProductForm";
import AdminCreateOrder from "@/app/dashboard/orders/_components/AdminCreateOrder";
import { brandsService, colorsService, sizesService, subcategoriesService, categoriesService, shopsService } from "@/app/dashboard/_lib/services";

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

const columns = [
  { key: "order_number", label: "Order #" },
  { key: "customer_name", label: "Customer" },
  { key: "total_amount", label: "Total", render: (v) => `€${Number(v || 0).toLocaleString()}` },
  { key: "status", label: "Status", render: (v) => <StatusBadge value={v} /> },
  { key: "payment_status", label: "Payment", render: (v) => <StatusBadge value={v} /> },
  { key: "ordered_at", label: "Date", render: (v) => v ? new Date(v).toLocaleDateString() : "—" },
];

function TrackOrdersSection({ profile }) {
  const toast = useToastContext();
  const [editItem, setEditItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);
  const [viewItem, setViewItem] = useState(null);

  const { data: rawData, isLoading, error, mutate } = useSWR(
    "/api/orders/?ordering=-ordered_at",
    (url) => api.get(url),
    { revalidateOnFocus: false }
  );

  const data = rawData?.results || (Array.isArray(rawData) ? rawData : []);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-serif text-[#004A3A] font-medium tracking-tight">Recent Orders</h2>
        <button onClick={() => mutate()} className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-slate-100 text-[#00694C] transition-colors cursor-pointer" title="Refresh">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>
      
      {isLoading ? (
        <div className="py-12 flex justify-center"><Loader2 className="w-8 h-8 text-[#00694C] animate-spin" /></div>
      ) : error ? (
        <div className="py-12 text-center text-red-500">Failed to load orders.</div>
      ) : (
        <DataTable
          columns={columns}
          data={data}
          pageSize={20}
          searchable
          searchKeys={["order_number", "customer_name", "customer_email"]}
          actions={(row) => (
            <div className="flex justify-end gap-2">
              <button onClick={() => setViewItem(row)} className="db-icon-btn cursor-pointer" title="View"><Eye size={14} /></button>
              {profile?.can_update_orders && (
                <button onClick={() => setEditItem(row)} className="db-icon-btn cursor-pointer" title="Update Status"><Pencil size={14} /></button>
              )}
              {profile?.can_delete_orders && (
                <button onClick={() => setDeleteItem(row)} className="db-icon-btn text-red-500 hover:text-red-700 hover:bg-red-50 cursor-pointer" title="Delete"><Trash2 size={14} /></button>
              )}
            </div>
          )}
        />
      )}

      {/* Update Status Modal */}
      <Modal open={!!editItem} onClose={() => setEditItem(null)} title="Update Order">
        {editItem && (
          <FormModal 
            fields={[
              { key: "status", label: "Order Status", type: "select", required: true, options: [
                { value: "PENDING", label: "Pending" },
                { value: "PROCESSING", label: "Processing" },
                { value: "SHIPPED", label: "Shipped" },
                { value: "DELIVERED", label: "Delivered" },
                { value: "CANCELLED", label: "Cancelled" },
              ]},
              { key: "payment_status", label: "Payment Status", type: "select", required: true, options: [
                { value: "UNPAID", label: "Unpaid" },
                { value: "PAID", label: "Paid" },
                { value: "REFUNDED", label: "Refunded" },
              ]},
              { key: "tracking_number", label: "Tracking Number", placeholder: "Enter tracking number" },
            ]} 
            initialValues={{ 
              status: editItem.status, 
              payment_status: editItem.payment_status, 
              tracking_number: editItem.tracking_number || "" 
            }} 
            onSubmit={async (values) => {
              try {
                await api.patch(`/api/orders/${editItem.order_number}/`, values);
                toast.success("Order updated");
                setEditItem(null);
                mutate();
              } catch (err) {
                toast.error(err?.message || "Update failed");
                throw err;
              }
            }} 
            submitLabel="Update" 
          />
        )}
      </Modal>

      {/* Delete Order Confirm */}
      <ConfirmDialog
        open={!!deleteItem}
        onClose={() => setDeleteItem(null)}
        onConfirm={async () => {
          try {
            await api.delete(`/api/orders/${deleteItem.order_number}/`);
            toast.success("Order deleted successfully");
            setDeleteItem(null);
            mutate();
          } catch (err) {
            toast.error(err?.message || "Delete failed");
          }
        }}
        title="Delete Order"
        message={`Are you sure you want to delete order ${deleteItem?.order_number}?`}
        confirmLabel="Delete"
      />

      {/* View Order */}
          <Modal open={!!viewItem} onClose={() => setViewItem(null)} title={`Order Details: ${viewItem?.order_number}`} maxWidth="max-w-3xl">
            {viewItem && (
              <div className="space-y-4 pb-1">

                {/* Header: Status & Summary */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between shadow-sm">
                  <div className="space-y-3">
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Current Status</p>
                    <div className="flex flex-wrap gap-3">
                      <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                        <span className="text-xs text-slate-500 font-medium">Order:</span>
                        <StatusBadge value={viewItem.status} />
                      </div>
                      <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                        <span className="text-xs text-slate-500 font-medium">Payment:</span>
                        <StatusBadge value={viewItem.payment_status} />
                      </div>
                    </div>
                  </div>
                  <div className="sm:text-right w-full sm:w-auto pt-4 sm:pt-0 border-t border-slate-100 sm:border-0">
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">Total Amount</p>
                    <p className="text-3xl font-black text-slate-800 tracking-tight">€{Number(viewItem.total_amount).toLocaleString()}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Order Info Card */}
                  <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                    <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2 border-b border-slate-50 pb-3">
                      <div className="p-1.5 bg-blue-50 rounded-lg"><FileText className="w-4 h-4 text-blue-600" /></div>
                      Order Information
                    </h4>
                    <div className="space-y-4">
                      <div className="flex flex-col">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Date</span>
                        <span className="text-sm font-semibold text-slate-800 mt-0.5">{viewItem.ordered_at ? new Date(viewItem.ordered_at).toLocaleString() : "—"}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Tracking</span>
                        <span className="text-sm font-semibold text-slate-800 mt-0.5">{viewItem.tracking_number || "—"}</span>
                      </div>
                      {viewItem.is_wholesale_order && (
                        <div className="flex flex-col pt-2 border-t border-slate-50">
                          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Order Type</span>
                          <span className="inline-block mt-1 self-start text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-100">WHOLESALE</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Customer Info Card */}
                  <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                    <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2 border-b border-slate-50 pb-3">
                      <div className="p-1.5 bg-emerald-50 rounded-lg"><Eye className="w-4 h-4 text-emerald-600" /></div>
                      Customer Details
                    </h4>
                    <div className="space-y-4">
                      <div className="flex flex-col">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Name</span>
                        <span className="text-sm font-semibold text-slate-800 mt-0.5">{viewItem.customer_name}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Email</span>
                        <span className="text-sm font-semibold text-blue-600 mt-0.5 break-all">{viewItem.customer_email}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Phone</span>
                        <span className="text-sm font-semibold text-slate-800 mt-0.5">{viewItem.customer_phone || "—"}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* TPV Info */}
                {viewItem.payment_method === 'tpv' && (
                  <div className="bg-white p-4 rounded-xl border border-emerald-100 shadow-sm bg-gradient-to-r from-emerald-50/40 to-transparent">
                    <h4 className="text-sm font-bold text-slate-800 mb-2 flex items-center gap-2 border-b border-emerald-100/60 pb-3">
                      <div className="p-1.5 bg-emerald-100 rounded-lg"><Receipt className="w-4 h-4 text-emerald-700" /></div>
                      TPV Virtual / Pasarela Bancaria
                    </h4>
                    <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
                      <div className="flex items-center gap-2 text-slate-600">
                        <span className="font-semibold text-emerald-800">Método:</span>
                        <span>TPV (Terminal Punto de Venta Redsys · 3D Secure)</span>
                      </div>
                      <span className="inline-flex px-2 py-0.5 text-[11px] font-bold rounded-full bg-emerald-100 text-emerald-800">
                        Pasarela Segura
                      </span>
                    </div>
                  </div>
                )}

                {/* Payment Info */}
                {viewItem.payment && (
                  <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                    <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2 border-b border-slate-50 pb-3">
                      <div className="p-1.5 bg-purple-50 rounded-lg"><Receipt className="w-4 h-4 text-purple-600" /></div>
                      Payment Details
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="flex flex-col min-w-0">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Method</span>
                        <span className="text-sm font-semibold text-slate-800 mt-0.5 capitalize">{viewItem.payment.payment_method}</span>
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Transaction ID</span>
                        <span className="text-[13px] font-mono text-slate-600 bg-slate-50 px-2 py-0.5 rounded mt-0.5 inline-block self-start border border-slate-100 truncate max-w-full" title={viewItem.payment.transaction_id || ""}>{viewItem.payment.transaction_id || "—"}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Sender</span>
                        <span className="text-sm font-semibold text-slate-800 mt-0.5">{viewItem.payment.sender_number || "—"}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Admin A/C</span>
                        <span className="text-sm font-semibold text-slate-800 mt-0.5">{viewItem.payment.admin_account_number || "—"}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Items List */}
                {viewItem.items?.length > 0 && (
                  <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                      <h4 className="text-sm font-bold text-slate-800">Ordered Items ({viewItem.items.length})</h4>
                    </div>
                    <div className="divide-y divide-slate-100">
                      {viewItem.items.map((item, i) => (
                        <div key={i} className="p-4 hover:bg-slate-50/50 transition-colors flex items-center gap-4">
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
                    <div className="bg-slate-50 border-t border-slate-100 p-4 flex justify-between items-center text-slate-800">
                      <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Subtotal</span>
                      <span className="text-xl font-black text-slate-800">€{Number(viewItem.cart_subtotal || viewItem.total_amount).toLocaleString()}</span>
                    </div>
                  </div>
                )}

                {/* Status History Timeline */}
                {viewItem.updates?.length > 0 && (
                  <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                    <h4 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2 border-b border-slate-50 pb-3">
                      Status History
                    </h4>
                    <div className="relative pl-4 border-l-2 border-slate-100 space-y-4 ml-2">
                      {viewItem.updates.map((u, i) => (
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
                {!viewItem.is_wholesale_order && (
                  <div className="flex flex-wrap gap-3 pt-4 justify-end">
                    <Link href={`/dashboard/orders/${viewItem.order_number}/invoice`} className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold border border-slate-200 rounded-xl text-slate-700 bg-white hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm">
                      <FileText className="w-4 h-4 text-blue-600" /> Print A4 Invoice
                    </Link>
                    <Link href={`/dashboard/orders/${viewItem.order_number}/invoice?type=pos`} className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold border border-slate-200 rounded-xl text-slate-700 bg-white hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm">
                      <Receipt className="w-4 h-4 text-emerald-600" /> Print POS Receipt
                    </Link>
                  </div>
                )}
              </div>
            )}
          </Modal>
    </div>
  );
}

export default function StaffOrders({ profile }) {
  const canCreate = profile?.can_create_orders;
  const [activeTab, setActiveTab] = useState(canCreate ? "CREATE_ORDER" : "TRACK_ORDERS");

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-300">
      <div className="flex items-center gap-2.5 mb-4">
        <ShoppingCart className="w-6 h-6 text-[#00694C]" />
        <h1 className="text-2xl font-serif text-[#004A3A] font-medium tracking-tight">Order Line</h1>
      </div>

      <div className="flex flex-wrap gap-2 sm:gap-3 mb-4 w-full">
        {canCreate && (
          <button
            onClick={() => setActiveTab("CREATE_ORDER")}
            className={`cursor-pointer px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg font-bold text-xs sm:text-sm transition-all flex-1 sm:flex-none text-center justify-center ${activeTab === "CREATE_ORDER" ? "bg-[#00694C] text-white shadow-md" : "bg-white text-slate-600 shadow-sm hover:bg-slate-50"}`}
          >
            Create Manual Order
          </button>
        )}
        <button
          onClick={() => setActiveTab("TRACK_ORDERS")}
          className={`cursor-pointer px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg font-bold text-xs sm:text-sm transition-all flex-1 sm:flex-none text-center justify-center ${activeTab === "TRACK_ORDERS" ? "bg-[#00694C] text-white shadow-md" : "bg-white text-slate-600 shadow-sm hover:bg-slate-50"}`}
        >
          Track Orders
        </button>
      </div>
      
      {activeTab === "CREATE_ORDER" && canCreate ? <AdminCreateOrder onBack={() => setActiveTab("TRACK_ORDERS")} /> : <TrackOrdersSection profile={profile} />}
    </div>
  );
}
