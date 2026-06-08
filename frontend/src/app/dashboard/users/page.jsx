"use client";

import { useState } from "react";
import { Plus, Eye, Pencil, Trash2 } from "lucide-react";
import Container from "@/app/dashboard/_components/Container";
import DataTable from "@/app/dashboard/_components/DataTable";
import Modal from "@/app/dashboard/_components/Modal";
import FormModal from "@/app/dashboard/_components/FormModal";
import ConfirmDialog from "@/app/dashboard/_components/ConfirmDialog";
import { useToastContext } from "@/app/dashboard/_components/Toaster";
import useSWR from "swr";
import { adminUsersApi } from "@/app/dashboard/_lib/auth";
import api from "@/app/dashboard/_lib/api";

const PAGE_SIZE = 20;

const FILTERS = [
  { label: "All",        value: "" },
  { label: "Customers",  value: "CUSTOMER" },
  { label: "Wholesale",  value: "WHOLESALE" },
  { label: "Sellers",    value: "SELLER" },
  { label: "Admins",     value: "ADMIN" },
];

function RoleBadge({ value }) {
  const map = {
    ADMIN:     "bg-purple-100 text-purple-700",
    SELLER:    "bg-blue-100 text-blue-700",
    WHOLESALE: "bg-emerald-100 text-emerald-700",
    VENDOR:    "bg-amber-100 text-amber-700",
    CUSTOMER:  "bg-slate-100 text-slate-600",
  };
  return (
    <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${map[value] || map.CUSTOMER}`}>
      {value || "CUSTOMER"}
    </span>
  );
}

function WholesaleStatusBadge({ value }) {
  if (!value) return <span className="text-slate-400">—</span>;
  const map = {
    approved:  "bg-green-100 text-green-700",
    pending:   "bg-amber-100 text-amber-700",
    rejected:  "bg-red-100 text-red-700",
    suspended: "bg-slate-100 text-slate-600",
  };
  return (
    <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${map[value] || map.pending}`}>
      {value}
    </span>
  );
}

const columns = [
  { key: "id",               label: "ID",        render: (v) => <span className="text-xs text-slate-400">{String(v).startsWith('ws_') ? `WS-${v.replace('ws_','')}` : v}</span> },
  { key: "avatar",           label: "Photo",     render: (v, row) => (
    <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-100 flex items-center justify-center border border-slate-200 shrink-0">
      {v ? (
        <img src={v} alt={row.name || "User"} className="w-full h-full object-cover" />
      ) : (
        <span className="text-xs font-semibold text-slate-500">{(row.name || row.email || "U").charAt(0).toUpperCase()}</span>
      )}
    </div>
  )},
  { key: "name",             label: "Name" },
  { key: "email",            label: "Email" },
  { key: "user_type",        label: "Role",      render: (v) => <RoleBadge value={v} /> },
  { key: "business_name",    label: "Business",  render: (v) => v || <span className="text-slate-400">—</span> },
  { key: "wholesale_status", label: "WS Status", render: (v) => <WholesaleStatusBadge value={v} /> },
  { key: "is_active",        label: "Status",    render: (v) => (
    <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${v ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}>
      {v ? "Active" : "Inactive"}
    </span>
  )},
  { key: "date_joined", label: "Joined", render: (v) => v ? new Date(v).toLocaleDateString() : "—" },
];

const editFields = [
  { key: "name", label: "Full Name", required: true, placeholder: "John Doe" },
  { key: "user_type", label: "Role", type: "select", required: true, options: [
    { value: "CUSTOMER", label: "Customer" },
    { value: "WHOLESALE", label: "Wholesaler" },
    { value: "SELLER",   label: "Seller" },
    { value: "VENDOR",   label: "Vendor" },
    { value: "ADMIN",    label: "Admin" },
  ]},
  { key: "is_active", label: "Status", type: "select", required: true, options: [
    { value: "true",  label: "Active" },
    { value: "false", label: "Inactive" },
  ]},
];

const wholesaleEditFields = [
  ...editFields,
  { key: "wholesale_status", label: "Wholesale Status", type: "select", options: [
    { value: "PENDING",  label: "Pending" },
    { value: "APPROVED", label: "Approved" },
    { value: "REJECTED", label: "Rejected" },
  ]},
]

const createFields = [
  { key: "email",     label: "Email",     required: true, placeholder: "user@example.com" },
  { key: "name",      label: "Full Name", required: true, placeholder: "John Doe" },
  { key: "password",  label: "Password",  required: true, placeholder: "Min 8 characters", type: "password" },
  { key: "user_type", label: "Role", type: "select", required: true, options: [
    { value: "CUSTOMER", label: "Customer" },
    { value: "SELLER",   label: "Seller" },
    { value: "VENDOR",   label: "Vendor" },
    { value: "ADMIN",    label: "Admin" },
  ]},
];

const handleApproveWholesale = async (row) => {
  try {
    await api.patch(`/api/auth/admin/users/${row.id}/`, {
      wholesale_status: 'APPROVED',
    })
    toast.success(`${row.name} approved as wholesaler`)
    mutate()
  } catch (err) {
    toast.error(err?.message || 'Failed to approve wholesaler')
  }
}

