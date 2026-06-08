"use client";

import { useState } from "react";
import { Plus, Eye, Pencil, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import Container from "@/app/dashboard/_components/Container";
import DataTable from "@/app/dashboard/_components/DataTable";
import Modal from "@/app/dashboard/_components/Modal";
import FormModal from "@/app/dashboard/_components/FormModal";
import ConfirmDialog from "@/app/dashboard/_components/ConfirmDialog";
import { useToastContext } from "@/app/dashboard/_components/Toaster";
import { useModel } from "@/app/dashboard/_lib/useModel";
import { shopsService } from "@/app/dashboard/_lib/services";

const PAGE_SIZE = 10;

// Keys sent for edit — must only include writable fields
const EDIT_KEYS = ["name", "description", "contact_email", "contact_phone", "address", "is_active", "is_verified"];

const columns = [
  { key: "name", label: "Shop Name" },
  { key: "owner_name", label: "Owner", render: (_, row) => row.owner?.name || row.owner?.email || "—" },
  { key: "contact_email", label: "Email", render: (v) => v || "—" },
  { key: "is_active", label: "Active", render: (v) => <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${v ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}>{v ? "Active" : "Inactive"}</span> },
  { key: "is_verified", label: "Verified", render: (v) => <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${v ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-600"}`}>{v ? "Verified" : "Pending"}</span> },
  { key: "created_at", label: "Created", render: (v) => v ? new Date(v).toLocaleDateString() : "—" },
];

const formFields = [
  { key: "name", label: "Shop Name", required: true, placeholder: "My Shop" },
  { key: "description", label: "Description", type: "textarea", placeholder: "Shop description" },
  { key: "contact_email", label: "Contact Email", placeholder: "shop@example.com" },
  { key: "contact_phone", label: "Contact Phone", placeholder: "+880..." },
  { key: "address", label: "Address", placeholder: "Shop address" },
  { key: "is_active", label: "Active", type: "select", required: true, options: [
    { value: "true", label: "Active" },
    { value: "false", label: "Inactive" },
  ]},
  { key: "is_verified", label: "Verified", type: "select", options: [
    { value: "true", label: "Verified" },
    { value: "false", label: "Unverified" },
  ]},
];

export default function ShopsPage() {
  const toast = useToastContext();
  const { data, totalCount, loading, params, setSearch, setPage, create, patch, remove, mutate } = useModel(shopsService, { defaultParams: { page_size: PAGE_SIZE, page: 1 } });
  const [editItem, setEditItem] = useState(null);
  const [viewItem, setViewItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);

  const handleCreate = async (values) => {
    try {
      const payload = { ...values, is_active: values.is_active === "true", is_verified: values.is_verified === "true" };
      await create(payload);
      toast.success("Shop created successfully");
      setCreateOpen(false);
    } catch (err) {
      toast.error(err?.message || "Failed to create shop");
    }
  };

  const handleEdit = async (values) => {
    try {
      // Only send writable fields — avoids sending owner object, slug, etc. which cause 400 errors
      const payload = {};
      EDIT_KEYS.forEach((k) => { payload[k] = values[k]; });
      payload.is_active = values.is_active === "true";
      payload.is_verified = values.is_verified === "true";
      await patch(editItem.slug, payload);
      toast.success("Shop updated successfully");
      setEditItem(null);
    } catch (err) {
      toast.error(err?.message || "Failed to update shop");
    }
  };

  const handleToggleActive = async (row) => {
    try {
      await patch(row.slug, { is_active: !row.is_active });
      toast.success(`Shop ${!row.is_active ? "activated" : "deactivated"}`);
    } catch (err) {
      toast.error(err?.message || "Failed to update status");
    }
  };

  const handleDelete = async () => {
    try {
      await remove(deleteItem.slug);
      toast.success("Shop deleted successfully");
      setDeleteItem(null);
    } catch (err) {
      toast.error(err?.message || "Failed to delete shop");
    }
  };

  return (
    <Container title="Shops" description="Manage vendor storefronts">
      <div className="flex justify-end mb-3">
        <button onClick={() => setCreateOpen(true)} className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-slate-900 text-white rounded-md hover:bg-gray-800 transition-colors">
          <Plus className="w-4 h-4" /> Add Shop
        </button>
      </div>
      <DataTable
        columns={columns}
        data={data}
        serverSide
        totalItems={totalCount}
        currentPage={params.page}
        pageSize={PAGE_SIZE}
        onSearch={(q) => { setSearch(q); setPage(1); }}
        onPageChange={setPage}
        loading={loading}
        searchable
        actions={(row) => (
          <div className="flex items-center justify-end gap-1">
            <button
              onClick={() => handleToggleActive(row)}
              title={row.is_active ? "Deactivate" : "Activate"}
              className={`p-1.5 rounded transition-colors ${row.is_active ? "text-green-500 hover:text-green-700 hover:bg-green-50" : "text-slate-400 hover:text-slate-600 hover:bg-slate-100"}`}
            >
              {row.is_active ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
            </button>
            <button onClick={() => setViewItem(row)} className="db-icon-btn"><Eye className="w-3.5 h-3.5" /></button>
            <button onClick={() => setEditItem(row)} className="db-icon-btn"><Pencil className="w-3.5 h-3.5" /></button>
            <button onClick={() => setDeleteItem(row)} className="db-icon-btn danger"><Trash2 className="w-3.5 h-3.5" /></button>
          </div>
        )}
      />

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Create Shop">
        <FormModal fields={formFields} onSubmit={handleCreate} submitLabel="Create Shop" />
      </Modal>
      <Modal open={!!editItem} onClose={() => setEditItem(null)} title="Edit Shop">
        {editItem && <FormModal
          fields={formFields}
          initialValues={Object.fromEntries(EDIT_KEYS.map(k => [k, k === "is_active" || k === "is_verified" ? String(editItem[k]) : (editItem[k] ?? "")]))}
          onSubmit={handleEdit}
          submitLabel="Save Changes"
        />}
      </Modal>
      <Modal open={!!viewItem} onClose={() => setViewItem(null)} title="Shop Details">
        {viewItem && (
          <div className="space-y-3">
            {[
              ["Name", viewItem.name],
              ["Slug", viewItem.slug],
              ["Owner", viewItem.owner?.name || viewItem.owner?.email || "—"],
              ["Email", viewItem.contact_email || "—"],
              ["Phone", viewItem.contact_phone || "—"],
              ["Address", viewItem.address || "—"],
              ["Active", viewItem.is_active ? "Yes" : "No"],
              ["Verified", viewItem.is_verified ? "Yes" : "No"],
              ["Description", viewItem.description || "—"],
              ["Created", viewItem.created_at ? new Date(viewItem.created_at).toLocaleDateString() : "—"],
            ].map(([label, val]) => (
              <div key={label} className="flex justify-between py-1.5 border-b border-slate-100 last:border-0">
                <span className="text-sm text-slate-500">{label}</span>
                <span className="text-sm font-medium text-slate-800 max-w-[60%] text-right">{String(val)}</span>
              </div>
            ))}
          </div>
        )}
      </Modal>
      <ConfirmDialog open={!!deleteItem} onClose={() => setDeleteItem(null)} onConfirm={handleDelete} title="Delete Shop" message={`Are you sure you want to delete "${deleteItem?.name}"?`} />
    </Container>
  );
}

