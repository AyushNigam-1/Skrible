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
    { name: "Explore", icon: Compass, route: "/explore" },
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
      <nav className="flex flex-col gap-1.5 flex-1 overflow-y-auto no-scrollbar pb-4">
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.route;

          return (
            <Link
              to={item.route}
              key={index}
              className={`
                  group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300
                  text-lg font-medium tracking-wide outline-none focus-visible:ring-2 focus-visible:ring-blue-500
                  ${
                    isActive
                      ? "bg-white/5 text-white"
                      : item.isDanger
                        ? "text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        : "text-gray-400 hover:text-gray-100 hover:bg-white/5"
                  }
              `}
            >
              <Icon
                className={`size-5 transition-transform duration-300 ${
                  isActive ? "stroke-[2.5px]" : "stroke-2 group-hover:scale-110"
                }`}
              />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Section: User Preview */}
      {/* <div className="mt-auto pt-4 border-t border-white/10">
        <Link
          to={`/profile/${username}`}
          className="group flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 rounded-2xl transition-all duration-300 cursor-pointer"
        >
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold shadow-inner ring-2 ring-transparent group-hover:ring-blue-500/50 transition-all">
            {username.charAt(0).toUpperCase()}
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="text-sm font-bold text-gray-100 truncate group-hover:text-white transition-colors">
              @{username}
            </span>
            <span className="text-[10px] text-blue-400 font-bold uppercase tracking-wider">
              Pro Member
            </span>
          </div>
        </Link>
      </div>*/}
    </aside>
  );
};

export default Sidebar;
