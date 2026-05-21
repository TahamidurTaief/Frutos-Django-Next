"use client";

import { createContext, useContext, useCallback } from "react";
import { Toaster as HotToaster, toast as hotToast } from "react-hot-toast";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const success = useCallback((msg) => hotToast.success(msg), []);
  const error = useCallback((msg) => hotToast.error(msg), []);
  const info = useCallback((msg) => hotToast(msg), []);

  return (
    <ToastContext.Provider value={{ success, error, info }}>
      {children}
      <HotToaster
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            borderRadius: "8px",
            fontSize: "13px",
            fontWeight: 500,
            maxWidth: "360px",
          },
          success: {
            style: { background: "#059669", color: "#fff" },
            iconTheme: { primary: "#fff", secondary: "#059669" },
          },
          error: {
            style: { background: "#dc2626", color: "#fff" },
            iconTheme: { primary: "#fff", secondary: "#dc2626" },
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
