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

const columns = [
  { key: "id", label: "ID" },
  { key: "name", label: "Name" },
  { key: "email", label: "Email" },
  { key: "user_type", label: "Role", render: (v) => <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${v === "ADMIN" ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" : v === "SELLER" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" : v === "VENDOR" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"}`}>{v}</span> },
  { key: "is_active", label: "Status", render: (v) => <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${v ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"}`}>{v ? "Active" : "Inactive"}</span> },
  { key: "date_joined", label: "Joined", render: (v) => v ? new Date(v).toLocaleDateString() : "—" },
];

const editFields = [
  { key: "name", label: "Full Name", required: true, placeholder: "John Doe" },
  { key: "user_type", label: "Role", type: "select", required: true, options: [
    { value: "CUSTOMER", label: "Customer" },
    { value: "SELLER", label: "Seller" },
    { value: "WHOLESALER", label: "Wholesaler" },
    { value: "VENDOR", label: "Vendor" },
    { value: "AFFILIATE", label: "Affiliate" },
    { value: "ADMIN", label: "Admin" },
  ]},
  { key: "is_active", label: "Status", type: "select", required: true, options: [
    { value: "true", label: "Active" },
    { value: "false", label: "Inactive" },
  ]},
];

const createFields = [
  { key: "email", label: "Email", required: true, placeholder: "user@example.com" },
  { key: "name", label: "Full Name", required: true, placeholder: "John Doe" },
  { key: "password", label: "Password", required: true, placeholder: "Min 8 characters", type: "password" },
  { key: "user_type", label: "Role", type: "select", required: true, options: [
    { value: "CUSTOMER", label: "Customer" },
    { value: "SELLER", label: "Seller" },
    { value: "WHOLESALER", label: "Wholesaler" },
    { value: "VENDOR", label: "Vendor" },
    { value: "AFFILIATE", label: "Affiliate" },
    { value: "ADMIN", label: "Admin" },
  ]},
];

export default function UsersPage() {
  const toast = useToastContext();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [viewItem, setViewItem] = useState(null);
  const [editItem, setEditItem] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteItem, setDeleteItem] = useState(null);

  const { data: rawData, isLoading, mutate } = useSWR(
    ["admin-users", page, search],
    () => adminUsersApi.list({ page, page_size: PAGE_SIZE, search: search || undefined }),
    { revalidateOnFocus: false, keepPreviousData: true }
  );

  const data = rawData?.users || rawData?.results || (Array.isArray(rawData) ? rawData : []);
  const totalCount = rawData?.count ?? data.length;

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
      await api.patch(`/api/auth/admin/users/${editItem.id}/`, {
        ...values,
        is_active: values.is_active === "true",
      });
      toast.success("User updated successfully");
      setEditItem(null);
      mutate();
    } catch (err) {
      toast.error(err?.message || "Failed to update user");
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/api/auth/admin/users/${deleteItem.id}/`);
      toast.success("User deleted successfully");
      setDeleteItem(null);
      mutate();
    } catch (err) {
      toast.error(err?.message || "Failed to delete user");
    }
  };

  return (
    <Container title="Users" description="Manage user accounts">
      <div className="flex justify-end mb-3">
        <button onClick={() => setCreateOpen(true)} className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-md hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors">
          <Plus className="w-4 h-4" /> Add User
        </button>
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
            <button onClick={() => setViewItem(row)} className="p-1.5 rounded text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"><Eye className="w-3.5 h-3.5" /></button>
            <button onClick={() => setEditItem({ ...row, is_active: String(row.is_active) })} className="p-1.5 rounded text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"><Pencil className="w-3.5 h-3.5" /></button>
            <button onClick={() => setDeleteItem(row)} className="p-1.5 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"><Trash2 className="w-3.5 h-3.5" /></button>
          </div>
        )}
      />

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Create User">
        <FormModal fields={createFields} onSubmit={handleCreate} submitLabel="Create User" />
      </Modal>

      <Modal open={!!editItem} onClose={() => setEditItem(null)} title="Edit User">
        {editItem && <FormModal fields={editFields} initialValues={editItem} onSubmit={handleEdit} submitLabel="Save Changes" />}
      </Modal>

      <Modal open={!!viewItem} onClose={() => setViewItem(null)} title="User Details">
        {viewItem && (
          <div className="space-y-3">
            {[
              ["Name", viewItem.name],
              ["Email", viewItem.email],
              ["Role", viewItem.user_type],
              ["Status", viewItem.is_active ? "Active" : "Inactive"],
              ["Joined", viewItem.date_joined ? new Date(viewItem.date_joined).toLocaleDateString() : "—"],
            ].map(([label, val]) => (
              <div key={label} className="flex justify-between py-1.5 border-b border-gray-100 dark:border-gray-800 last:border-0">
                <span className="text-sm text-gray-500">{label}</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{String(val)}</span>
              </div>
            ))}
          </div>
        )}
      </Modal>

      <ConfirmDialog open={!!deleteItem} onClose={() => setDeleteItem(null)} onConfirm={handleDelete} title="Delete User" message={`Are you sure you want to delete "${deleteItem?.name || deleteItem?.email}"? This action cannot be undone.`} />
    </Container>
  );
}
