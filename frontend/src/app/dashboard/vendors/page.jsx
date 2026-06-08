"use client";

import { useState } from "react";
import { Eye, CheckCircle2, XCircle, AlertTriangle, Building2 } from "lucide-react";
import Container from "@/app/dashboard/_components/Container";
import DataTable from "@/app/dashboard/_components/DataTable";
import Modal from "@/app/dashboard/_components/Modal";
import ConfirmDialog from "@/app/dashboard/_components/ConfirmDialog";
import { useToastContext } from "@/app/dashboard/_components/Toaster";
import useSWR from "swr";
import { adminVendorsApi } from "@/app/dashboard/_lib/auth";

const PAGE_SIZE = 20;

const columns = [
  { key: "user_name", label: "Vendor" },
  { key: "user_email", label: "Email" },
  { key: "business_name", label: "Business" },
  { key: "business_type", label: "Type" },
  { key: "approval_status", label: "Status", type: "status", render: (v) => v?.toLowerCase() },
  { key: "product_count", label: "Products" },
  { key: "created_at", label: "Applied", render: (v) => v ? new Date(v).toLocaleDateString() : "—" },
];

export default function VendorsPage() {
  const toast = useToastContext();
  const [statusFilter, setStatusFilter] = useState("");
  const [viewItem, setViewItem] = useState(null);
  const [rejectItem, setRejectItem] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [suspendItem, setSuspendItem] = useState(null);

  const { data: rawData, isLoading, mutate } = useSWR(
    ["admin-vendors", statusFilter],
    () => adminVendorsApi.list({ status: statusFilter || undefined }),
    { revalidateOnFocus: false, keepPreviousData: true }
  );

  // Backend returns flat array (not paginated)
  const data = Array.isArray(rawData) ? rawData : (rawData?.results || rawData?.vendors || []);
  const totalCount = rawData?.count ?? data.length;

  const handleApprove = async (vendor) => {
    try {
      await adminVendorsApi.approve(vendor.id, { action: "approve" });
      toast.success(`${vendor.business_name || vendor.user_name} approved`);
      mutate();
    } catch (err) {
      toast.error(err?.message || "Approval failed");
    }
  };

  const handleReject = async () => {
    try {
      await adminVendorsApi.approve(rejectItem.id, { action: "reject", reason: rejectReason });
      toast.success(`${rejectItem.business_name || rejectItem.user_name} rejected`);
      setRejectItem(null);
      setRejectReason("");
      mutate();
    } catch (err) {
      toast.error(err?.message || "Rejection failed");
    }
  };

  const handleSuspend = async (vendor) => {
    try {
      await adminVendorsApi.approve(vendor.id, { action: "suspend" });
      toast.success(`${vendor.business_name || vendor.user_name} suspended`);
      mutate();
    } catch (err) {
      toast.error(err?.message || "Suspend failed");
    }
  };

  const DetailRow = ({ label, value, full }) => (
    <div className={`${full ? "col-span-2" : ""} py-1.5`}>
      <p className="text-xs text-slate-400 mb-0.5">{label}</p>
      <p className="text-sm text-slate-800 break-words">{value || "—"}</p>
    </div>
  );

  return (
    <Container
      title="Vendors"
      description="Manage vendor applications and profiles"
      actions={
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="text-sm border border-slate-200 rounded-md px-2.5 py-1.5 bg-white text-slate-800"
        >
          <option value="">All Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
          <option value="SUSPENDED">Suspended</option>
        </select>
      }
    >
      <DataTable
        columns={columns}
        data={data}
        pageSize={PAGE_SIZE}
        loading={isLoading}
        searchable
        searchKeys={["user_name", "user_email", "business_name"]}
        actions={(row) => (
          <div className="flex items-center justify-end gap-1">
            <button onClick={() => setViewItem(row)} className="db-icon-btn" title="View"><Eye className="w-3.5 h-3.5" /></button>
            {row.approval_status !== "APPROVED" && (
              <button onClick={() => handleApprove(row)} title="Approve" className="p-1.5 rounded text-slate-400 hover:text-emerald-600 hover:bg-emerald-50"><CheckCircle2 className="w-3.5 h-3.5" /></button>
            )}
            {row.approval_status !== "REJECTED" && (
              <button onClick={() => { setRejectItem(row); setRejectReason(""); }} title="Reject" className="db-icon-btn danger"><XCircle className="w-3.5 h-3.5" /></button>
            )}
            {row.approval_status === "APPROVED" && (
              <button onClick={() => setSuspendItem(row)} title="Suspend" className="p-1.5 rounded text-slate-400 hover:text-orange-500 hover:bg-orange-50"><AlertTriangle className="w-3.5 h-3.5" /></button>
            )}
          </div>
        )}
      />

      {/* View Vendor Details */}
      <Modal open={!!viewItem} onClose={() => setViewItem(null)} title="Vendor Profile" maxWidth="max-w-3xl">
        {viewItem && (
          <div className="space-y-5 max-h-[70vh] overflow-y-auto pr-1">
            {/* Header */}
            <div className="flex items-start gap-4">
              {viewItem.logo_url ? (
                <img src={viewItem.logo_url} alt="" className="w-16 h-16 rounded-lg object-cover border border-slate-200" />
              ) : (
                <div className="w-16 h-16 rounded-lg bg-slate-100 flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-slate-400" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-slate-800">{viewItem.business_name || viewItem.user_name}</h3>
                <p className="text-sm text-slate-500">{viewItem.user_email}</p>
                <span className={`inline-flex mt-1 px-2 py-0.5 text-xs font-medium rounded-full ${
                  viewItem.approval_status === "APPROVED" ? "bg-emerald-50 text-emerald-700" :
                  viewItem.approval_status === "PENDING" ? "bg-amber-50 text-amber-700" :
                  viewItem.approval_status === "REJECTED" ? "bg-red-50 text-red-700" :
                  "bg-orange-50 text-orange-700"
                }`}>
                  {viewItem.approval_status}
                </span>
              </div>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="text-xs font-medium uppercase tracking-wider text-slate-400 mb-2">Contact Information</h4>
              <div className="grid grid-cols-2 gap-x-6 gap-y-1 border border-slate-100 rounded-lg p-3">
                <DetailRow label="Full Name" value={viewItem.user_name} />
                <DetailRow label="Email" value={viewItem.user_email} />
                <DetailRow label="Phone" value={viewItem.phone} />
                <DetailRow label="City" value={viewItem.city} />
                <DetailRow label="Division" value={viewItem.division} />
                <DetailRow label="Postal Code" value={viewItem.postal_code} />
                <DetailRow label="Address" value={viewItem.address_line} full />
              </div>
            </div>

            {/* Business Info */}
            <div>
              <h4 className="text-xs font-medium uppercase tracking-wider text-slate-400 mb-2">Business Information</h4>
              <div className="grid grid-cols-2 gap-x-6 gap-y-1 border border-slate-100 rounded-lg p-3">
                <DetailRow label="Business Name" value={viewItem.business_name} />
                <DetailRow label="Business Type" value={viewItem.business_type} />
                <DetailRow label="Domain" value={viewItem.business_domain} />
                <DetailRow label="Products" value={viewItem.product_count} />
                <DetailRow label="Description" value={viewItem.business_description} full />
              </div>
            </div>

            {viewItem.banner_url && (
              <div>
                <h4 className="text-xs font-medium uppercase tracking-wider text-slate-400 mb-2">Business Banner</h4>
                <img src={viewItem.banner_url} alt="Banner" className="w-full h-32 object-cover rounded-lg border border-slate-200" />
              </div>
            )}

            <div>
              <h4 className="text-xs font-medium uppercase tracking-wider text-slate-400 mb-2">Timeline</h4>
              <div className="grid grid-cols-2 gap-x-6 gap-y-1 border border-slate-100 rounded-lg p-3">
                <DetailRow label="Applied" value={viewItem.created_at ? new Date(viewItem.created_at).toLocaleString() : "—"} />
                <DetailRow label="Status" value={viewItem.approval_status} />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-2 border-t border-slate-200">
              {viewItem.approval_status !== "APPROVED" && (
                <button onClick={() => { handleApprove(viewItem); setViewItem(null); }} className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                </button>
              )}
              {viewItem.approval_status !== "REJECTED" && (
                <button onClick={() => { setRejectItem(viewItem); setRejectReason(""); setViewItem(null); }} className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors">
                  <XCircle className="w-3.5 h-3.5" /> Reject
                </button>
              )}
              {viewItem.approval_status === "APPROVED" && (
                <button onClick={() => { setSuspendItem(viewItem); setViewItem(null); }} className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors">
                  <AlertTriangle className="w-3.5 h-3.5" /> Suspend
                </button>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Reject Dialog */}
      <Modal open={!!rejectItem} onClose={() => setRejectItem(null)} title="Reject Vendor" maxWidth="max-w-lg">
        {rejectItem && (
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              Reject <strong>{rejectItem.business_name || rejectItem.user_name}</strong>?
            </p>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Rejection Reason</label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={3}
                placeholder="Provide a reason for rejection..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-gray-400 resize-none"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setRejectItem(null)} className="px-3 py-1.5 text-sm border border-slate-200 rounded-md text-slate-700 hover:bg-slate-50">
                Cancel
              </button>
              <button onClick={handleReject} className="px-3 py-1.5 text-sm font-medium bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors">
                Reject Vendor
              </button>
            </div>
          </div>
        )}
      </Modal>
      <ConfirmDialog
        open={!!suspendItem}
        onClose={() => setSuspendItem(null)}
        onConfirm={() => { handleSuspend(suspendItem); setSuspendItem(null); }}
        title="Suspend Vendor"
        message={`Suspend ${suspendItem?.business_name || suspendItem?.user_name}? This will prevent them from accessing the system.`}
      />
    </Container>
  );
}

