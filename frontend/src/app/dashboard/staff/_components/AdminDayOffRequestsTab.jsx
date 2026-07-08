"use client";

import { useState } from "react";
import useSWR from "swr";
import api from "@/app/dashboard/_lib/api";
import { Loader2, Calendar, FileText, CheckCircle2, XCircle, Clock } from "lucide-react";
import DataTable from "@/app/dashboard/_components/DataTable";
import Modal from "@/app/dashboard/_components/Modal";
import { useToastContext } from "@/app/dashboard/_components/Toaster";

export default function AdminDayOffRequestsTab() {
  const toast = useToastContext();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [viewRequest, setViewRequest] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(null);

  const { data: rawData, isLoading, error, mutate } = useSWR(
    `/api/staff/admin/day-off-requests/?page=${page}${search ? `&search=${encodeURIComponent(search)}` : ''}`,
    (url) => api.get(url)
  );

  const data = rawData?.results || (Array.isArray(rawData) ? rawData : []);
  const totalCount = rawData?.count || data.length;

  const handleUpdateStatus = async (status) => {
    if (!viewRequest) return;
    setUpdatingStatus(status);
    try {
      await api.patch(`/api/staff/admin/day-off-requests/${viewRequest.id}/`, { status });
      toast.success(`Request ${status.toLowerCase()} successfully`);
      setViewRequest(null);
      mutate();
    } catch (err) {
      toast.error(err?.message || "Failed to update request");
    } finally {
      setUpdatingStatus(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "APPROVED":
        return <span className="inline-flex items-center gap-1 bg-[#D9EFE5] text-[#00694C] text-xs font-bold px-2.5 py-1 rounded-full"><CheckCircle2 className="w-3 h-3" /> Approved</span>;
      case "REJECTED":
        return <span className="inline-flex items-center gap-1 bg-red-100 text-red-700 text-xs font-bold px-2.5 py-1 rounded-full"><XCircle className="w-3 h-3" /> Rejected</span>;
      default:
        return <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-700 text-xs font-bold px-2.5 py-1 rounded-full"><Clock className="w-3 h-3" /> Pending</span>;
    }
  };

  const columns = [
    {
      key: "photo",
      label: "Photo",
      align: "center",
      render: (v, row) => (
        <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-100 border border-slate-200 shrink-0 mx-auto">
          {row.staff_photo ? (
            <img src={row.staff_photo} alt={row.staff_name || "Staff"} className="w-full h-full object-cover" />
          ) : (
            <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(row.staff_name || 'Staff')}&background=f8fafc&color=334155&size=128&bold=true`} alt="Default" className="w-full h-full object-cover" />
          )}
        </div>
      )
    },
    { 
      key: "staff", 
      label: "Staff Member", 
      align: "left",
      render: (v, row) => (
        <div>
          <span className="font-semibold text-slate-800 block leading-tight">{row.staff_name || `Staff #${row.staff}`}</span>
          {row.staff_custom_id && (
            <span className="text-[11px] text-slate-400 font-medium block mt-0.5">{row.staff_custom_id}</span>
          )}
        </div>
      )
    },
    { key: "date", label: "Leave Date", align: "center", render: (v) => new Date(v).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }) },
    { key: "created_at", label: "Applied On", align: "center", render: (v) => new Date(v).toLocaleDateString() },
    { key: "status", label: "Status", align: "center", render: (v) => getStatusBadge(v) }
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 animate-in fade-in duration-300">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-serif text-[#004A3A] font-medium tracking-tight">Leave Requests</h2>
          <p className="text-slate-500 text-sm">Review and manage staff day off requests</p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={data}
        totalItems={totalCount}
        currentPage={page}
        pageSize={10}
        onPageChange={setPage}
        loading={isLoading}
        onRowClick={(row) => setViewRequest(row)}
        serverSide={true}
        onSearch={(val) => { setSearch(val); setPage(1); }}
      />

      <Modal open={!!viewRequest} onClose={() => setViewRequest(null)} title="Review Leave Request" maxWidth="max-w-2xl">
        {viewRequest && (
          <div className="flex flex-col">
            <div className="p-8 bg-slate-50 border-b border-slate-100">
              <div className="bg-white p-8 rounded-lg shadow-sm border border-slate-200 font-serif text-slate-700 leading-relaxed text-sm">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <p className="font-bold text-slate-800">{viewRequest.staff_name || `Staff Member`}</p>
                    <p className="text-slate-500">{viewRequest.staff_role || 'Employee'}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-800">Date: {new Date(viewRequest.created_at).toLocaleDateString()}</p>
                    <div className="mt-2">{getStatusBadge(viewRequest.status)}</div>
                  </div>
                </div>
                
                <p className="mb-4">Dear Admin,</p>
                <p className="mb-4">
                  I am writing to formally request a day off on <strong className="text-slate-900">{new Date(viewRequest.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</strong>.
                </p>
                <p className="mb-4">
                  <strong>Reason:</strong><br />
                  <span className="whitespace-pre-wrap">{viewRequest.reason}</span>
                </p>
                <p className="mb-8">Thank you for your consideration.</p>
                
                <p>Sincerely,</p>
                <p className="font-bold text-slate-800">{viewRequest.staff_name || `Staff Member`}</p>
              </div>
            </div>
            
            {viewRequest.status === 'PENDING' && (
              <div className="p-5 flex justify-end gap-3 bg-white rounded-b-2xl">
                <button 
                  onClick={() => handleUpdateStatus('REJECTED')}
                  disabled={!!updatingStatus}
                  className="px-6 py-2.5 text-sm font-bold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl transition-colors cursor-pointer flex items-center gap-2"
                >
                  {updatingStatus === 'REJECTED' ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                  Reject Request
                </button>
                <button 
                  onClick={() => handleUpdateStatus('APPROVED')}
                  disabled={!!updatingStatus}
                  className="px-6 py-2.5 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors cursor-pointer flex items-center gap-2"
                >
                  {updatingStatus === 'APPROVED' ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  Approve Request
                </button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
