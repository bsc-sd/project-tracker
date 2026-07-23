
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  HiOutlineFolder,
  HiOutlineGlobe,
  HiOutlineUser,
  HiOutlineTag,
  HiOutlineCurrencyDollar,
  HiOutlineClipboardList,
  HiOutlineLogout,
} from "react-icons/hi";

const navItems = [
  { path: "/projects", label: "Projects", icon: HiOutlineFolder },
  { path: "/domains", label: "Domains", icon: HiOutlineGlobe },
  { path: "/tech-leads", label: "Tech Leads", icon: HiOutlineUser },
  { path: "/statuses", label: "Statuses", icon: HiOutlineTag },
  { path: "/commercials", label: "Commercials", icon: HiOutlineCurrencyDollar },
  { path: "/project-updates", label: "Project Updates", icon: HiOutlineClipboardList },
];

const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside className="w-64 bg-gray-900 text-white flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-700">
        <h1 className="text-xl font-bold text-primary-400">Project Tracker</h1>
        <p className="text-sm text-gray-400 mt-1">{user?.username}</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors duration-200 ${
                isActive
                  ? "bg-primary-600 text-white"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            <span className="text-sm font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-700">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-2.5 w-full rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-colors duration-200"
        >
          <HiOutlineLogout className="w-5 h-5" />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;

