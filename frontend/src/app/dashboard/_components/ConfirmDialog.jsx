"use client";

import { AlertTriangle, X, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ConfirmDialog({ open, onClose, onConfirm, title, message, confirmLabel = "Delete", destructive = true }) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 10 }}
            transition={{ type: "spring", duration: 0.4, bounce: 0 }}
            className="relative w-full max-w-[360px] bg-white rounded-xl shadow-xl overflow-hidden border border-slate-200"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors focus:outline-none cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="p-5">
              <div className="flex items-start gap-3">
                {/* Icon */}
                <div className={`mt-0.5 shrink-0 ${destructive ? 'text-red-500' : 'text-amber-500'}`}>
                  {destructive ? <Trash2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                </div>

                <div className="flex-1 pr-4">
                  <h3 className="text-[15px] font-semibold text-slate-900 leading-tight mb-1">
                    {title || "Are you sure?"}
                  </h3>
                  <p className="text-[13px] text-slate-500 leading-relaxed font-medium">
                    {message || "This action cannot be undone."}
                  </p>
                </div>
              </div>
            </div>

            <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                onClick={onClose}
                className="px-3.5 py-1.5 rounded-lg text-[13px] font-semibold text-slate-600 bg-white border border-slate-300 hover:bg-slate-50 transition-all focus:outline-none cursor-pointer shadow-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => { onConfirm(); onClose(); }}
                className={`px-3.5 py-1.5 rounded-lg text-[13px] font-semibold text-white shadow-sm transition-all focus:outline-none cursor-pointer ${
                  destructive 
                    ? 'bg-red-600 hover:bg-red-700 focus:ring-2 focus:ring-red-500/20' 
                    : 'bg-amber-600 hover:bg-amber-700 focus:ring-2 focus:ring-amber-500/20'
                }`}
              >
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
