import { createRoot } from "react-dom/client";
import "./index.css";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import Login from "./pages/auth/Login";
import AuthLayout from "./layouts/AuthLayout";
import Favourites from "./pages/favourites/Favourites";
import Notifications from "./pages/notification/Notifications";
import Requests from "./pages/requests/Requests";
import Contribution from "./pages/contribution/Contribution";
import Profile from "./pages/profile/Profile";
import DraftLayout from "./layouts/DraftLayout";
import Explore from "./pages/explore/Explore";
import Timeline from "./pages/timeline/Timeline";
import ScriptDetails from "./pages/about/ScriptDetails";
import Contributors from "./pages/contributors/Contributors";
import DraftSettings from "./pages/setting/DraftSettings";
import MyContributions from "./pages/contributions/Contributions";
import HomeLayout from "./layouts/HomeLayout";
import ZenMode from "./pages/zen/ZenMode";
import { UserProvider } from "./components/providers/UserProvider";
import { CustomApolloProvider } from "./components/providers/CustomApolloProvider";
import RequestsPreview from "./pages/requests/RequestsPreview";
import { registerSW } from "virtual:pwa-register";
import Contributions from "./pages/contributions/Contributions";
import CreateAccount from "./pages/auth/CreateAccount";
import Logout from "./pages/auth/Logout";

// --- NEW: Public Route Guard ---
// This checks if the user is already logged in.
// If they are, it bounces them away from the auth pages and sends them to /explore.
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const user = localStorage.getItem("user");
  if (user) {
    return <Navigate to="/explore" replace />;
  }
  return <>{children}</>;
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <HomeLayout />,
    children: [
      // Redirect base URL to login (which will then redirect to explore if logged in)
      { index: true, element: <Navigate to="/login" replace /> },

      { path: "/explore", element: <Explore /> },
      { path: "/favourites", element: <Favourites /> },
      // { path: "/contributions", element: <Contributions /> },
      // { path: "/notifications", element: <Notifications /> },
      { path: "/profile/:id", element: <Profile /> },
      { path: "/contributions", element: <Contributions /> },
      { path: "/contribution/:id", element: <Contribution /> },
      { path: "/zen/:id", element: <ZenMode /> },
      { path: "/preview/:id/:paragraphId", element: <RequestsPreview /> },
      {
        path: "/",
        element: <DraftLayout />,
        children: [
          { path: "/timeline/:id", element: <Timeline /> },
          { path: "/requests/:id", element: <Requests /> },
          { path: "/contributors/:id", element: <Contributors /> },
          { path: "/about/:id", element: <ScriptDetails /> },
          { path: "/settings/:id", element: <DraftSettings /> },
        ],
      },
    ],
  },

  {
    path: "/",
    // 🚨 Wrap the AuthLayout with our new PublicRoute guard
    element: (
      <PublicRoute>
        <AuthLayout />
      </PublicRoute>
    ),
    children: [
      { path: "/login", element: <Login /> },
      { path: "/create-account", element: <CreateAccount /> },
    ],
  },
  {
    path: "/logout",
    element: <Logout />,
  },
]);

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Failed to find the root element");

// Register the service worker to auto-update
registerSW({ immediate: true });

createRoot(rootElement).render(
  <CustomApolloProvider>
    <UserProvider>
      <div className="relative z-0 flex flex-col min-h-screen bg-[#0A0A14]">
        <RouterProvider router={router} />
      </div>
    </UserProvider>
  </CustomApolloProvider>,
);
