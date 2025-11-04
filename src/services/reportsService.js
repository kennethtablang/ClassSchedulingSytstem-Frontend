// src/services/reportsService.js
import axios from "./axiosInstance";

/**
 * Download Academic Load Report for all faculty
 * @param {number} semesterId - The semester ID to generate report for
 * @returns {Promise} - Triggers browser download
 */
export const downloadAllFacultyLoadReport = async (semesterId) => {
  const params = {};
  
  if (semesterId) {
    params.semesterId = semesterId;
  }

  const response = await axios.get("/report/faculty-load/all", {
    params,
    responseType: "blob",
  });

  const blob = new Blob([response.data], { type: "application/pdf" });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  
  const filename = `Academic_Load_Report_All_Faculty_Sem${semesterId || "Current"}.pdf`;
  
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

/**
 * Download Academic Load Report for a specific faculty
 * @param {string} facultyId - The faculty user ID
 * @param {number} semesterId - The semester ID to generate report for
 * @returns {Promise} - Triggers browser download
 */
export const downloadFacultyLoadReport = async (facultyId, semesterId) => {
  const params = {};
  
  if (semesterId) {
    params.semesterId = semesterId;
  }

  const response = await axios.get(`/report/faculty-load/${facultyId}`, {
    params,
    responseType: "blob",
  });

  const blob = new Blob([response.data], { type: "application/pdf" });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  
  const filename = `Academic_Load_Report_Faculty_${facultyId}_Sem${semesterId || "Current"}.pdf`;
  
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

/**
 * Get faculty load summary data (for preview/table display)
 * @param {number} semesterId - The semester ID
 * @returns {Promise} - Array of faculty load summaries
 */
export const getFacultyLoadSummary = async (semesterId) => {
  const params = {};
  
  if (semesterId) {
    params.semesterId = semesterId;
  }

  const response = await axios.get("/report/faculty-load/summary", {
    params,
  });
  
  return response.data;
};