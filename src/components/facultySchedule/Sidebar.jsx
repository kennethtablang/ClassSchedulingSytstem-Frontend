// src/components/facultySchedule/Sidebar.jsx
import { Link, useLocation } from "react-router-dom";
import { FaCalendarAlt, FaDoorOpen, FaBook } from "react-icons/fa";
import pcnlLogo from "../../assets/sti.png";

const Sidebar = ({ isOpen }) => {
  const location = useLocation();

  const isActive = (path) =>
    location.pathname === path
      ? "bg-primary/10 text-primary font-semibold"
      : "text-gray-700 hover:bg-gray-100";

  const navItemClass =
    "flex items-center gap-3 px-4 py-2 rounded-lg transition duration-200";

  const sections = [
    {
      label: "My Schedule",
      links: [
        {
          to: "/faculty/schedule",
          icon: <FaCalendarAlt />,
          label: "Schedule",
        },
        {
          to: "/faculty/available-rooms",
          icon: <FaDoorOpen />,
          label: "Available Rooms",
        },
        {
          to: "/faculty/assigned-subjects",
          icon: <FaBook />,
          label: "Assigned Subjects",
        },
      ],
    },
  ];

  return (
    <aside
      className={`
        fixed top-0 left-0 h-screen w-64 z-50 bg-white border-r
        transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0 md:static
      `}
    >
      <div className="flex flex-col h-full overflow-y-auto px-6 py-8">
        {/* Logo / Brand */}
        <div className="mb-3 shrink-0 flex items-center gap-2">
          <h1 className="text-2xl font-extrabold text-primary tracking-tight">
            STI Alaminos Scheduler
          </h1>
          <img src={pcnlLogo} alt="PCNL" className="h-12 w-auto" />
        </div>
        <p className="text-xs text-gray-500 mt-[-0.5rem] mb-5">Faculty Panel</p>

        {/* Navigation */}
        <nav className="flex flex-col gap-2 flex-1">
          {sections.map((section) => (
            <div key={section.label}>
              <span className="text-xs text-gray-500 uppercase mt-4 mb-1 px-2">
                {section.label}
              </span>
              {section.links.map(({ to, icon, label }) => (
                <Link
                  key={to}
                  to={to}
                  className={`${navItemClass} ${isActive(to)}`}
                >
                  {icon} {label}
                </Link>
              ))}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="shrink-0 pt-6 text-center text-xs text-gray-400">
          © {new Date().getFullYear()} STI Alaminos Scheduler
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
