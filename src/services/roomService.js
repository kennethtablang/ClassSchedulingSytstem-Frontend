import axios from "./axiosInstance";

// === ROOM CRUD ===

// Get all rooms
export const getRooms = () => axios.get("/room");

// Get single room by ID (optional, if needed)
export const getRoomById = (id) => axios.get(`/room/${id}`);

// Add new room
export const addRoom = (data) => axios.post("/room", data);

// Update existing room
export const updateRoom = (id, data) => axios.put(`/room/${id}`, data);

// Delete a room
export const deleteRoom = (id) => axios.delete(`/room/${id}`);
