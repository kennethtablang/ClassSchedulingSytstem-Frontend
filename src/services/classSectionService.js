// src/services/classSectionService.js
import axios from "./axiosInstance";

export const getClassSections = () => axios.get("/classsection");

export const getClassSectionById = (id) => axios.get(`/classsection/${id}`);

export const addClassSection = (data) => axios.post("/classsection", data);

export const updateClassSection = (id, data) => axios.put(`/classsection/${id}`, data);

export const deleteClassSection = (id) => axios.delete(`/classsection/${id}`);

// ✅ NEW: Get assigned subjects and faculty for a class section
export const getSubjectAssignmentsBySectionId = (sectionId) => axios.get(`/classsection/${sectionId}/subject-assignments`);

