// src/services/notificationService.js
import { toast } from "sonner";

// Standard success notification
export const notifySuccess = (message, description = null) =>
  toast.success(message, description ? { description } : undefined);

// Standard error notification
export const notifyError = (message, description = null) =>
  toast.error(message, description ? { description } : undefined);

// Neutral/info notification
export const notifyInfo = (message, description = null) =>
  toast(message, description ? { description } : undefined);

// Optional: warning or custom action
export const notifyWarning = (message, description = null) =>
  toast.warning ? toast.warning(message, description ? { description } : undefined)
  : toast(message, description ? { description } : undefined);
