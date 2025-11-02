// src/services/userService.js
import axios from "./axiosInstance"; // ✅ Using centralized instance

// === USER CRUD ===
export const getUsers = () => axios.get("/user/users");
export const addUser = (data) => axios.post("/user/users", data);
export const updateUser = (id, data) => axios.put(`/user/users/${id}`, data);
export const deleteUser = (id) => axios.delete(`/user/users/${id}`);

// === ROLE MANAGEMENT ===
export const assignRole = (id, role) =>
  axios.put(`/user/users/${id}/roles`, { role });

// === PASSWORD RESET ===
export const resetPassword = (id, data) =>
  axios.put(`/user/users/${id}/reset-password`, data);

// === TOGGLE ACTIVE/DEACTIVATE ===
export const toggleUserStatus = (id) =>
  axios.patch(`/user/users/${id}/toggle-status`);

// === GET ARCHIVED USERS ===
export const getArchivedUsers = () => axios.get("/user/users/archived");

// === PENDING APPROVALS ===
export const getPendingApprovals = () => axios.get("/user/pending-approvals");
export const approveUser = (id) => axios.put(`/user/users/${id}/approve`);
export const denyUser = (id, reason) => axios.put(`/user/users/${id}/deny`, reason);
