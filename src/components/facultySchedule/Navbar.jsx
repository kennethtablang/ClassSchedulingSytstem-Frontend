// src/components/facultySchedule/Navbar.jsx
import { FaBars, FaUserCircle } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { logoutUser } from "../../services/authService";
import ThemeToggle from "../common/ThemeToggle";

const FacultyNavbar = ({ toggleSidebar }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutUser();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-30 bg-white dark:bg-gray-800 shadow-md px-6 py-4 flex justify-between items-center transition-colors duration-200">
      {/* Left: Sidebar toggle + title */}
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="btn btn-ghost btn-sm md:hidden"
          aria-label="Toggle Sidebar"
        >
          <FaBars className="text-xl" />
        </button>
        <h2 className="text-lg font-semibold text-primary">Faculty Panel</h2>
      </div>

      {/* Right: Theme Toggle + User Dropdown */}
      <div className="flex items-center gap-2">
        {/* Theme Toggle */}
        <ThemeToggle />

        {/* User Dropdown */}
        <div className="dropdown dropdown-end">
          <label tabIndex={0} className="btn btn-ghost btn-sm avatar">
            <div className="w-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
              <FaUserCircle className="text-xl text-gray-600 dark:text-gray-300" />
            </div>
          </label>
          <ul
            tabIndex={0}
            className="mt-3 p-2 shadow menu menu-sm dropdown-content bg-base-100 dark:bg-gray-700 rounded-box w-48"
          >
            <li>
              <Link
                to="/faculty/profile"
                className="dark:text-gray-200 dark:hover:bg-gray-600"
              >
                My Profile
              </Link>
            </li>
            <li>
              <button
                onClick={handleLogout}
                className="text-error dark:text-red-400 text-left w-full dark:hover:bg-gray-600"
              >
                Logout
              </button>
            </li>
          </ul>
        </div>
      </div>
    </header>
  );
};

export default FacultyNavbar;
