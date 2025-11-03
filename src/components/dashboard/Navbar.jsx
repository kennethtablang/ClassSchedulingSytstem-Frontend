// src/components/dashboard/Navbar.jsx
import { FaBars, FaUserCircle } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { logoutUser } from "../../services/authService";
import ThemeToggle from "../common/ThemeToggle";

const Navbar = ({ toggleSidebar }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutUser();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-30 bg-base-100 shadow-md px-6 py-4 flex justify-between items-center border-b border-base-300">
      {/* Left section: Hamburger + Title */}
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="btn btn-ghost btn-sm md:hidden"
          aria-label="Toggle Sidebar"
        >
          <FaBars className="text-xl" />
        </button>
        <h2 className="text-lg font-semibold text-primary">Dashboard</h2>
      </div>

      {/* Right section: Theme Toggle + Profile */}
      <div className="flex items-center gap-2">
        {/* Theme Toggle */}
        <ThemeToggle />

        {/* User dropdown */}
        <div className="dropdown dropdown-end">
          <label tabIndex={0} className="btn btn-ghost btn-sm avatar">
            <div className="w-8 rounded-full bg-base-200 flex items-center justify-center">
              <FaUserCircle className="text-xl text-base-content" />
            </div>
          </label>
          <ul
            tabIndex={0}
            className="mt-3 p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-48 border border-base-300"
          >
            <li>
              <Link to="/dashboard/profile">My Profile</Link>
            </li>
            <li>
              <button
                onClick={handleLogout}
                className="text-error text-left w-full"
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

export default Navbar;
