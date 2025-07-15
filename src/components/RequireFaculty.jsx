// src/components/RequireFaculty.jsx
import { Navigate } from "react-router-dom";
import { getUserRoles } from "../utils/auth";

const RequireFaculty = ({ children }) => {
  const roles = getUserRoles();
  if (!roles.includes("Faculty")) return <Navigate to="/login" />;
  return children;
};

export default RequireFaculty;
