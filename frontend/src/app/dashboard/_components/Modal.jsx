"use client";

import { X } from "lucide-react";
import { useEffect } from "react";

export default function Modal({ open, onClose, title, children, maxWidth = "max-w-2xl" }) {
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" style={{ background: "rgba(15,23,42,0.4)", backdropFilter: "blur(4px)" }}>
      <div className="min-h-screen px-4 text-center flex items-center justify-center py-10 sm:py-20">
        <div className="fixed inset-0" onClick={onClose} />
        <div
          className={`relative w-full ${maxWidth} text-left flex flex-col bg-white rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.15)] animate-[db-modal-in_0.2s_ease]`}
        >
          {title && (
            <div className="flex items-center justify-between shrink-0 px-6 py-5 border-b border-slate-100 bg-white/50 backdrop-blur-md rounded-t-2xl">
              <h2 className="text-xl font-serif font-bold text-[#004A3A] tracking-tight m-0">{title}</h2>
              <button
                onClick={onClose}
                className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 transition-colors cursor-pointer shadow-sm border border-slate-200/50"
              >
                <X size={20} />
              </button>
            </div>
          )}
          <div className="p-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
