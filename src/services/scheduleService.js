import axios from "./axiosInstance";

// Get all schedules
export const getAllSchedules = async () => {
  const res = await axios.get("/schedule");
  return res.data;
};

// Get schedule by ID
export const getScheduleById = async (id) => {
  const res = await axios.get(`/schedule/${id}`);
  return res.data;
};

// Create new schedule
export const createSchedule = async (data) => {
  const res = await axios.post("/schedule", data);
  return res.data;
};

// Update existing schedule
export const updateSchedule = async (id, data) => {
  const res = await axios.put(`/schedule/${id}`, data);
  return res.data;
};

// Delete schedule
export const deleteSchedule = async (id) => {
  const res = await axios.delete(`/schedule/${id}`);
  return res.data;
};

// Filter: Get schedules by section
export const getSchedulesBySection = async (sectionId) => {
  const res = await axios.get(`/schedule/by-section/${sectionId}`);
  return res.data;
};

// Filter: Get schedules by faculty
export const getSchedulesByFaculty = async (facultyId) => {
  const res = await axios.get(`/schedule/by-faculty/${facultyId}`);
  return res.data;
};

// Filter: Get schedules by room
export const getSchedulesByRoom = async (roomId) => {
  const res = await axios.get(`/schedule/by-room/${roomId}`);
  return res.data;
};
