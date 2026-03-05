import { Link, useLocation } from "react-router-dom";
import {
  Home,
  Compass,
  User,
  Heart,
  Award,
  PanelRightOpen,
  Settings,
} from "lucide-react";

const Sidebar = () => {
  const location = useLocation();

  const userData = JSON.parse(localStorage.getItem("user"));
  const username = userData?.username || "guest";

  const menuItems = [
    { name: "Explore", icon: Compass, route: "/" },
    { name: "Contributions", icon: Award, route: "/my-contributions" },
    { name: "Favorites", icon: Heart, route: "/favourites" },
    { name: "Profile", icon: User, route: `/profile/${username}` },
    // { name: "Logout", icon: LogOut, route: "/logout", isDanger: true },
  ];

  return (
    <aside className="col-span-1 sticky top-0 flex font-mono flex-col h-screen p-4 bg-white/5 backdrop-blur-2xl border-r border-white/10 transition-all duration-300 ">
      {/* Logo Section */}
      <div className="flex justify-between items-center py-2  mb-4">
        <img
          src="/logo.png"
          alt="Logo"
          className="dark:invert w-24 brightness-110 drop-shadow-sm"
        />
        <button className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/10 transition-all duration-200">
          <PanelRightOpen size={20} />
        </button>
      </div>

      <nav className="flex flex-col gap-2 flex-1 overflow-y-auto no-scrollbar pb-4">
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.route;

          return (
            <Link
              to={item.route}
              key={index}
              className={`
                group flex items-center gap-3 px-3.5 py-2.5 rounded-lg transition-all duration-200 whitespace-nowrap font-semibold tracking-wide outline-none focus-visible:ring-2 focus-visible:ring-white/50
                ${
                  isActive
                    ? "bg-white/10 border border-white/20 text-white shadow-sm"
                    : "text-gray-400 hover:text-white hover:bg-white/5 border border-transparent"
                }
              `}
            >
              <Icon
                className={`w-5 h-5 transition-all duration-200 ${
                  isActive
                    ? "stroke-[2.5px]"
                    : "stroke-2 opacity-70 group-hover:opacity-100 group-hover:scale-110"
                }`}
              />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Section: User Preview */}
      {/* <div className="mt-auto pt-4 border-t border-white/10">
        ...
      </div>*/}
    </aside>
  );
};

export default Sidebar;
