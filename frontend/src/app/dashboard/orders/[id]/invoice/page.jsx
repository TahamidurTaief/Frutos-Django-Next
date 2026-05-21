"use client";

import { useState, useEffect } from "react";
import { Printer, Download, ArrowLeft, Loader2, FileText, Receipt } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import useSWR from "swr";
import { ordersService, siteSettingsService } from "@/app/dashboard/_lib/services";
import api from "@/app/dashboard/_lib/api";

/* ─── POS Receipt Layout (thermal 80mm) ─── */
function POSInvoice({ order, items, subtotal, total, shipping, storeName, logoUrl }) {
  return (
    <div className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm mx-auto print:shadow-none print:border-0" style={{ maxWidth: "80mm" }}>
      <div className="p-4 print:p-2 text-center" style={{ fontFamily: "monospace", fontSize: "12px" }}>
        {/* Header */}
        <div className="border-b border-dashed border-gray-300 dark:border-gray-700 pb-2 mb-2">
          {logoUrl ? (
            <img src={logoUrl} alt={storeName} style={{ height: '32px', width: 'auto', maxWidth: '120px' }} className="mx-auto mb-1 object-contain" />
          ) : (
            <p className="font-bold text-base text-gray-900 dark:text-white">{storeName}</p>
          )}
          <p className="text-[10px] text-gray-500">Dhaka, Bangladesh</p>
          <p className="text-[10px] text-gray-500">support@icommerce.passmcq.com</p>
        </div>

        {/* Order Info */}
        <div className="text-left mb-2 text-[11px] text-gray-700 dark:text-gray-300">
          <p>Order: <span className="font-semibold">{order.order_number}</span></p>
          <p>Date: {order.ordered_at ? new Date(order.ordered_at).toLocaleString() : "—"}</p>
          <p>Customer: {order.customer_name}</p>
          {order.customer_phone && <p>Phone: {order.customer_phone}</p>}
        </div>

        {/* Divider */}
        <div className="border-b border-dashed border-gray-300 dark:border-gray-700 mb-2" />

        {/* Items */}
        <div className="text-left text-[11px]">
          {items.map((item, i) => (
            <div key={i} className="mb-1.5">
              <div className="flex justify-between text-gray-900 dark:text-white">
                <span className="flex-1 truncate pr-2">{item.product_name || `#${item.product}`}</span>
              </div>
              <div className="flex justify-between text-gray-500 dark:text-gray-400 text-[10px]">
                <span>
                  {item.quantity} x ৳{Number(item.unit_price).toLocaleString()}
                  {(item.color_name || item.size_name) && ` (${[item.color_name, item.size_name].filter(Boolean).join("/")})`}
                </span>
                <span className="text-gray-900 dark:text-white font-medium">৳{(item.quantity * Number(item.unit_price)).toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="border-b border-dashed border-gray-300 dark:border-gray-700 my-2" />

        {/* Totals */}
        <div className="text-[11px] space-y-0.5">
          <div className="flex justify-between text-gray-600 dark:text-gray-400">
            <span>Subtotal</span><span>৳{subtotal.toLocaleString()}</span>
          </div>
          {shipping > 0 && (
            <div className="flex justify-between text-gray-600 dark:text-gray-400">
              <span>Shipping</span><span>৳{shipping.toLocaleString()}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-sm text-gray-900 dark:text-white pt-1 border-t border-dashed border-gray-300 dark:border-gray-700 mt-1">
            <span>TOTAL</span><span>৳{total.toLocaleString()}</span>
          </div>
        </div>

        {/* Payment */}
        {order.payment && (
          <div className="text-left text-[10px] text-gray-500 mt-2 pt-2 border-t border-dashed border-gray-300 dark:border-gray-700">
            <p>Payment: {order.payment.payment_method || "—"}</p>
            {order.payment.transaction_id && <p>Txn: {order.payment.transaction_id}</p>}
          </div>
        )}

        {/* Footer */}
        <div className="border-t border-dashed border-gray-300 dark:border-gray-700 mt-2 pt-2">
          <p className="text-[10px] text-gray-400">Thank you for shopping!</p>
          <p className="text-[10px] text-gray-400">www.icommerce.passmcq.com</p>
          {logoUrl && <p className="text-[10px] text-gray-400">{storeName}</p>}
        </div>
      </div>
    </div>
  );
}

/* ─── A4 Full Invoice Layout ─── */
function A4Invoice({ order, items, subtotal, total, shipping, storeName, logoUrl }) {
  return (
    <div className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm max-w-3xl mx-auto print:shadow-none print:border-0 print:max-w-none">
      <div className="p-8 print:p-12" style={{ minHeight: "297mm", maxWidth: "210mm", margin: "0 auto" }}>
        {/* Header */}
        <div className="flex justify-between items-start mb-10">
          <div>
            {logoUrl ? (
              <img src={logoUrl} alt={storeName} style={{ height: '48px', width: 'auto', maxWidth: '200px' }} className="mb-2 object-contain" />
            ) : (
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{storeName}</h1>
            )}
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Dhaka, Bangladesh</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">support@icommerce.passmcq.com</p>
          </div>
          <div className="text-right">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">INVOICE</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">#{order.order_number}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Date: {order.ordered_at ? new Date(order.ordered_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "—"}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Status: {order.status_display || order.status}</p>
          </div>
        </div>

        {/* Bill To + Payment */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-gray-400 mb-1">Bill To</p>
            <p className="text-sm font-medium text-gray-900 dark:text-white">{order.customer_name}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{order.customer_email}</p>
            {order.customer_phone && <p className="text-sm text-gray-500 dark:text-gray-400">{order.customer_phone}</p>}
          </div>
          {order.payment && (
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-gray-400 mb-1">Payment</p>
              <p className="text-sm text-gray-700 dark:text-gray-300">Method: {order.payment.payment_method || "—"}</p>
              {order.payment.transaction_id && <p className="text-sm text-gray-500 dark:text-gray-400">Txn: {order.payment.transaction_id}</p>}
              {order.payment.sender_number && <p className="text-sm text-gray-500 dark:text-gray-400">Sender: {order.payment.sender_number}</p>}
              <p className="text-sm text-gray-500 dark:text-gray-400">Payment: {order.payment_status_display || order.payment_status}</p>
            </div>
          )}
        </div>

        {/* Items */}
        <table className="w-full text-sm mb-8">
          <thead>
            <tr className="border-b-2 border-gray-200 dark:border-gray-700">
              <th className="py-2 text-left font-medium text-gray-500 dark:text-gray-400">#</th>
              <th className="py-2 text-left font-medium text-gray-500 dark:text-gray-400">Item</th>
              <th className="py-2 text-left font-medium text-gray-500 dark:text-gray-400">Variant</th>
              <th className="py-2 text-center font-medium text-gray-500 dark:text-gray-400">Qty</th>
              <th className="py-2 text-right font-medium text-gray-500 dark:text-gray-400">Price</th>
              <th className="py-2 text-right font-medium text-gray-500 dark:text-gray-400">Amount</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr key={i} className="border-b border-gray-100 dark:border-gray-800">
                <td className="py-3 text-gray-400">{i + 1}</td>
                <td className="py-3 text-gray-900 dark:text-white">{item.product_name || `Product #${item.product}`}</td>
                <td className="py-3 text-gray-500 dark:text-gray-400 text-xs">{[item.color_name, item.size_name].filter(Boolean).join(" / ") || "—"}</td>
                <td className="py-3 text-center text-gray-600 dark:text-gray-400">{item.quantity}</td>
                <td className="py-3 text-right text-gray-600 dark:text-gray-400">৳{Number(item.unit_price).toLocaleString()}</td>
                <td className="py-3 text-right font-medium text-gray-900 dark:text-white">৳{(item.quantity * Number(item.unit_price)).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="flex justify-end">
          <div className="w-64 space-y-1.5">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">Subtotal</span>
              <span className="text-gray-900 dark:text-white">৳{subtotal.toLocaleString()}</span>
            </div>
            {shipping > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Shipping</span>
                <span className="text-gray-900 dark:text-white">৳{shipping.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-semibold pt-2 border-t border-gray-200 dark:border-gray-700">
              <span className="text-gray-900 dark:text-white">Total</span>
              <span className="text-gray-900 dark:text-white">৳{total.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Tracking */}
        {order.tracking_number && (
          <div className="mt-6 text-sm text-gray-500 dark:text-gray-400">
            <span className="font-medium">Tracking #:</span> {order.tracking_number}
          </div>
        )}

        {/* Footer */}
        <div className="mt-16 pt-6 border-t border-gray-200 dark:border-gray-700 text-center">
          <p className="text-xs text-gray-400">Thank you for your business.</p>
          <p className="text-xs text-gray-400 mt-0.5">{storeName} &middot; support@icommerce.passmcq.com</p>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Invoice Page ─── */
export default function InvoicePage() {
  const { id } = useParams();
  // Read ?type=pos from URL after mount (avoids useSearchParams/Suspense requirement)
  const [invoiceType, setInvoiceType] = useState("a4");
  const [downloading, setDownloading] = useState(false);

  const { data: settingsRaw } = useSWR(
    "site-settings-invoice",
    () => siteSettingsService.list({ page_size: 100 }),
    { revalidateOnFocus: false }
  );
  const settingsMap = {};
  (settingsRaw?.results || (Array.isArray(settingsRaw) ? settingsRaw : [])).forEach(s => { settingsMap[s.key] = s.value; });
  const storeName = settingsMap.store_name || "iCommerce";
  const logoUrl = settingsMap.logo_url || null;

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("type") === "pos") setInvoiceType("pos");
    }
  }, []);

  const { data: order, isLoading, error } = useSWR(
    id ? ["order-invoice-detail", id] : null,
    () => ordersService.get(id),
    { revalidateOnFocus: false }
  );

  const handleDownload = async () => {
    setDownloading(true);
    try {
      // Hit the backend invoice endpoint which returns HTML
      const res = await api.download(`/api/orders/invoice/${id}/?download=1`);
      if (!res.ok) {
        // Fallback to print
        window.print();
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `invoice-${id}.html`;  // HTML content, correct extension
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      // Fallback to browser print
      window.print();
    } finally {
      setDownloading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 lg:p-6 flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="p-4 lg:p-6">
        <Link href="/dashboard/orders" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to Orders
        </Link>
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">
            {error?.status === 404 ? `Order "${id}" not found.` : error?.message || "Failed to load order details."}
          </p>
          <Link href="/dashboard/orders" className="text-sm text-gray-600 dark:text-gray-400 underline mt-2 inline-block">Back to Orders</Link>
        </div>
      </div>
    );
  }

  const items = order.items || [];
  const subtotal = Number(order.cart_subtotal || 0);
  const total = Number(order.total_amount || 0);
  const shipping = total - subtotal > 0 ? total - subtotal : 0;

  return (
    <div className="p-4 lg:p-6">
      {/* Actions bar */}
      <div className="flex items-center justify-between mb-4 print:hidden">
        <Link href="/dashboard/orders" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
          <ArrowLeft className="w-4 h-4" /> Back to Orders
        </Link>
        <div className="flex items-center gap-2">
          {/* Format Toggle */}
          <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden">
            <button
              onClick={() => setInvoiceType("a4")}
              className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium transition-colors ${invoiceType === "a4" ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900" : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900"}`}
            >
              <FileText className="w-3.5 h-3.5" /> A4
            </button>
            <button
              onClick={() => setInvoiceType("pos")}
              className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium transition-colors ${invoiceType === "pos" ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900" : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900"}`}
            >
              <Receipt className="w-3.5 h-3.5" /> POS
            </button>
          </div>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-700 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
          >
            <Printer className="w-4 h-4" /> Print
          </button>
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-md hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />} Download
          </button>
        </div>
      </div>

      {/* Invoice Content */}
      {invoiceType === "pos" ? (
        <POSInvoice order={order} items={items} subtotal={subtotal} total={total} shipping={shipping} storeName={storeName} logoUrl={logoUrl} />
      ) : (
        <A4Invoice order={order} items={items} subtotal={subtotal} total={total} shipping={shipping} storeName={storeName} logoUrl={logoUrl} />
      )}
    </div>
  );
}
