// src/services/emailConfirmationService.js
import axios from "./axiosInstance";

/**
 * Request email change confirmation
 * Sends a confirmation code to the new email address
 */
export const requestEmailChange = async (newEmail) => {
  const response = await axios.post("/user/profile/change-email", { 
    newEmail 
  });
  return response.data;
};

/**
 * Confirm email change with OTP code
 */
export const confirmEmailChange = async (userId, email, token) => {
  const response = await axios.get("/user/confirm-change-email", {
    params: { userId, email, token }
  });
  return response.data;
};

/**
 * Request initial email confirmation (for new users)
 * Backend should generate and send OTP to user's email
 */
export const requestInitialEmailConfirmation = async () => {
  const response = await axios.post("/auth/request-email-confirmation");
  return response.data;
};

/**
 * Confirm initial email with OTP
 */
export const confirmInitialEmail = async (code) => {
  const response = await axios.post("/auth/confirm-email", { code });
  return response.data;
};

/**
 * Resend email confirmation code
 */
export const resendEmailConfirmation = async () => {
  const response = await axios.post("/auth/resend-email-confirmation");
  return response.data;
};