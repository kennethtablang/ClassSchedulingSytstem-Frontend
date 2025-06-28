// src/services/subjectService.js
import axios from "./axiosInstance";

// === SUBJECT CRUD ===

// Get all active subjects
export const getSubjects = () => axios.get("/subject");

// Get a single subject by ID (optional)
export const getSubjectById = (id) => axios.get(`/subject/${id}`);

// Add a new subject
export const addSubject = (data) => axios.post("/subject", data);

// Update an existing subject
// Fix the update function to receive the full object
export const updateSubject = (subject) => axios.put(`/subject/${subject.id}`, subject);


// Soft delete a subject (sets IsActive = false)
export const deleteSubject = (id) => axios.delete(`/subject/${id}`);