export default function UsersPage() {
  const toast = useToastContext();
  const [page, setPage]             = useState(1);
  const [search, setSearch]         = useState("");
  const [activeFilter, setFilter]   = useState("");
  const [viewItem, setViewItem]     = useState(null);
  const [editItem, setEditItem]     = useState(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteItem, setDeleteItem] = useState(null);

  const { data: rawData, isLoading, mutate } = useSWR(
    ["admin-users", page, search, activeFilter],
    () => adminUsersApi.list({
      page,
      page_size: PAGE_SIZE,
      search: search || undefined,
      user_type: activeFilter || undefined,
    }),
    { revalidateOnFocus: false, keepPreviousData: true }
  );

  // Filter client-side too (since API may not support user_type param yet)
  const rawList = rawData?.results || rawData?.users || (Array.isArray(rawData) ? rawData : []);
  const data = activeFilter
    ? rawList.filter(u => u.user_type === activeFilter)
    : rawList;
  const totalCount = data.length;

  const handleCreate = async (values) => {
    try {
      await api.post("/api/auth/admin/users/", values);
      toast.success("User created successfully");
      setCreateOpen(false);
      mutate();
    } catch (err) {
      toast.error(err?.message || "Failed to create user");
    }
  };

  const handleEdit = async (values) => {
  try {
    const payload = {
      ...values,
      is_active: values.is_active === "true",
    }
    await api.patch(`/api/auth/admin/users/${editItem.id}/`, payload)
    toast.success("User updated")
    setEditItem(null)
    mutate()
  } catch (err) {
    toast.error(err?.message || "Failed to update user")
  }
}

  const handleDelete = async () => {
    try {
      await api.delete(`/api/auth/admin/users/${deleteItem.id}/`);
      toast.success("User deleted");
      setDeleteItem(null);
      mutate();
    } catch (err) {
      toast.error(err?.message || "Failed to delete user");
    }
  };

  return (
    <Container title="Users" description="Manage user accounts — normal, wholesale, and admin">

      <div className="db-filter-bar">
        {FILTERS.map(f => (
          <button
            key={f.value}
            onClick={() => { setFilter(f.value); setPage(1); }}
            className={`db-filter-pill${activeFilter === f.value ? " active" : ""}`}
          >
            {f.label}
          </button>
        ))}
        <div style={{ marginLeft: "auto" }}>
          <button
            onClick={() => setCreateOpen(true)}
            className="db-btn-primary"
          >
            <Plus size={15} /> Add User
          </button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={data}
        serverSide
        totalItems={totalCount}
        currentPage={page}
        pageSize={PAGE_SIZE}
        onSearch={(q) => { setSearch(q); setPage(1); }}
        onPageChange={setPage}
        loading={isLoading}
        searchable
        actions={(row) => (
        <div className="flex items-center justify-end gap-1">
          <button onClick={() => setViewItem(row)} className="db-icon-btn" title="View"><Eye size={14} /></button>
          <button onClick={() => setEditItem({ ...row, is_active: String(row.is_active), wholesale_status: row.wholesale_status || 'PENDING' })} className="db-icon-btn" title="Edit"><Pencil size={14} /></button>
          {row.user_type === 'WHOLESALER' && row.wholesale_status === 'PENDING' && (
            <button onClick={() => handleApproveWholesale(row)} style={{ padding: "5px 10px", fontSize: "11px", fontWeight: "700", borderRadius: "7px", background: "#22c55e", color: "white", border: "none", cursor: "pointer" }}>Approve</button>
          )}
          <button onClick={() => setDeleteItem(row)} className="db-icon-btn danger" title="Delete"><Trash2 size={14} /></button>
        </div>
      )}
      />

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Create User">
        <FormModal fields={createFields} onSubmit={handleCreate} submitLabel="Create User" />
      </Modal>

      <Modal open={!!editItem} onClose={() => setEditItem(null)} title="Edit User">
  {editItem && (
    <FormModal
      fields={editItem.user_type === 'WHOLESALER' ? wholesaleEditFields : editFields}
      initialValues={editItem}
      onSubmit={handleEdit}
      submitLabel="Save Changes"
    />
  )}
</Modal>

      <Modal open={!!viewItem} onClose={() => setViewItem(null)} title="User Details">
        {viewItem && (
          <div className="space-y-4">
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 rounded-full overflow-hidden bg-slate-100 flex items-center justify-center border border-slate-200">
                {viewItem.avatar ? (
                  <img src={viewItem.avatar} alt={viewItem.name || "User"} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl font-semibold text-slate-500">{(viewItem.name || viewItem.email || "U").charAt(0).toUpperCase()}</span>
                )}
              </div>
            </div>
            <div className="space-y-3">
              {[
                ["Name",      viewItem.name],
                ["Email",     viewItem.email],
                ["Role",      viewItem.user_type],
                ["Business",  viewItem.business_name || "—"],
                ["WS Status", viewItem.wholesale_status || "—"],
                ["Status",    viewItem.is_active ? "Active" : "Inactive"],
                ["Joined",    viewItem.date_joined ? new Date(viewItem.date_joined).toLocaleDateString() : "—"],
              ].map(([label, val]) => (
                <div key={label} className="flex justify-between py-1.5 border-b border-slate-100 last:border-0">
                  <span className="text-sm text-slate-500">{label}</span>
                  <span className="text-sm font-medium text-slate-800">{String(val)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={!!deleteItem}
        onClose={() => setDeleteItem(null)}
        onConfirm={handleDelete}
        title="Delete User"
        message={`Delete "${deleteItem?.name || deleteItem?.email}"? This cannot be undone.`}
      />
    </Container>
  );
}
