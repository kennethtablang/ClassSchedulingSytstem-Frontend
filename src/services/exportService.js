// src/services/exportService.js
import axios from "./axiosInstance";

/**
 * Download schedule as Excel file with worksheets per day
 */
export const downloadScheduleXlsx = async (pov, id, semesterId, filters = {}) => {
  try {
    const params = { pov, id, semesterId, ...filters };

    const response = await axios.get("/export/schedule/excel", {
      params,
      responseType: "blob",
    });

    const blob = new Blob([response.data], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;

    const dayLabel = filters.day ? `_${filters.day}` : "";
    const filename = `Schedule_${pov}_${id || "All"}${dayLabel}_Sem${semesterId}_${new Date().toISOString().split('T')[0]}.xlsx`;

    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Failed to download Excel:", error);
    throw error;
  }
};

/**
 * Download room utilization report as Excel
 */
export const downloadRoomUtilizationXlsx = async (semesterId) => {
  try {
    const response = await axios.get("/export/room-utilization/excel", {
      params: { semesterId },
      responseType: "blob",
    });

    const blob = new Blob([response.data], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;

    const filename = `RoomUtilization_Sem${semesterId}_${new Date().toISOString().split('T')[0]}.xlsx`;

    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Failed to download room utilization Excel:", error);
    throw error;
  }
};

/**
 * Download current faculty's schedule as Excel
 */
export const downloadMyScheduleXlsx = async (semesterId, day) => {
  try {
    const params = { semesterId };
    if (day) params.day = day;

    const response = await axios.get("/export/my-schedule/excel", {
      params,
      responseType: "blob",
    });

    const blob = new Blob([response.data], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;

    const dayLabel = day ? `_${day}` : "";
    const filename = `MySchedule${dayLabel}_Sem${semesterId}_${new Date().toISOString().split('T')[0]}.xlsx`;

    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Failed to download my schedule Excel:", error);
    throw error;
  }
};