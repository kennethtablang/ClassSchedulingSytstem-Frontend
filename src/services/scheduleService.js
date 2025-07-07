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
export const checkScheduleConflict = (schedule) =>
  axios.post("/schedule/check-conflict", schedule);

// Get available rooms for a given time and day
export const getAvailableRooms = (day, startTime, endTime) =>
  axios.get("/schedule/available-rooms", {
    params: { day, startTime, endTime },
  });


