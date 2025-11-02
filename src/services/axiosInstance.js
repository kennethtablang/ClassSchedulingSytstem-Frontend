// src/services/axiosInstance.js
// Central axios instance used throughout the app.
// - attaches Authorization header (token from localStorage)
// - handles 401 responses centrally (clear auth + redirect to /login)
// - exports clearAuthStorage for programmatic sign-out

import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL ?? "https://localhost:7037/api";

const axiosInstance = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Clear local auth artifacts (token + cached user).
 */
export function clearAuthStorage() {
  try {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  } catch (err) {
    // Log to help debugging if localStorage is unavailable
    console.error("clearAuthStorage error", err);
  }
}

/**
 * Attach bearer token if present.
 */
axiosInstance.interceptors.request.use(
  (config) => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers = config.headers ?? {};
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (err) {
      // Can't read localStorage (rare) -> continue without token
      console.error("axios request interceptor error reading token", err);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Global response handler:
 * - On 401: clear auth and redirect to /login
 * - Prevents infinite redirect loops using a _retry flag on config
 */
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const { response, config } = error || {};

    // If there's no response (network error), just propagate
    if (!response || !config) return Promise.reject(error);

    if (response.status === 401) {
      // Avoid handling the same request more than once
      if (config._retry) return Promise.reject(error);
      config._retry = true;

      // Clear token + user
      clearAuthStorage();

      // Optional: log for debugging
      console.warn("Unauthorized (401) detected - clearing auth and redirecting to /login");

      // Force full reload to clear stale SPA state and navigate to login
      window.location.href = "/login";

      return Promise.reject(error);
    }

    // other errors - forward
    return Promise.reject(error);
  }
);

export default axiosInstance;
