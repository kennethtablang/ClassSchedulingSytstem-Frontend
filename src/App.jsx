// src/App.jsx
import { useEffect } from "react";
import AppRoutes from "./routes/AppRoutes";
import { Toaster } from "sonner";

const App = () => {
  // Initialize theme on app mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    document.documentElement.setAttribute("data-theme", savedTheme);
  }, []);

  return (
    <>
      <AppRoutes />

      {/* Global toast provider */}
      <Toaster position="bottom-right" richColors closeButton duration={3000} />
    </>
  );
};

export default App;
