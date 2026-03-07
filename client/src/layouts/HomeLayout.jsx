import Navbar from "../components/layout/Navbar";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../components/panel/Sidebar";

const HomeLayout = () => {
  const user = localStorage.getItem("user");
  const location = useLocation();

  const pathSegments = location.pathname.split("/").filter(Boolean);
  const path = pathSegments[0];

  return (
    <div
      className={`h-screen w-full overflow-y-auto ${path === "zen" ? "" : user ? "grid grid-cols-6" : ""}`}
    >
      {path !== "zen" && user && <Sidebar />}

      <div
        className={`p-4 ${path === "zen" ? "container mx-auto w-full" : user ? "col-span-5" : "flex flex-col gap-3"}`}
      >
        {path !== "zen" && !user && <Navbar />}
        <Outlet context={{ path }} />
      </div>
    </div>
  );
};

export default HomeLayout;
