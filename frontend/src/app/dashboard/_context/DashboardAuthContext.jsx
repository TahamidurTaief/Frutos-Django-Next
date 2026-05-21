"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { adminLogin, adminLogout, getCurrentAdmin, hasValidSession } from "@/app/dashboard/_lib/auth";
import { canAccessRoute, DASHBOARD_ROLES } from "@/app/dashboard/_lib/permissions";

const DashboardAuthContext = createContext(null);

export function DashboardAuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Restore session on mount
  useEffect(() => {
    if (!hasValidSession()) {
      setLoading(false);
      return;
    }
    const cached = getCurrentAdmin();
    if (cached && DASHBOARD_ROLES.includes(cached.userType)) {
      setUser(cached);
    }
    setLoading(false);
  }, []);

  // Listen for session-expired events (fired by API client on 401)
  useEffect(() => {
    const handler = () => {
      setUser(null);
      router.push("/dashboard/login");
    };
    window.addEventListener("admin:session-expired", handler);
    return () => window.removeEventListener("admin:session-expired", handler);
  }, [router]);

  // Redirect unauthenticated or unauthorized users
  useEffect(() => {
    if (loading) return;
    if (pathname === "/dashboard/login") return;
    if (!user) {
      router.push("/dashboard/login");
      return;
    }
    if (!canAccessRoute(user.userType, pathname)) {
      router.push("/dashboard");
    }
  }, [loading, user, pathname, router]);

  const login = useCallback(
    async (email, password) => {
      const { user: u } = await adminLogin(email, password);
      setUser(u);
      router.push("/dashboard");
      return u;
    },
    [router]
  );

  const logout = useCallback(() => {
    adminLogout();
    setUser(null);
    router.push("/dashboard/login");
  }, [router]);

  return (
    <DashboardAuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </DashboardAuthContext.Provider>
  );
}

export function useDashboardAuth() {
  const ctx = useContext(DashboardAuthContext);
  if (!ctx) throw new Error("useDashboardAuth must be inside DashboardAuthProvider");
  return ctx;
}
