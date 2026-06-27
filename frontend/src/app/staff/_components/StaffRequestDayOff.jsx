"use client";

import { useState } from "react";
import useSWR from "swr";
import api from "@/app/dashboard/_lib/api";
import { Loader2, Calendar, FileText, Send, CheckCircle2, XCircle, Clock } from "lucide-react";
import { useToastContext } from "@/app/dashboard/_components/Toaster";

export default function StaffRequestDayOff() {
  const toast = useToastContext();
  const [date, setDate] = useState("");
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      <div className="flex justify-between items-end mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-4xl font-serif text-[#004A3A] font-medium tracking-tight">Request Day Off</h1>
          </div>
          <p className="text-slate-500 text-[13px] italic font-serif">Submit and track your time off requests</p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
        {/* Form Section */}
        <div className="md:col-span-1 bg-white rounded-xl p-6 shadow-sm border border-slate-100 h-fit">
          <h2 className="text-lg font-semibold text-[#004A3A] mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#00694C]" /> New Request
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Date</label>
              <input 
                type="date" 
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00694C]/30 focus:border-[#00694C] transition-all"
                required
                min={new Date().toISOString().split("T")[0]}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Reason</label>
              <textarea 
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00694C]/30 focus:border-[#00694C] transition-all"
                placeholder="Please explain why you need this day off..."
                required
              />
            </div>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 bg-[#00694C] hover:bg-[#004A3A] text-white py-2.5 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              {isSubmitting ? "Submitting..." : "Submit Request"}
            </button>
          </form>
        </div>

        {/* History Section */}
        <div className="md:col-span-2 bg-white rounded-xl p-6 shadow-sm border border-slate-100">
          <h2 className="text-lg font-semibold text-[#004A3A] mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#00694C]" /> Request History
          </h2>
          
          {isLoading ? (
            <div className="py-12 flex justify-center"><Loader2 className="w-8 h-8 text-[#00694C] animate-spin" /></div>
          ) : error ? (
            <div className="py-12 text-center text-red-500 text-sm">Failed to load requests.</div>
          ) : requests.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm italic">You haven't made any requests yet.</div>
          ) : (
            <div className="space-y-3">
              {requests.map(req => (
                <div key={req.id} className="border border-slate-100 rounded-lg p-4 hover:border-slate-200 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="font-bold text-slate-800">{new Date(req.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
                      <div className="text-xs text-slate-400 mt-0.5">Requested on {new Date(req.created_at).toLocaleDateString()}</div>
                    </div>
                    {getStatusBadge(req.status)}
                  </div>
                  <div className="text-sm text-slate-600 bg-slate-50 p-3 rounded mt-3">
                    {req.reason}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
