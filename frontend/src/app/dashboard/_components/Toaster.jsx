"use client";

import { createContext, useContext, useCallback } from "react";
import { Toaster as HotToaster, toast as hotToast } from "react-hot-toast";
import { CheckCircle, XCircle, Info } from "lucide-react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const success = useCallback((msg) => hotToast.success(msg), []);
  const error = useCallback((msg) => hotToast.error(msg), []);
  const info = useCallback((msg) => hotToast(msg), []);

  return (
    <ToastContext.Provider value={{ success, error, info }}>
      {children}
      <HotToaster
        position="top-right"
        gutter={10}
        toastOptions={{
          duration: 4000,
          style: {
            borderRadius: "12px",
            fontSize: "13px",
            fontWeight: "600",
            maxWidth: "380px",
            background: "#ffffff",
            color: "#1e293b",
            border: "1px solid #f1f5f9",
            boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
            padding: "12px 16px",
          },
          success: {
            style: {
              background: "#ffffff",
              color: "#166534",
              borderLeft: "4px solid #22c55e",
            },
            iconTheme: { primary: "#22c55e", secondary: "#ffffff" },
          },
          error: {
            style: {
              background: "#ffffff",
              color: "#991b1b",
              borderLeft: "4px solid #ef4444",
            },
            iconTheme: { primary: "#ef4444", secondary: "#ffffff" },
          },
        }}
      />
    </ToastContext.Provider>
  );
}

export function useToastContext() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToastContext must be inside ToastProvider");
  return ctx;
}

// Also export toast directly for convenience
export { hotToast as toast };
