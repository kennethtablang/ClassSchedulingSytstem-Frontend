// src/services/facultyService.js
import axios from "./axiosInstance";

// Get all faculty users
export const getFacultyUsers = () => axios.get("/faculty");

// Get assigned subject-section pairs for a faculty
export const getAssignedSubjectsWithSections = (facultyId, semesterId, schoolYear) => {
  const params = new URLSearchParams();
  if (semesterId) params.append("semesterId", semesterId);
  if (schoolYear) params.append("schoolYear", schoolYear);
  return axios.get(`/faculty/${facultyId}/assigned-subjects?${params.toString()}`);
};

// Assign subjects per section (overwrite existing)
export const assignSubjectsToFacultyPerSection = (facultyId, assignments) =>
  axios.post(`/faculty/assign-subjects-per-section`, {
    facultyId,
    assignments, // Array of { subjectId, classSectionId }
  });

// Unassign subject-section from a faculty
export const unassignSubjectFromSection = (facultyId, subjectId, sectionId) =>
  axios.delete(`/faculty/${facultyId}/subject/${subjectId}/section/${sectionId}`);

// Get all globally assigned subject-section-faculty combinations
export const getAllAssignedSubjects = () => axios.get("/faculty/assigned-subjects");

// Get unassigned subject-section pairs for a faculty
export const getUnassignedSubjectsByFaculty = (facultyId) =>
  axios.get(`/faculty/${facultyId}/unassigned-subjects`);

// Get all subject-section assignments across all faculty (detailed)
export const getDetailedFacultyAssignments = () =>
  axios.get("/faculty/full-assignments");

// Get one faculty’s full assigned subject-section list (with metadata)
export const getFacultyScheduleAssignments = (facultyId) =>
  axios.get(`/faculty/${facultyId}/full-assigned-subjects`);