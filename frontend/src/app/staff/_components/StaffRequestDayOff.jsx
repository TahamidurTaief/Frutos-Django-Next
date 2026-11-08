"use client";

import { useState } from "react";
import useSWR from "swr";
import api from "@/app/dashboard/_lib/api";
import { Loader2, Calendar, FileText, Send, CheckCircle2, XCircle, Clock, Plus, ArrowRight } from "lucide-react";
import { useToastContext } from "@/app/dashboard/_components/Toaster";
import Modal from "@/app/dashboard/_components/Modal";
import { useStaffAuth } from "@/app/staff/_context/StaffAuthContext";

export default function StaffRequestDayOff() {
  const { user, profile } = useStaffAuth();
  const toast = useToastContext();
  const [date, setDate] = useState("");
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewRequest, setViewRequest] = useState(null);

  const { data: rawData, isLoading, error, mutate } = useSWR(
    "/api/staff/me/day-off-requests/",
    (url) => api.get(url)
  );

  const requests = Array.isArray(rawData) ? rawData : (rawData?.results || []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!date || !reason) {
      toast.error("Please provide both a date and a reason.");
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post("/api/staff/me/day-off-requests/", { date, reason });
      toast.success("Day off request submitted successfully.");
      setDate("");
      setReason("");
      setIsModalOpen(false);
      mutate();
    } catch (err) {
      toast.error(err?.message || "Failed to submit request.");
    } finally {
      setIsSubmitting(false);
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

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 sm:gap-0 mb-4 sm:mb-6">
        <div>
          <div className="flex items-center gap-2 sm:gap-3 mb-1">
            <h1 className="text-2xl sm:text-3xl font-serif text-[#004A3A] font-medium tracking-tight">Request Day Off</h1>
          </div>
          <p className="text-slate-500 text-[11px] sm:text-[13px] italic font-serif">Submit and track your time off requests</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="w-full sm:w-auto justify-center flex items-center gap-1.5 sm:gap-2 bg-[#00694C] hover:bg-[#004A3A] text-white px-4 py-2 sm:px-5 sm:py-2.5 rounded-lg sm:rounded-xl text-sm font-semibold shadow-sm transition-all hover:shadow-md cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          New Request
        </button>
      </div>

      {/* History Section */}
      <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-slate-100 flex-1">
        <h2 className="text-base sm:text-lg font-semibold text-[#004A3A] mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-[#00694C]" /> Request History
        </h2>
          
          {isLoading ? (
            <div className="py-12 flex justify-center"><Loader2 className="w-8 h-8 text-[#00694C] animate-spin" /></div>
          ) : error ? (
            <div className="py-12 text-center text-red-500 text-sm">Failed to load requests.</div>
          ) : requests.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm italic">You haven't made any requests yet.</div>
          ) : (
            <div className="space-y-2">
              {requests.map(req => (
                <div 
                  key={req.id} 
                  onClick={() => setViewRequest(req)}
                  className="bg-white border border-slate-100 rounded-lg p-3.5 hover:border-[#00694C]/30 hover:shadow-sm transition-all cursor-pointer group flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <div className="font-bold text-slate-800 text-base">{new Date(req.date).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</div>
                      <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Req: {new Date(req.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="text-xs text-slate-500 line-clamp-1 italic max-w-lg">
                      "{req.reason}"
                    </div>
                  </div>
                  <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0">
                    {getStatusBadge(req.status)}
                    <div className="opacity-0 group-hover:opacity-100 transition-all transform translate-y-1 group-hover:translate-y-0">
                      <span className="flex items-center gap-1 text-[10px] font-bold text-white bg-[#00694C] px-2.5 py-1 rounded-md shadow-sm">
                        View Details <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
      </div>

      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)} title="Submit Leave Request" maxWidth="max-w-lg">
        <form onSubmit={handleSubmit} className="flex flex-col font-serif text-slate-700 leading-relaxed text-sm">
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="font-bold text-slate-800">{user?.name}</p>
              <p className="text-slate-500">{profile?.role || 'Employee'}</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-slate-800 text-xs">Date: {new Date().toLocaleDateString()}</p>
            </div>
          </div>
          
          <p className="mb-4">Dear Admin,</p>
          <p className="mb-4 flex flex-wrap items-center gap-2 leading-loose">
            I am writing to formally request a day off on 
            <input 
              type="date" 
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="px-2 py-1 border-b-2 border-slate-300 focus:border-[#00694C] bg-slate-50 rounded-t focus:outline-none transition-colors font-sans text-sm inline-block"
              required
              min={new Date().toISOString().split("T")[0]}
            />
            .
          </p>
          <div className="mb-4">
            <strong>Reason:</strong><br />
            <textarea 
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              className="w-full mt-2 p-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00694C]/20 focus:border-[#00694C] transition-all font-sans bg-slate-50"
              placeholder="Please state your reason for requesting this day off clearly..."
              required
            />
          </div>
          <p className="mb-6">Thank you for your consideration.</p>
          
          <div>
            <p>Sincerely,</p>
            <p className="font-bold text-slate-800">{user?.name}</p>
          </div>
          
          <div className="pt-6 mt-2 flex justify-end gap-3 border-t border-slate-100">
            <button 
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-5 py-2 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="px-5 py-2 text-sm font-bold text-white bg-[#00694C] hover:bg-[#004A3A] rounded-xl transition-colors cursor-pointer flex items-center gap-2"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              {isSubmitting ? "Submitting..." : "Send Request"}
            </button>
          </div>
        </form>
      </Modal>

      {/* View Request Modal */}
      <Modal open={!!viewRequest} onClose={() => setViewRequest(null)} title="Leave Request Details" maxWidth="max-w-lg">
        {viewRequest && (
          <div className="flex flex-col font-serif text-slate-700 leading-relaxed text-sm relative">
            <div className="absolute -top-16 sm:-top-14 right-0 sm:right-0">
              {getStatusBadge(viewRequest.status)}
            </div>
            <div className="flex justify-between items-start mb-5 pb-5 border-b border-slate-100 mt-2">
              <div>
                <p className="font-bold text-slate-800 text-base">{user?.name}</p>
                <p className="text-slate-500 text-xs uppercase tracking-widest">{profile?.role || 'Employee'}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-slate-800 text-xs">Date: {new Date(viewRequest.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
              </div>
            </div>
            
            <p className="mb-3">Dear Admin,</p>
            <p className="mb-4 leading-loose text-[13px]">
              I am writing to formally request a day off on 
              <strong className="px-1.5 py-0.5 ml-1 bg-slate-100 border border-slate-200 rounded text-slate-800 font-sans">{new Date(viewRequest.date).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</strong>.
            </p>
            <div className="mb-5">
              <strong className="text-xs uppercase tracking-widest text-slate-400 font-sans">Reason:</strong><br />
              <div className="w-full mt-2 p-3 bg-slate-50 rounded-lg text-[13px] text-slate-700 font-sans border border-slate-100 whitespace-pre-wrap min-h-[60px] leading-relaxed">
                {viewRequest.reason}
              </div>
            </div>
            <p className="mb-6 text-[13px]">Thank you for your consideration.</p>
            
            <div>
              <p className="text-[13px]">Sincerely,</p>
              <p className="font-bold text-slate-800 italic">{user?.name}</p>
            </div>
            
            <div className="pt-5 mt-2 flex justify-end border-t border-slate-100">
              <button 
                onClick={() => setViewRequest(null)}
                className="px-6 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer shadow-sm"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
