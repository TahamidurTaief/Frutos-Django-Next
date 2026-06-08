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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(15,23,42,0.3)", backdropFilter: "blur(4px)" }}>
      <div className="absolute inset-0" onClick={onClose} />
      <div
        className={`relative w-full ${maxWidth} max-h-[90vh] flex flex-col`}
        style={{
          background: "#ffffff",
          borderRadius: "16px",
          border: "1px solid #f1f5f9",
          boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
          animation: "db-modal-in 0.2s ease",
        }}
      >
        {title && (
          <div className="flex items-center justify-between shrink-0" style={{ padding: "18px 22px", borderBottom: "1px solid #f1f5f9" }}>
            <h2 style={{ fontSize: "15px", fontWeight: "800", color: "#1e293b", margin: 0 }}>{title}</h2>
            <button
              onClick={onClose}
              style={{ padding: "6px", borderRadius: "8px", border: "none", cursor: "pointer", background: "transparent", color: "#94a3b8", display: "flex", alignItems: "center", transition: "all 0.15s" }}
              onMouseEnter={e => { e.currentTarget.style.background = "#f1f5f9"; e.currentTarget.style.color = "#475569"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#94a3b8"; }}
            >
              <X size={16} />
            </button>
          </div>
        )}
        <div className="flex-1 overflow-y-auto" style={{ padding: "22px" }}>{children}</div>
      </div>
    </div>
  );
}
