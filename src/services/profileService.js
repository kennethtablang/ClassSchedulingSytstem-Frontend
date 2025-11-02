// src/services/profileService.js
import axios from "./axiosInstance"; // ✅ use your configured instance

export const getProfile = async () => {
  const res = await axios.get("/auth/profile");
  return res.data;
};

export const updateProfile = async (profileData) => {
  const res = await axios.put("/auth/profile", profileData);
  return res.data;
};

// ✅ NEW: Toggle 2FA for current user
export const toggle2FA = async (enabled) => {
  const res = await axios.post("/auth/toggle-2fa", { enabled });
  return res.data;
};

// ✅ NEW: Get current user's 2FA status
export const get2FAStatus = async () => {
  const res = await axios.get("/auth/2fa-status");
  return res.data;
};