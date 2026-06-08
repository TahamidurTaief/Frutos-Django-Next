"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  MessageSquare, Eye, Reply, CheckCircle2, Clock, AlertCircle,
  XCircle, Loader2, ChevronDown, ZoomIn, X, Send, RefreshCw,
  User, Mail, Tag, AlertTriangle,
} from "lucide-react";
import Container from "@/app/dashboard/_components/Container";
import { useToastContext } from "@/app/dashboard/_components/Toaster";
import api from "@/app/dashboard/_lib/api";

/* ─── Constants ──────────────────────────────────────────────── */
const STATUS_TABS = [
  { id: "all", label: "All" },
  { id: "OPEN", label: "Open" },
  { id: "IN_PROGRESS", label: "In Progress" },
  { id: "RESOLVED", label: "Resolved" },
  { id: "CLOSED", label: "Closed" },
];

const PRIORITY_BADGE = {
  LOW: "bg-slate-100 text-slate-600",
  MEDIUM: "bg-blue-100 text-blue-600",
  HIGH: "bg-orange-100 text-orange-600",
  URGENT: "bg-red-100 text-red-600",
};

const STATUS_BADGE = {
  OPEN: "bg-yellow-100 text-yellow-700",
  IN_PROGRESS: "bg-blue-100 text-blue-700",
  RESOLVED: "bg-green-100 text-green-700",
  CLOSED: "bg-slate-100 text-slate-600",
};

const STATUS_ICON = {
  OPEN: AlertCircle,
  IN_PROGRESS: Clock,
  RESOLVED: CheckCircle2,
  CLOSED: XCircle,
};

const CATEGORY_LABEL = {
  GENERAL: "General", TECHNICAL: "Technical", PAYMENT: "Payment",
  ACCOUNT: "Account", ORDER: "Order", PRODUCT: "Product",
};

