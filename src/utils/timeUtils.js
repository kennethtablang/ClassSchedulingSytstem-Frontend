// src/utils/timeUtils.js
/**
 * Converts 12-hour time format (HH:MM AM/PM) to 24-hour format (HH:MM)
 * @param {string} time12h - Time in 12-hour format (e.g., "02:30 PM")
 * @returns {string} Time in 24-hour format (e.g., "14:30")
 */
export const convertTo24Hour = (time12h) => {
  if (!time12h) return "";

  // If already in 24-hour format (no AM/PM), return as is
  if (!time12h.includes("AM") && !time12h.includes("PM")) {
    // Ensure it's in HH:MM format
    const parts = time12h.split(":");
    if (parts.length === 2) {
      return `${parts[0].padStart(2, "0")}:${parts[1].padStart(2, "0")}`;
    }
    return time12h;
  }

  const [time, period] = time12h.trim().split(" ");
  let [hours, minutes] = time.split(":");

  hours = parseInt(hours, 10);
  minutes = minutes || "00";

  if (period === "PM" && hours !== 12) {
    hours += 12;
  } else if (period === "AM" && hours === 12) {
    hours = 0;
  }

  return `${hours.toString().padStart(2, "0")}:${minutes.padStart(2, "0")}`;
};

/**
 * Converts 24-hour time format (HH:MM:SS or HH:MM) to 12-hour format (HH:MM AM/PM)
 * @param {string} time24h - Time in 24-hour format (e.g., "14:30" or "14:30:00")
 * @returns {string} Time in 12-hour format (e.g., "02:30 PM")
 */
export const convertTo12Hour = (time24h) => {
  if (!time24h) return "";

  // Remove seconds if present
  const timeParts = time24h.split(":");
  let hours = parseInt(timeParts[0], 10);
  const minutes = timeParts[1] || "00";

  const period = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12; // Convert 0 to 12 for midnight

  return `${hours}:${minutes} ${period}`;
};

/**
 * Formats time for HTML time input (always 24-hour format HH:MM)
 * @param {string} time - Time in any format
 * @returns {string} Time in HH:MM format for input[type="time"]
 */
export const formatTimeForInput = (time) => {
  if (!time) return "";

  // If it has AM/PM, convert to 24-hour
  if (time.includes("AM") || time.includes("PM")) {
    return convertTo24Hour(time);
  }

  // Remove seconds if present
  const parts = time.split(":");
  if (parts.length >= 2) {
    return `${parts[0].padStart(2, "0")}:${parts[1].padStart(2, "0")}`;
  }

  return time;
};

/**
 * Formats time for display (12-hour format)
 * @param {string} time - Time in any format
 * @returns {string} Time in 12-hour format for display
 */
export const formatTimeForDisplay = (time) => {
  if (!time) return "";

  // If already in 12-hour format, return as is
  if (time.includes("AM") || time.includes("PM")) {
    return time;
  }

  // Convert from 24-hour to 12-hour
  return convertTo12Hour(time);
};

/**
 * Validates if a time string is in valid 24-hour format
 * @param {string} time - Time string to validate
 * @returns {boolean} True if valid 24-hour format
 */
export const isValid24HourTime = (time) => {
  if (!time) return false;

  const timeRegex = /^([0-1]?[0-9]|2[0-3]):([0-5][0-9])$/;
  return timeRegex.test(time);
};

/**
 * Validates if a time string is in valid 12-hour format
 * @param {string} time - Time string to validate
 * @returns {boolean} True if valid 12-hour format
 */
export const isValid12HourTime = (time) => {
  if (!time) return false;

  const timeRegex = /^(0?[1-9]|1[0-2]):([0-5][0-9])\s?(AM|PM)$/i;
  return timeRegex.test(time);
};

/**
 * Ensures time is in the correct format for API submission (24-hour HH:MM)
 * @param {string} time - Time in any format
 * @returns {string} Time in 24-hour format ready for API
 */
export const prepareTimeForAPI = (time) => {
  if (!time) return "";

  // Convert to 24-hour if needed
  const time24 = time.includes("AM") || time.includes("PM") 
    ? convertTo24Hour(time) 
    : time;

  // Ensure proper format (remove seconds if present)
  const parts = time24.split(":");
  if (parts.length >= 2) {
    return `${parts[0].padStart(2, "0")}:${parts[1].padStart(2, "0")}`;
  }

  return time24;
};

/**
 * Calculate duration between two times in hours
 * @param {string} startTime - Start time (any format)
 * @param {string} endTime - End time (any format)
 * @returns {number} Duration in hours
 */
export const calculateDuration = (startTime, endTime) => {
  if (!startTime || !endTime) return 0;

  const start24 = prepareTimeForAPI(startTime);
  const end24 = prepareTimeForAPI(endTime);

  const [startHour, startMin] = start24.split(":").map(Number);
  const [endHour, endMin] = end24.split(":").map(Number);

  const startMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;

  return (endMinutes - startMinutes) / 60;
};

/**
 * Validate that end time is after start time
 * @param {string} startTime - Start time (any format)
 * @param {string} endTime - End time (any format)
 * @returns {boolean} True if end time is after start time
 */
export const isEndTimeAfterStartTime = (startTime, endTime) => {
  const duration = calculateDuration(startTime, endTime);
  return duration > 0;
};