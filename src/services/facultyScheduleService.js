// src/services/facultyScheduleService.js
import axios from "./axiosInstance";

// Get current faculty's schedule
export const getMySchedule = () => axios.get("/facultyuser/my-schedule");

// Get assigned subjects to the current faculty (scheduled or not)
export const getAssignedSubjects = () => axios.get("/facultyuser/assigned-subjects");

//  Download faculty schedule PDF with optional semesterId and day filter
export const downloadMySchedulePdf = async (semesterId, day) => {
  const params = {};
  
  if (semesterId) {
    params.semesterId = semesterId;
  }

  // NEW: Add day parameter if provided
  if (day && day !== "") {
    params.day = day;
  }

  const response = await axios.get("/facultyuser/print-my-schedule", {
    params,
    responseType: "blob", // Important for downloading binary files like PDFs
  });

  const blob = new Blob([response.data], { type: "application/pdf" });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");

  // Include day in filename when filtered
  const dayLabel = day ? `_${day}` : "";
  const filename = `Schedule_Faculty_${semesterId || "All"}${dayLabel}.pdf`;
  
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
};

// Get current semester (used by Faculty pages)
export const getCurrentSemester = () => axios.get("/facultyuser/current-semester");