/* ─── Utility: extract image URLs from text ─────────────────── */
function extractImageUrls(text = "") {
  const urlRegex = /https?:\/\/[^\s"'<>]+\.(?:jpg|jpeg|png|gif|webp|svg)(\?[^\s"'<>]*)?/gi;
  return [...new Set(text.match(urlRegex) || [])];
}

/* ─── Image Viewer Modal ─────────────────────────────────────── */
function ImageViewer({ src, onClose }) {
  if (!src) return null;
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80" onClick={onClose}>
      <button onClick={onClose} className="absolute top-4 right-4 text-white/80 hover:text-white p-2 rounded-full hover:bg-white/10">
        <X className="w-6 h-6" />
      </button>
      <img
        src={src}
        alt="Ticket attachment"
        className="max-w-[90vw] max-h-[85vh] object-contain rounded-lg shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}

/* ─── Ticket Detail Modal ────────────────────────────────────── */
function TicketDetailModal({ ticket, onClose, onReplySuccess }) {
  const toast = useToastContext();
  const [replyText, setReplyText] = useState(ticket.admin_response || "");
  const [newStatus, setNewStatus] = useState(ticket.status);
  const [submitting, setSubmitting] = useState(false);
  const [viewerSrc, setViewerSrc] = useState(null);

  const images = extractImageUrls(ticket.description);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) { toast.error("Reply cannot be empty"); return; }
    setSubmitting(true);
    try {
      await api.patch(`/api/auth/vendor/tickets/${ticket.id}/`, {
        admin_response: replyText,
        status: newStatus,
      });
      toast.success("Reply sent & status updated");
      onReplySuccess?.();
      onClose();
    } catch (err) {
      toast.error(err?.message || "Failed to send reply");
    } finally {
      setSubmitting(false);
    }
  };

  const StatusIcon = STATUS_ICON[ticket.status] || AlertCircle;

  return (
    <>
      {viewerSrc && <ImageViewer src={viewerSrc} onClose={() => setViewerSrc(null)} />}
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
        <div
          className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-start justify-between p-5 border-b border-slate-200">
            <div>
              <div className="db-filter-bar">
                <span className="text-xs font-medium text-slate-400">Ticket #{ticket.id}</span>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full font-medium ${STATUS_BADGE[ticket.status] || ""}`}>
                  <StatusIcon className="w-3 h-3" />
                  {ticket.status.replace("_", " ")}
                </span>
                <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${PRIORITY_BADGE[ticket.priority] || ""}`}>
                  {ticket.priority}
                </span>
              </div>
              <h2 className="text-base font-semibold text-slate-800">{ticket.subject}</h2>
            </div>
            <button onClick={onClose} className="db-icon-btn">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-5 space-y-5">
            {/* Meta */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <User className="w-4 h-4 shrink-0 text-slate-400" />
                <span className="font-medium text-slate-800">{ticket.vendor_name || "—"}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Mail className="w-4 h-4 shrink-0 text-slate-400" />
                <span>{ticket.vendor_email || "—"}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Tag className="w-4 h-4 shrink-0 text-slate-400" />
                <span>{CATEGORY_LABEL[ticket.category] || ticket.category}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Clock className="w-4 h-4 shrink-0 text-slate-400" />
                <span>{ticket.created_at ? new Date(ticket.created_at).toLocaleString() : "—"}</span>
              </div>
            </div>

            {/* Description */}
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-slate-400 mb-2">Description</p>
              <div className="text-sm text-slate-700 bg-slate-50 rounded-lg p-3 whitespace-pre-wrap leading-relaxed border border-slate-200">
                {ticket.description}
              </div>
            </div>

            {/* Inline images extracted from description */}
            {images.length > 0 && (
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-slate-400 mb-2">Attachments</p>
                <div className="flex flex-wrap gap-2">
                  {images.map((src, i) => (
                    <button
                      key={i}
                      onClick={() => setViewerSrc(src)}
                      className="relative group rounded-md overflow-hidden border border-slate-200 w-20 h-20 shrink-0"
                    >
                      <img src={src} alt={`attachment ${i + 1}`} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <ZoomIn className="w-5 h-5 text-white" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Existing admin response */}
            {ticket.admin_response && (
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-slate-400 mb-2">Previous Response</p>
                <div className="text-sm text-slate-700 bg-blue-50 rounded-lg p-3 whitespace-pre-wrap leading-relaxed border border-blue-100">
                  {ticket.admin_response}
                </div>
              </div>
            )}

            {/* Reply Form */}
            <form onSubmit={handleSubmit} className="space-y-3">
              <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                {ticket.admin_response ? "Update Response" : "Reply"}
              </p>
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                rows={4}
                placeholder="Write your response to the vendor..."
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-gray-400 resize-none"
              />
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-gray-400"
                  >
                    <option value="OPEN">Open</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="RESOLVED">Resolved</option>
                    <option value="CLOSED">Closed</option>
                  </select>
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-slate-900 text-white rounded-md hover:bg-gray-800 disabled:opacity-50 transition-colors"
                >
                  {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  Send Reply
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

/* ─── Main Page ──────────────────────────────────────────────── */
export default function TicketsPage() {
  const toast = useToastContext();
  const [activeStatus, setActiveStatus] = useState("all");
  const [tickets, setTickets] = useState([]);
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const PAGE_SIZE = 15;

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, page_size: PAGE_SIZE };
      if (activeStatus !== "all") params.status = activeStatus;
      if (search.trim()) params.search = search.trim();
      const res = await api.get("/api/auth/vendor/tickets/", params);
      if (Array.isArray(res)) {
        setTickets(res);
        setTotalCount(res.length);
      } else {
        setTickets(res.results ?? []);
        setTotalCount(res.count ?? 0);
      }
    } catch (err) {
      toast.error(err?.message || "Failed to load tickets");
    } finally {
      setLoading(false);
    }
  }, [activeStatus, search, page]);

  // Fetch per-status counts for tabs
  const fetchCounts = useCallback(async () => {
    try {
      const statuses = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"];
      const results = await Promise.allSettled(
        statuses.map((s) => api.get("/api/auth/vendor/tickets/", { status: s, page_size: 1 }))
      );
      const newCounts = {};
      results.forEach((r, i) => {
        if (r.status === "fulfilled") {
          const res = r.value;
          newCounts[statuses[i]] = Array.isArray(res) ? res.length : (res.count ?? 0);
        }
      });
      setCounts(newCounts);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => { fetchTickets(); }, [fetchTickets]);
  useEffect(() => { fetchCounts(); }, [fetchCounts]);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => { setPage(1); fetchTickets(); }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  return (
    <Container title="Support Tickets" description="Review and respond to vendor support tickets">
      {selectedTicket && (
        <TicketDetailModal
          ticket={selectedTicket}
          onClose={() => setSelectedTicket(null)}
          onReplySuccess={() => { fetchTickets(); fetchCounts(); }}
        />
      )}

      {/* Status Tabs + Controls */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-1 overflow-x-auto border-b border-slate-200 pb-px">
          {STATUS_TABS.map((tab) => {
            const allCount = Object.values(counts).reduce((s, c) => s + c, 0);
            const count = tab.id !== "all" ? counts[tab.id] : allCount;
            return (
              <button
                key={tab.id}
                onClick={() => { setActiveStatus(tab.id); setPage(1); }}
                className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors -mb-px whitespace-nowrap flex items-center gap-1.5 ${
                  activeStatus === tab.id
                    ? "border-gray-900 text-slate-800"
                    : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
              >
                {tab.label}
                {count > 0 && (
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                    tab.id === "OPEN" ? "bg-red-100 text-red-600" : "bg-slate-100 text-slate-500"
                  }`}>{count}</span>
                )}
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-2 pl-3">
          <input
            type="search"
            placeholder="Search…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-md bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-gray-400 w-44"
          />
          <button
            onClick={() => { fetchTickets(); fetchCounts(); }}
            className="p-1.5 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
        </div>
      ) : tickets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <MessageSquare className="w-10 h-10 mb-3 opacity-40" />
          <p className="text-sm font-medium">No tickets found</p>
          <p className="text-xs mt-1">
            {activeStatus !== "all" ? `No ${activeStatus.toLowerCase().replace("_", " ")} tickets` : "All clear!"}
          </p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">#</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Subject</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Vendor</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Priority</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Created</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {tickets.map((ticket) => {
                  const StatusIcon = STATUS_ICON[ticket.status] || AlertCircle;
                  return (
                    <tr key={ticket.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 text-slate-400 font-mono text-xs">{ticket.id}</td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-800 max-w-[220px] truncate">{ticket.subject}</p>
                        <p className="text-xs text-slate-400 mt-0.5 max-w-[220px] truncate">{ticket.description}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-slate-800 font-medium text-xs">{ticket.vendor_name || "—"}</p>
                        <p className="text-xs text-slate-400">{ticket.vendor_email || ""}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-slate-600">{CATEGORY_LABEL[ticket.category] || ticket.category}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${PRIORITY_BADGE[ticket.priority] || ""}`}>
                          {ticket.priority}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full font-medium ${STATUS_BADGE[ticket.status] || ""}`}>
                          <StatusIcon className="w-3 h-3" />
                          {ticket.status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">
                        {ticket.created_at ? new Date(ticket.created_at).toLocaleDateString() : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setSelectedTicket(ticket)}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium text-white bg-gray-800 hover:bg-gray-700 transition-colors"
                          >
                            <Reply className="w-3 h-3" />
                            {ticket.admin_response ? "Update" : "Reply"}
                          </button>
                          <button
                            onClick={() => setSelectedTicket(ticket)}
                            className="db-icon-btn"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-slate-500">
                {totalCount} ticket{totalCount !== 1 ? "s" : ""}
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 text-sm rounded-md border border-gray-300 disabled:opacity-40 hover:bg-slate-100 transition-colors"
                >
                  Prev
                </button>
                <span className="px-3 py-1.5 text-sm text-slate-600">
                  {page} / {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1.5 text-sm rounded-md border border-gray-300 disabled:opacity-40 hover:bg-slate-100 transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </Container>
  );
}

