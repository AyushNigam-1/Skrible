import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../components/panel/Sidebar";
import { useState, useEffect } from "react";
import { ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const HomeLayout = () => {
  const user = localStorage.getItem("user");
  const location = useLocation();

  const [isSidebarOpen, setIsSidebarOpen] = useState(
    typeof window !== "undefined" ? window.innerWidth >= 768 : true,
  );

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  }, [location.pathname]);

  const pathSegments = location.pathname.split("/").filter(Boolean);
  const path = pathSegments[0];

  return (
    <div
      className={`min-h-screen w-full relative ${
        path === "zen" ? "" : user ? "flex" : ""
      }`}
    >
      {user && path !== "zen" && !isSidebarOpen && (
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="fixed top-1/2 left-0 -translate-y-1/2 z-50 py-6 px-1 bg-white/5 hover:bg-white/10 backdrop-blur-xl border border-white/10 border-l-0 text-gray-500 hover:text-white rounded-r-xl shadow-2xl transition-colors duration-200 group"
          title="Open Sidebar"
        >
          <ChevronRight className="w-5 h-5 opacity-50 group-hover:opacity-100 transition-opacity" />
        </button>
      )}

      {/* --- Mobile Overlay Backdrop --- */}
      <AnimatePresence>
        {user && path !== "zen" && isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 bg-[#0A0A12]/60 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* --- Sidebar Wrapper --- */}
      {path !== "zen" && user && (
        <div
          className={`
            fixed inset-y-0 left-0 z-50 md:static md:z-auto
            transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]
            ${isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
          `}
        >
          <Sidebar
            isOpen={isSidebarOpen}
            toggleSidebar={() => setIsSidebarOpen(false)}
          />
        </div>
      )}

      {/* --- Main Content Area --- */}
      <div
        className={`p-4 w-full ${
          path === "zen"
            ? "container mx-auto"
            : user
              ? "flex-1 min-w-0" // min-w-0 prevents layout blowout on small screens
              : "flex flex-col gap-3"
        }`}
      >
        <Outlet context={{ path }} />
      </div>
    </div>
  );
};

export default HomeLayout;
