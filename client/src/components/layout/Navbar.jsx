import React from "react";
import { Link } from "react-router-dom";
import {
  LogIn,
  UserPlus,
  User,
  FileText,
  Award,
  LogOut,
  LayoutDashboard,
} from "lucide-react";
// import Dropdown from './Dropdown';

const Navbar = () => {
  // Safely parse user from localStorage
  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;

  // Logged-out navigation options
  const authOptions = [
    { name: "Login", icon: LogIn, route: "/login" },
    { name: "Signup", icon: UserPlus, route: "/create-account" },
  ];

  // Logged-in dropdown options (Prepared for your Dropdown component)
  const userOptions = [
    { name: "My Profile", icon: User, route: "/profile" },
    { name: "My Scripts", icon: FileText, route: "/my-scripts" },
    { name: "My Contributions", icon: Award, route: "/my-contributions" },
    { name: "Logout", icon: LogOut, route: "/logout", isDanger: true },
  ];

  return (
    <header className="bg-gray-100/80 dark:bg-gray-900/80 backdrop-blur-md w-full rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm transition-colors duration-300">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        {/* Logo Section */}
        <Link to="/" className="flex-shrink-0">
          <img
            src="/logo.png"
            className="w-[120px] md:w-[140px] dark:invert transition-all"
            alt="Logo"
          />
        </Link>

        {/* Navigation Actions */}
        <div className="flex items-center gap-3">
          {!user ? (
            /* Logged Out State: Show Login & Signup */
            authOptions.map((option, index) => {
              const Icon = option.icon;
              return (
                <Link
                  key={index}
                  to={option.route}
                  className={`flex items-center gap-2 py-2.5 px-4 rounded-lg font-medium text-sm md:text-base shadow-sm transition-all duration-200
                                        ${
                                          option.name === "Signup"
                                            ? "bg-blue-600 hover:bg-blue-700 text-white border border-transparent"
                                            : "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                                        }
                                    `}
                >
                  <Icon className="w-4 h-4 md:w-5 md:h-5" />
                  {option.name}
                </Link>
              );
            })
          ) : (
            /* Logged In State: Show Dashboard link (or plug in Dropdown here) */
            <div className="flex items-center gap-4">
              <Link
                to="/explore"
                className="flex items-center gap-2 py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all duration-200 font-medium text-sm md:text-base"
              >
                <LayoutDashboard className="w-4 h-4 md:w-5 md:h-5" />
                <span className="hidden sm:inline">Dashboard</span>
              </Link>

              {/* Example of how to use your Dropdown component: */}
              {/* <Dropdown options={userOptions} /> */}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
