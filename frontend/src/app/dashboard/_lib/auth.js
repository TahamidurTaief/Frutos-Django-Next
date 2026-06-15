/**
 * Admin Auth Service
 *
 * Login via Django JWT, decode user claims, manage token lifecycle.
 */

import api, { setTokens, clearTokens, setStoredUser, getStoredUser, decodeToken, getAccessToken, isTokenExpired, getRefreshToken } from "./api";

/**
 * Login with email + password → obtain JWT pair.
 * Returns { user, access, refresh } or throws.
 */
export async function adminLogin(email, password) {
  const data = await api.post("/api/auth/login/", { email, password });

  const { access, refresh } = data;
  setTokens(access, refresh);

  // Decode user claims from access token
  const payload = decodeToken(access);
  // Use the full user object from the response if available (includes vendor_status)
  const serverUser = data.user || {};
  const user = {
    id: payload.user_id,
    email: payload.email || serverUser.email,
    name: payload.name || serverUser.name,
    userType: payload.user_type || serverUser.user_type,
    vendorStatus: serverUser.vendor_status || null,
  };

  // Verify admin access (only ADMIN / superuser)
  if (user.userType !== "ADMIN") {
    clearTokens();
    throw new Error("You do not have admin access. Only superusers are allowed.");
  }

  setStoredUser(user);
  return { user, access, refresh };
}

/**
 * Fetch full profile from /api/auth/me/
 */
export async function fetchAdminProfile() {
  return api.get("/api/auth/me/");
}

/**
 * Admin dashboard stats from /api/auth/dashboard/admin/
 */
export async function fetchAdminDashboardStats() {
  return api.get("/api/auth/dashboard/admin/");
}

/**
 * Logout → clear tokens. Backend blacklists refresh on rotation.
 */
export function adminLogout() {
  clearTokens();
}

/**
 * Check if there's a valid admin session.
 */
export function hasValidSession() {
  const token = getAccessToken();
  if (!token) return false;
  if (isTokenExpired(token)) {
    // Still have refresh token? Might recover.
    return !!getRefreshToken();
  }
  return true;
}

/**
 * Get the current admin user from storage.
 */
export function getCurrentAdmin() {
  return getStoredUser();
}

// Admin user management
export const adminUsersApi = {
  list: (params) => api.get("/api/auth/admin/users/", params),
};

// Admin vendor management
export const adminVendorsApi = {
  list: (params) => api.get("/api/auth/admin/vendors/", params),
  approve: (id, data) => api.patch(`/api/auth/admin/vendors/${id}/approve/`, data),
};
