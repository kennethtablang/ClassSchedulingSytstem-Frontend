// src/api/axios.js
// Lightweight axios instance used by some modules.
// Mirrors logic used in services/axiosInstance.js.

import axios from "axios";

const API = import.meta.env.VITE_API_URL ?? "https://localhost:7037/api";

const api = axios.create({
  baseURL: API,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers = config.headers ?? {};
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (err) {
      console.error("api request interceptor error reading token", err);
    }
    return config;
  },
  (err) => Promise.reject(err)
);

api.interceptors.response.use(
  (r) => r,
  (err) => {
    const status = err?.response?.status;
    if (status === 401) {
      try {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      } catch (storageErr) {
        console.error("Error clearing storage after 401", storageErr);
      }
      // redirect to login page (full reload)
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export default api;
