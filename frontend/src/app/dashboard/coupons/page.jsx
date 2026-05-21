"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Ticket, Truck } from "lucide-react";
import Container from "@/app/dashboard/_components/Container";
import DataTable from "@/app/dashboard/_components/DataTable";
import Modal from "@/app/dashboard/_components/Modal";
import ConfirmDialog from "@/app/dashboard/_components/ConfirmDialog";
import { useToastContext } from "@/app/dashboard/_components/Toaster";
import { useModel } from "@/app/dashboard/_lib/useModel";
import SearchableSelect from "@/app/dashboard/_components/SearchableSelect";
import { couponsService, freeShippingRulesService } from "@/app/dashboard/_lib/services";

const PAGE_SIZE = 20;
const TABS = [
  { id: "coupons", label: "Coupons" },
  { id: "freeshipping", label: "Free Shipping Rules" },
];

const COUPON_TYPES = [
  { value: "PRODUCT_DISCOUNT", label: "Product Discount" },
  { value: "MIN_PRODUCT_QUANTITY", label: "Minimum Product Quantity" },
  { value: "SHIPPING_DISCOUNT", label: "Shipping Discount" },
  { value: "CART_TOTAL_DISCOUNT", label: "Cart Total Discount" },
  { value: "FIRST_TIME_USER", label: "First Time User" },
  { value: "USER_SPECIFIC", label: "User Specific" },
];

const inp = "w-full min-w-0 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-gray-400";
const lbl = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";

