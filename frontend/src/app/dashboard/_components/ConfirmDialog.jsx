"use client";

import { AlertTriangle } from "lucide-react";

export default function ConfirmDialog({ open, onClose, onConfirm, title, message, confirmLabel = "Delete", destructive = true }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-white dark:bg-gray-950 rounded-lg shadow-xl border border-gray-200 dark:border-gray-800 p-5">
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-full shrink-0 ${destructive ? "bg-red-100 dark:bg-red-950/40" : "bg-amber-100 dark:bg-amber-950/40"}`}>
            <AlertTriangle className={`w-5 h-5 ${destructive ? "text-red-600 dark:text-red-400" : "text-amber-600 dark:text-amber-400"}`} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{title || "Are you sure?"}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{message || "This action cannot be undone."}</p>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-5">
          <button onClick={onClose} className="px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-700 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
            Cancel
          </button>
          <button
            onClick={() => { onConfirm(); onClose(); }}
            className={`px-3 py-1.5 text-sm rounded-md text-white transition-colors ${destructive ? "bg-red-600 hover:bg-red-700" : "bg-amber-600 hover:bg-amber-700"}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
