"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, FileText, Pencil, Trash2, Receipt, AlertCircle, RefreshCw } from "lucide-react";
import Container from "@/app/dashboard/_components/Container";
import DataTable from "@/app/dashboard/_components/DataTable";
import Modal from "@/app/dashboard/_components/Modal";
import FormModal from "@/app/dashboard/_components/FormModal";
import ConfirmDialog from "@/app/dashboard/_components/ConfirmDialog";
import { useToastContext } from "@/app/dashboard/_components/Toaster";
import useSWR from "swr";
import { ordersService } from "@/app/dashboard/_lib/services";
import api from "@/app/dashboard/_lib/api";

const PAGE_SIZE = 20;

// Status badge helper — render a styled chip
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
  { key: "customer_email", label: "Email" },
  { key: "total_amount", label: "Total", render: (v) => `৳${Number(v || 0).toLocaleString()}` },
  { key: "cart_subtotal", label: "Subtotal", render: (v) => v ? `৳${Number(v).toLocaleString()}` : "—" },
  { key: "status", label: "Status", render: (v) => <StatusBadge value={v} /> },
  { key: "payment_status", label: "Payment", render: (v) => <StatusBadge value={v} /> },
  { key: "ordered_at", label: "Date", render: (v) => v ? new Date(v).toLocaleDateString() : "—" },
];

const statusFields = [
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
];

const FILTERS = [
  { label: "All", value: "" },
  { label: "Pending", value: "PENDING" },
  { label: "Processing", value: "PROCESSING" },
  { label: "Shipped", value: "SHIPPED" },
  { label: "Delivered", value: "DELIVERED" },
  { label: "Cancelled", value: "CANCELLED" },
];

