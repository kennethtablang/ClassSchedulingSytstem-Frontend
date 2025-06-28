// src/services/classSectionService.js
import axios from "./axiosInstance";

export const getClassSections = () => axios.get("/classsection");

export const getClassSectionById = (id) => axios.get(`/classsection/${id}`);

export const addClassSection = (data) => axios.post("/classsection", data);

export const updateClassSection = (id, data) => axios.put(`/classsection/${id}`, data);

export const deleteClassSection = (id) => axios.delete(`/classsection/${id}`);
