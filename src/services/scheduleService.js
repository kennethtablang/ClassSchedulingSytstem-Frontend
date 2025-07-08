// src/services/scheduleService.js
import axios from "./axiosInstance";

// Get all schedules
export const getAllSchedules = () => axios.get("/schedule");

// Get a single schedule by ID
export const getScheduleById = (id) => axios.get(`/schedule/${id}`);

// Create a new schedule
export const createSchedule = (schedule) => axios.post("/schedule", schedule);

// Update a schedule
export const updateSchedule = (id, schedule) => axios.put(`/schedule/${id}`, schedule);

// Delete a schedule
export const deleteSchedule = (id) => axios.delete(`/schedule/${id}`);

// Get schedules by faculty
export const getSchedulesByFaculty = (facultyId) =>
  axios.get(`/schedule/faculty/${facultyId}`);

// Get schedules by class section
export const getSchedulesBySection = (sectionId) =>
  axios.get(`/schedule/classsection/${sectionId}`);

// Get schedules by room
export const getSchedulesByRoom = (roomId) =>
  axios.get(`/schedule/room/${roomId}`);

// Check for schedule conflicts
export const checkScheduleConflict = (schedule, scheduleId = null) =>
  axios.post(
    `/schedule/check-conflict${scheduleId ? `?scheduleId=${scheduleId}` : ""}`,
    schedule
  );

// Get available rooms for a given time and day
export const getAvailableRooms = (day, startTime, endTime) =>
  axios.get("/schedule/available-rooms", {
    params: { day, startTime, endTime },
  });

// Download schedule as PDF based on POV and ID
export const downloadSchedulePdf = async (pov, id) => {
  const response = await axios.get("/schedule/print", {
    params: { pov, id },
    responseType: "blob", // Important for binary data
  });

  const blob = new Blob([response.data], { type: "application/pdf" });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");

  const filename = `Schedule_${pov}_${id || "All"}.pdf`;
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
};
