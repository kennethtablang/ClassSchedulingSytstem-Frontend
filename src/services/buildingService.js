import axios from "./axiosInstance";

// === BUILDING CRUD ===

// Get all buildings
export const getBuildings = () => axios.get("/building");

// Add a new building
export const addBuilding = (data) => axios.post("/building", data);

// Update existing building
export const updateBuilding = (id, data) =>
  axios.put(`/building/${id}`, data);

// Delete building
export const deleteBuilding = (id) => axios.delete(`/building/${id}`);