function toLocalDatetime(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/* ─── Coupon Form ────────────────────────────────────────────── */
function CouponForm({ initial = {}, onSubmit, submitLabel = "Save" }) {
  const [v, setV] = useState({
    code: "", type: "PRODUCT_DISCOUNT", discount_percent: "", min_quantity_required: "1",
    min_cart_total: "", usage_limit: "", active: "true", valid_from: "", expires_at: "",
    ...initial,
    active: String(initial.active ?? true),
    usage_limit: initial.usage_limit != null ? String(initial.usage_limit) : "",
    valid_from: toLocalDatetime(initial.valid_from),
    expires_at: toLocalDatetime(initial.expires_at),
  });
  const [submitting, setSubmitting] = useState(false);
  const set = (k, val) => setV(p => ({ ...p, [k]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit({
        code: v.code,
        type: v.type,
        discount_percent: v.discount_percent,
        min_quantity_required: parseInt(v.min_quantity_required) || 1,
        min_cart_total: v.min_cart_total || null,
        usage_limit: v.usage_limit ? parseInt(v.usage_limit) : null,
        active: v.active === "true",
        valid_from: v.valid_from ? new Date(v.valid_from).toISOString() : null,
        expires_at: v.expires_at ? new Date(v.expires_at).toISOString() : null,
      });
    } finally { setSubmitting(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div><label className={lbl}>Coupon Code *</label><input required className={inp + " uppercase"} value={v.code} onChange={e => set("code", e.target.value.toUpperCase())} placeholder="e.g., SAVE20" /></div>
        <div>
          <label className={lbl}>Coupon Type *</label>
          <SearchableSelect
            required
            value={v.type}
            onChange={val => set("type", val)}
            options={COUPON_TYPES}
          />
        </div>
        <div><label className={lbl}>Discount % *</label><input required type="number" min="0" max="100" step="0.01" className={inp} value={v.discount_percent} onChange={e => set("discount_percent", e.target.value)} placeholder="e.g., 15" /></div>
        <div><label className={lbl}>Min Quantity</label><input type="number" min="1" className={inp} value={v.min_quantity_required} onChange={e => set("min_quantity_required", e.target.value)} /></div>
        {(v.type === "CART_TOTAL_DISCOUNT") && (
          <div><label className={lbl}>Min Cart Total (৳)</label><input type="number" min="0" step="0.01" className={inp} value={v.min_cart_total || ""} onChange={e => set("min_cart_total", e.target.value)} placeholder="0.00" /></div>
        )}
        <div><label className={lbl}>Usage Limit</label><input type="number" min="1" className={inp} value={v.usage_limit} onChange={e => set("usage_limit", e.target.value)} placeholder="Unlimited" /></div>
        <div>
          <label className={lbl}>Status</label>
          <SearchableSelect
            value={v.active}
            onChange={val => set("active", val)}
            options={[
              { value: "true", label: "Active" },
              { value: "false", label: "Inactive" },
            ]}
          />
        </div>
        <div><label className={lbl}>Valid From *</label><input required type="datetime-local" className={inp} value={v.valid_from} onChange={e => set("valid_from", e.target.value)} /></div>
        <div><label className={lbl}>Expires At *</label><input required type="datetime-local" className={inp} value={v.expires_at} onChange={e => set("expires_at", e.target.value)} /></div>
      </div>
      <div className="flex justify-end pt-1">
        <button type="submit" disabled={submitting} className="px-4 py-2 text-sm font-medium bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-md hover:bg-gray-800 dark:hover:bg-gray-100 disabled:opacity-50">
          {submitting ? "Saving..." : submitLabel}
        </button>
      </div>
    </form>
  );
}

/* ─── Free Shipping Rule Form ────────────────────────────────── */
function FreeShippingForm({ initial = {}, onSubmit, submitLabel = "Save" }) {
  const [name, setName] = useState(initial.name || "");
  const [threshold, setThreshold] = useState(initial.threshold_amount || "");
  const [active, setActive] = useState(String(initial.active ?? true));
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit({ name, threshold_amount: threshold, active: active === "true" });
    } finally { setSubmitting(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div><label className={lbl}>Rule Name</label><input className={inp} value={name} onChange={e => setName(e.target.value)} placeholder="e.g., Free shipping over ৳500" /></div>
        <div><label className={lbl}>Threshold Amount (৳) *</label><input required type="number" min="0" step="0.01" className={inp} value={threshold} onChange={e => setThreshold(e.target.value)} placeholder="e.g., 500" /></div>
        <div>
          <label className={lbl}>Status</label>
          <SearchableSelect
            value={active}
            onChange={setActive}
            options={[
              { value: "true", label: "Active" },
              { value: "false", label: "Inactive" },
            ]}
          />
        </div>
      </div>
      <div className="flex justify-end pt-1">
        <button type="submit" disabled={submitting} className="px-4 py-2 text-sm font-medium bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-md hover:bg-gray-800 dark:hover:bg-gray-100 disabled:opacity-50">
          {submitting ? "Saving..." : submitLabel}
        </button>
      </div>
    </form>
  );
}

/* ─── Main Page ──────────────────────────────────────────────── */
export default function CouponsPage() {
  const toast = useToastContext();
  const [tab, setTab] = useState("coupons");
  const [modal, setModal] = useState({ open: false, mode: "create", item: null });
  const [confirm, setConfirm] = useState({ open: false, item: null, tab: null });

  const coupons = useModel(couponsService, {
    defaultParams: { page_size: PAGE_SIZE, page: 1 },
    paginated: true,
    onSuccess: (m) => { toast.success(m); setModal({ open: false, mode: "create", item: null }); },
    onError: (e) => toast.error(e?.message || "Operation failed"),
  });

  const freeShipping = useModel(freeShippingRulesService, {
    defaultParams: { page_size: PAGE_SIZE, page: 1 },
    paginated: true,
    onSuccess: (m) => { toast.success(m); setModal({ open: false, mode: "create", item: null }); },
    onError: (e) => toast.error(e?.message || "Operation failed"),
  });

  const formatDate = (d) => d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—";

  const couponColumns = [
    { key: "code", label: "Code", render: (v) => <code className="text-xs font-semibold bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">{v}</code> },
    { key: "type_display", label: "Type" },
    { key: "discount_percent", label: "Discount", render: (v) => <span className="font-medium text-green-600 dark:text-green-400">{v}%</span> },
    { key: "usage_limit", label: "Usage", render: (v, row) => v != null ? <span className="text-xs">{row.used_count}/{v}</span> : <span className="text-xs text-gray-400">Unlimited</span> },
    { key: "active", label: "Status", render: (v) => <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${v ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"}`}>{v ? "Active" : "Inactive"}</span> },
    { key: "is_expired", label: "Expired", render: (v) => v ? <span className="text-xs text-red-500 font-medium">Expired</span> : <span className="text-xs text-green-600">Valid</span> },
    { key: "valid_from", label: "Valid From", render: formatDate },
    { key: "expires_at", label: "Expires", render: formatDate },
  ];

  const freeShippingColumns = [
    { key: "name", label: "Name", render: (v) => v || <span className="text-gray-400 text-xs">Unnamed</span> },
    { key: "threshold_amount", label: "Threshold (৳)", render: (v) => <span className="font-medium">৳{parseFloat(v).toLocaleString()}</span> },
    { key: "applicable_categories", label: "Categories", render: (v) => v?.length ? v.map(c => c.name).join(", ") : <span className="text-gray-400 text-xs">All categories</span> },
    { key: "active", label: "Status", render: (v) => <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${v ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"}`}>{v ? "Active" : "Inactive"}</span> },
    { key: "created_at", label: "Created", render: formatDate },
  ];

  const getModel = () => tab === "coupons" ? coupons : freeShipping;
  const getColumns = () => tab === "coupons" ? couponColumns : freeShippingColumns;
  const getLabel = () => tab === "coupons" ? "Coupon" : "Free Shipping Rule";

  const handleSave = async (data) => {
    const model = getModel();
    if (modal.mode === "edit") await model.update(modal.item.id, data);
    else await model.create(data);
  };

  const handleDelete = async () => {
    try {
      const model = confirm.tab === "coupons" ? coupons : freeShipping;
      await model.remove(confirm.item.id);
      setConfirm({ open: false, item: null, tab: null });
    } catch (e) {
      toast.error(e?.message || "Delete failed");
    }
  };

  const actions = (row) => (
    <div className="flex items-center gap-1">
      <button onClick={() => setModal({ open: true, mode: "edit", item: row })} className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"><Pencil className="w-3.5 h-3.5" /></button>
      <button onClick={() => setConfirm({ open: true, item: row, tab })} className="p-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-950/30 text-gray-500 hover:text-red-600 dark:hover:text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
    </div>
  );

  return (
    <Container title="Coupons & Promotions" description="Manage discount coupons and free shipping rules">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex gap-1 bg-gray-100 dark:bg-gray-900 p-0.5 rounded-lg">
          {TABS.map(t => (
            <button key={t.id} onClick={() => { setTab(t.id); setModal({ open: false, mode: "create", item: null }); setConfirm({ open: false, item: null, tab: null }); }} className={`px-3 py-1.5 text-sm rounded-md transition-colors ${tab === t.id ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm font-medium" : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"}`}>{t.label}</button>
          ))}
        </div>
        <button onClick={() => setModal({ open: true, mode: "create", item: null })} className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-md hover:bg-gray-800 dark:hover:bg-gray-100 whitespace-nowrap">
          <Plus className="w-3.5 h-3.5" /> Add {getLabel()}
        </button>
      </div>

      <DataTable
        key={tab}
        columns={getColumns()}
        data={getModel().data}
        loading={getModel().loading}
        actions={actions}
        serverSide
        totalItems={getModel().totalCount}
        currentPage={getModel().params.page || 1}
        pageSize={PAGE_SIZE}
        searchable
        searchValue={getModel().params.search || ""}
        onSearch={(q) => { getModel().setSearch(q); getModel().setPage(1); }}
        onPageChange={getModel().setPage}
        emptyMessage={`No ${tab === "coupons" ? "coupons" : "free shipping rules"} found`}
      />

      <Modal open={modal.open} onClose={() => setModal({ open: false, mode: "create", item: null })} title={`${modal.mode === "edit" ? "Edit" : "Add"} ${getLabel()}`}>
        {tab === "coupons" ? (
          <CouponForm initial={modal.mode === "edit" ? modal.item : {}} onSubmit={handleSave} submitLabel={modal.mode === "edit" ? "Update" : "Create"} />
        ) : (
          <FreeShippingForm initial={modal.mode === "edit" ? modal.item : {}} onSubmit={handleSave} submitLabel={modal.mode === "edit" ? "Update" : "Create"} />
        )}
      </Modal>

      <ConfirmDialog open={confirm.open} onClose={() => setConfirm({ open: false, item: null, tab: null })} onConfirm={handleDelete} title={`Delete ${getLabel()}`} message={`Are you sure you want to delete ${confirm.tab === "coupons" ? `"${confirm.item?.code}"` : "this rule"}? This action cannot be undone.`} />
    </Container>
  );
}
