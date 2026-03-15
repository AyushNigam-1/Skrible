import { Link, useLocation } from "react-router-dom";
import {
  Compass,
  User,
  Heart,
  Award,
  LogOut,
  LucideIcon,
  ChevronLeft,
} from "lucide-react";
import { useUserStore } from "../../store/useAuthStore";
import { authClient } from "../../lib/authClient";

interface MenuItem {
  name: string;
  icon: LucideIcon;
  route: string;
}

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

const Sidebar = ({ isOpen, toggleSidebar }: SidebarProps) => {
  const location = useLocation();

  const { user } = useUserStore();
  const userId = user?.id || "guest";

  const menuItems: MenuItem[] = [
    { name: "Explore", icon: Compass, route: "/explore" },
    { name: "Contributions", icon: Award, route: "/contributions" },
    { name: "Favorites", icon: Heart, route: "/favourites" },
    { name: "Profile", icon: User, route: `/profile/${userId}` },
  ];

  return (
    <aside
      className={`sticky top-4 h-[calc(100vh-2rem)] transition-all duration-300 ease-in-out shrink-0 overflow-hidden ${isOpen
        ? "w-72 ml-4 my-4 opacity-100 visible"
        : "w-0 m-0 opacity-0 invisible"
        }`}
    >
      <div className="w-full h-full space-y-10 bg-[#161620] border border-white/10 rounded-2xl flex flex-col font-mono p-4 lg:p-5">
        <div className="flex justify-between items-center shrink-0">
          <img
            src="/logo.png"
            alt="Logo"
            className="w-28 lg:w-32 brightness-110 drop-shadow-sm"
          />
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-full text-gray-500 hover:text-white hover:bg-white/10 transition-all duration-200"
            title="Close Sidebar"
          >
            <ChevronLeft size={20} />
          </button>
        </div>

        <nav className="flex flex-col gap-5 flex-1 overflow-y-auto scrollbar-none pb-4">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.route;

            return (
              <Link
                to={item.route}
                key={index}
                className={`
                  group flex items-center gap-3 py-1 transition-all duration-300 outline-none relative overflow-hidden
                  ${isActive
                    ? "font-bold text-white pl-3"
                    : "text-gray-400 hover:text-white pl-0"
                  }
                `}
              >
                <div
                  className={`absolute left-0 top-0 bottom-0 w-[2px] bg-gray-100 transition-transform duration-300 ease-out origin-center ${isActive ? "scale-y-100" : "scale-y-0"
                    }`}
                />

                <Icon
                  className={`w-5 h-5 shrink-0 transition-all duration-300 ${isActive
                    ? "stroke-[2.5px] scale-110 ml-1"
                    : "stroke-2 opacity-70 group-hover:opacity-100 group-hover:scale-110"
                    }`}
                />
                <span className="text-lg font-medium whitespace-nowrap overflow-hidden text-ellipsis">
                  {item.name}
                </span>
              </Link>
            );
          })}
        </nav>

        <button
          onClick={async () => {
            await authClient.signOut({
              fetchOptions: {
                onSuccess: () => {
                  localStorage.removeItem("user");
                  window.location.href = "/login";
                },
              },
            });
          }}
          className="group flex w-full items-center gap-3 px-3 py-3 rounded-xl text-red-400/80 hover:text-red-400 hover:bg-red-500/10 transition-all duration-300 outline-none border-none bg-transparent cursor-pointer"
        >
          <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform shrink-0" />
          <span className="font-bold font-mono text-base tracking-widest whitespace-nowrap">
            Logout
          </span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
