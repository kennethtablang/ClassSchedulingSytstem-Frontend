// src/components/common/ThemeToggle.jsx
import { useEffect, useState } from "react";
import { FaSun, FaMoon } from "react-icons/fa";

const ThemeToggle = () => {
  const [theme, setTheme] = useState(() => {
    // Initialize from localStorage or default to light
    return localStorage.getItem("theme") || "light";
  });

  useEffect(() => {
    // Apply theme to html element
    const html = document.documentElement;
    html.setAttribute("data-theme", theme);

    // Store preference
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  return (
    <button
      onClick={toggleTheme}
      className="btn btn-ghost btn-circle swap swap-rotate"
      aria-label="Toggle theme"
      title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
    >
      {/* Sun icon for light mode */}
      <FaSun
        className={`text-xl transition-opacity ${
          theme === "light" ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Moon icon for dark mode */}
      <FaMoon
        className={`text-xl transition-opacity absolute ${
          theme === "dark" ? "opacity-100" : "opacity-0"
        }`}
      />
    </button>
  );
};

export default ThemeToggle;
