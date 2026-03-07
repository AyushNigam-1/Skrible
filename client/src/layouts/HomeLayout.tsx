import Navbar from "../components/layout/Navbar";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../components/panel/Sidebar";
import { useState } from "react";
import { PanelLeftOpen } from "lucide-react";

const HomeLayout = () => {
  const user = localStorage.getItem("user");
  const location = useLocation();

  // State to manage sidebar open/close
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const pathSegments = location.pathname.split("/").filter(Boolean);
  const path = pathSegments[0];

  return (
    <div
      className={`h-screen w-full overflow-y-auto relative ${
        path === "zen" ? "" : user ? "flex" : ""
      }`}
    >
      {/* --- Floating Button to Reopen Sidebar --- */}
      {user && path !== "zen" && !isSidebarOpen && (
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="fixed top-1/2 left-0 -translate-y-1/2 z-50 py-8 px-1.5 bg-white/5 hover:bg-white/10 backdrop-blur-xl border border-white/10 border-l-0 text-gray-500 hover:text-white rounded-r-xl shadow-2xl transition-colors duration-200 group"
          title="Open Sidebar"
        >
          <PanelLeftOpen className="w-5 h-5 opacity-50 group-hover:opacity-100 transition-opacity" />
        </button>
      )}

      {/* --- Sidebar --- */}
      {path !== "zen" && user && (
        <Sidebar
          isOpen={isSidebarOpen}
          toggleSidebar={() => setIsSidebarOpen(false)}
        />
      )}

      {/* --- Main Content Area --- */}
      <div
        className={`p-4 transition-all duration-300 ease-in-out w-full ${
          path === "zen"
            ? "container mx-auto"
            : user
              ? "flex-1 min-w-0" // flex-1 allows it to dynamically take over the space left by the hidden sidebar
              : "flex flex-col gap-3"
        }`}
      >
        {path !== "zen" && !user && <Navbar />}
        <Outlet context={{ path }} />
      </div>
    </div>
  );
};

export default HomeLayout;
