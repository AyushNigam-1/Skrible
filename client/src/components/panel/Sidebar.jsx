import { Link, useLocation } from "react-router-dom";
import {
  Compass,
  User,
  Heart,
  Award,
  PanelRightOpen,
  LogOut,
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
  ];

  return (
    // Removed overflow-x-hidden and added w-full to fill the grid column naturally
    <aside className="col-span-1 sticky top-4 flex font-mono flex-col h-[calc(100vh-2rem)] m-4 p-4 lg:p-5 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-2xl transition-all duration-300 w-full">
      <div className="flex justify-between items-center mb-8 px-1 shrink-0">
        <img
          src="/logo.png"
          alt="Logo"
          className="dark:invert w-20 lg:w-24 brightness-110 drop-shadow-sm"
        />
        <button className="p-2 rounded-xl text-gray-500 hover:text-white hover:bg-white/10 transition-all duration-200">
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
                group flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-300 outline-none relative overflow-hidden
                ${
                  isActive
                    ? "bg-white/10 border border-white/20 text-white shadow-lg"
                    : "text-gray-400 hover:text-white hover:bg-white/5 border border-transparent"
                }
              `}
            >
              <Icon
                className={`w-5 h-5 shrink-0 transition-all duration-300 ${
                  isActive
                    ? "stroke-[2.5px] scale-110 ml-1"
                    : "stroke-2 opacity-70 group-hover:opacity-100 group-hover:scale-110"
                }`}
              />

              {/* Reduced text size to text-xs and tracking to widest to ensure fit */}
              <span className="text-sm font-bold uppercase tracking-widest whitespace-nowrap overflow-hidden text-ellipsis">
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto pt-4 border-t border-white/10 shrink-0">
        <button className="group flex w-full items-center gap-3 px-3 py-3 rounded-xl text-red-400/80 hover:text-red-400 hover:bg-red-500/10 transition-all duration-300 outline-none">
          <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform shrink-0" />
          <span className="font-bold font-mono text-[11px] uppercase tracking-widest">
            Sign Out
          </span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
