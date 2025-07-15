// src/components/AuthRedirect.jsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getUserRoles } from "../utils/auth";

const AuthRedirect = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const roles = getUserRoles();

    if (roles.includes("Faculty")) {
      navigate("/faculty/schedule");
    } else if (roles.includes("SuperAdmin") || roles.includes("Dean")) {
      navigate("/dashboard");
    } else {
      navigate("/login");
    }
  }, [navigate]);

  return null; // no UI
};

export default AuthRedirect;
