// src/utils/auth.js
import { jwtDecode } from "jwt-decode";

/**
 * Extract roles from the JWT token stored in localStorage.
 * Assumes ASP.NET-style role claim.
 */
export const getUserRoles = () => {
  const token = localStorage.getItem("token");
  if (!token) return [];

  try {
    const decoded = jwtDecode(token);
    const rolesClaim =
      decoded[
        "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
      ];
    // Return as array even if it's a single role
    return Array.isArray(rolesClaim) ? rolesClaim : [rolesClaim];
  } catch (error) {
    console.error("Invalid JWT token:", error);
    return [];
  }
};