export default function OrdersPage() {
  const toast = useToastContext();
  const [activeFilter, setFilter] = useState("");
  const [viewItem, setViewItem] = useState(null);
  const [editItem, setEditItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);

  // Backend OrderViewSet.list returns a flat array (no pagination)
  const { data: rawData, isLoading, error, mutate } = useSWR(
    ["admin-orders-list"],
    () => ordersService.list({ ordering: "-ordered_at" }),
    { revalidateOnFocus: false, keepPreviousData: true, shouldRetryOnError: false }
  );

  const rawList = rawData?.results || (Array.isArray(rawData) ? rawData : []);
  const data = activeFilter 
    ? rawList.filter(o => o.status === activeFilter) 
    : rawList;
  const totalCount = rawData?.count ?? data.length;

  const handleStatusUpdate = async (values) => {
    try {
      await api.patch(`/api/orders/${editItem.order_number}/`, values);
      toast.success("Order updated");
      setEditItem(null);
      mutate();
    } catch (err) {
      toast.error(err?.message || "Update failed");
      throw err;
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/api/orders/${deleteItem.order_number}/`);
      toast.success("Order deleted");
      setDeleteItem(null);
      mutate();
    } catch (err) {
      toast.error(err?.message || "Delete failed");
    }
  };

  return (
    <Container
      title="Orders"
      description="Manage customer orders"
      actions={
        error ? (
          <button onClick={() => mutate()} className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-red-200 text-red-600 rounded-md hover:bg-red-50 transition-colors">
            <RefreshCw className="w-3.5 h-3.5" /> Retry
          </button>
        ) : null
      }
    >
      <div className="db-filter-bar">
        {FILTERS.map(f => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`db-filter-pill${activeFilter === f.value ? " active" : ""}`}
          >
            {f.label}
          </button>
        ))}
        <span style={{ marginLeft: "auto", fontSize: "12px", color: "#94a3b8", fontWeight: "600" }}>
          {data.length} orders
        </span>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-4">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>
            {error?.message?.includes("credentials") || error?.status === 401
              ? "Not authenticated. Please log in to the admin dashboard."
              : error?.message || "Failed to load orders. Check that the backend server is running."}
          </span>
        </div>
      )}
      <DataTable
        columns={columns}
        data={data}
        pageSize={PAGE_SIZE}
        loading={isLoading}
        searchable
        searchKeys={["order_number", "customer_name", "customer_email"]}
        actions={(row) => (
          <div className="flex items-center justify-end gap-1">
            <button onClick={() => setViewItem(row)} className="db-icon-btn" title="View"><Eye size={14} /></button>
            <button onClick={() => setEditItem(row)} className="db-icon-btn" title="Update Status"><Pencil size={14} /></button>
            <Link href={`/dashboard/orders/${row.order_number}/invoice`} className="db-icon-btn" title="Invoice"><FileText size={14} /></Link>
            <button onClick={() => setDeleteItem(row)} className="db-icon-btn danger" title="Delete"><Trash2 size={14} /></button>
          </div>
        )}
      />

      {/* Update Status */}
      <Modal open={!!editItem} onClose={() => setEditItem(null)} title="Update Order">
        {editItem && <FormModal fields={statusFields} initialValues={{ status: editItem.status, payment_status: editItem.payment_status, tracking_number: editItem.tracking_number || "" }} onSubmit={handleStatusUpdate} submitLabel="Update" />}
      </Modal>

      {/* View Order */}
      <Modal open={!!viewItem} onClose={() => setViewItem(null)} title="Order Details">
        {viewItem && (
          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
            {/* Order Info */}
            <div>
              <h4 className="text-xs font-medium uppercase tracking-wider text-slate-400 mb-2">Order Information</h4>
              {[
                ["Order #", viewItem.order_number],
                ["Status", viewItem.status_display || viewItem.status],
                ["Payment", viewItem.payment_status_display || viewItem.payment_status],
                ["Tracking", viewItem.tracking_number || "—"],
                ["Date", viewItem.ordered_at ? new Date(viewItem.ordered_at).toLocaleString() : "—"],
              ].map(([label, val]) => (
                <div key={label} className="flex justify-between py-1.5 border-b border-slate-100 last:border-0">
                  <span className="text-sm text-slate-500">{label}</span>
                  <span className="text-sm font-medium text-slate-800">{String(val)}</span>
                </div>
              ))}
            </div>

            {/* Customer Info */}
            <div>
              <h4 className="text-xs font-medium uppercase tracking-wider text-slate-400 mb-2">Customer</h4>
              {[
                ["Name", viewItem.customer_name],
                ["Email", viewItem.customer_email],
                ["Phone", viewItem.customer_phone],
              ].map(([label, val]) => (
                <div key={label} className="flex justify-between py-1.5 border-b border-slate-100 last:border-0">
                  <span className="text-sm text-slate-500">{label}</span>
                  <span className="text-sm font-medium text-slate-800">{String(val || "—")}</span>
                </div>
              ))}
            </div>

            {/* Payment Info */}
            {viewItem.payment && (
              <div>
                <h4 className="text-xs font-medium uppercase tracking-wider text-slate-400 mb-2">Payment Details</h4>
                {[
                  ["Method", viewItem.payment.payment_method],
                  ["Transaction ID", viewItem.payment.transaction_id],
                  ["Sender Number", viewItem.payment.sender_number],
                  ["Admin Account", viewItem.payment.admin_account_number],
                ].map(([label, val]) => (
                  <div key={label} className="flex justify-between py-1.5 border-b border-slate-100 last:border-0">
                    <span className="text-sm text-slate-500">{label}</span>
                    <span className="text-sm font-medium text-slate-800">{String(val || "—")}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Items */}
            {viewItem.items?.length > 0 && (
              <div>
                <h4 className="text-xs font-medium uppercase tracking-wider text-slate-400 mb-2">Items ({viewItem.items.length})</h4>
                <div className="border border-slate-100 rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50">
                        <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">Product</th>
                        <th className="px-3 py-2 text-center text-xs font-medium text-slate-500">Color/Size</th>
                        <th className="px-3 py-2 text-center text-xs font-medium text-slate-500">Qty</th>
                        <th className="px-3 py-2 text-right text-xs font-medium text-slate-500">Price</th>
                        <th className="px-3 py-2 text-right text-xs font-medium text-slate-500">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {viewItem.items.map((item, i) => (
                        <tr key={i} className="border-t border-slate-100">
                          <td className="px-3 py-2 text-slate-800">{item.product_name || `Product #${item.product}`}</td>
                          <td className="px-3 py-2 text-center text-slate-500 text-xs">
                            {[item.color_name, item.size_name].filter(Boolean).join(" / ") || "—"}
                          </td>
                          <td className="px-3 py-2 text-center text-slate-600">{item.quantity}</td>
                          <td className="px-3 py-2 text-right text-slate-600">৳{Number(item.unit_price).toLocaleString()}</td>
                          <td className="px-3 py-2 text-right font-medium text-slate-800">৳{(item.quantity * Number(item.unit_price)).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Totals */}
            <div>
              <h4 className="text-xs font-medium uppercase tracking-wider text-slate-400 mb-2">Totals</h4>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-sm text-slate-500">Subtotal</span>
                <span className="text-sm text-slate-800">৳{Number(viewItem.cart_subtotal || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1.5 font-semibold">
                <span className="text-sm text-slate-800">Total</span>
                <span className="text-sm text-slate-800">৳{Number(viewItem.total_amount).toLocaleString()}</span>
              </div>
            </div>

            {/* Order Updates */}
            {viewItem.updates?.length > 0 && (
              <div>
                <h4 className="text-xs font-medium uppercase tracking-wider text-slate-400 mb-2">Status History</h4>
                <div className="space-y-2">
                  {viewItem.updates.map((u, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm">
                      <span className="text-xs text-slate-400 whitespace-nowrap mt-0.5">{u.timestamp ? new Date(u.timestamp).toLocaleString() : ""}</span>
                      <div>
                        <span className="font-medium text-slate-700">{u.status}</span>
                        {u.notes && <p className="text-xs text-slate-500 mt-0.5">{u.notes}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Invoice Links */}
            <div className="flex gap-2 pt-2 border-t border-slate-200">
              <Link href={`/dashboard/orders/${viewItem.order_number}/invoice`} className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-slate-200 rounded-md text-slate-700 hover:bg-slate-50 transition-colors">
                <FileText className="w-3.5 h-3.5" /> A4 Invoice
              </Link>
              <Link href={`/dashboard/orders/${viewItem.order_number}/invoice?type=pos`} className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-slate-200 rounded-md text-slate-700 hover:bg-slate-50 transition-colors">
                <Receipt className="w-3.5 h-3.5" /> POS Invoice
              </Link>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={!!deleteItem}
        onClose={() => setDeleteItem(null)}
        onConfirm={handleDelete}
        title="Delete Order"
        message={`Are you sure you want to delete order ${deleteItem?.order_number}?`}
        confirmLabel="Delete"
      />
    </Container>
  );
}

