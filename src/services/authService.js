// src/services/authService.js
import api from "../api/axios";
import { jwtDecode } from "jwt-decode";

// Login user with credentials
export const loginUser = async (credentials) => {
  const response = await api.post("/auth/login", credentials);
  const { token } = response.data;

  // Store JWT token
  if (token) {
    localStorage.setItem("token", token); // ✅ Store token for future use
    console.log("[AuthService] Token stored:", token); // 🔍 Debug (optional)
  }

  return response.data;
};

// Register new user
export const registerUser = async (userData) => {
  const response = await api.post("/auth/register", userData);
  return response.data;
};

// Logout user
export const logoutUser = () => {
  localStorage.removeItem("token");
};

// ✅ Decode and return current user from token
export const getLoggedInUser = () => {
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    return jwtDecode(token); // Contains claims like id, email, role, etc.
  } catch (error) {
    console.error("Invalid JWT:", error);
    return null;
  }
};
