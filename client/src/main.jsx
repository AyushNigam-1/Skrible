import { createRoot } from "react-dom/client";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Login from "./pages/auth/Login";
import HomeLayout from "./layout/HomeLayout";
import CreateAccount from "./pages/auth/CreateAccount";
import AuthLayout from "./layout/AuthLayout";
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  HttpLink,
} from "@apollo/client";
import Script from "./pages/scripts/Script";
import Favourites from "./pages/favourites/Favourites";
import Contributions from "./pages/contributions/Contributions";
import Notifications from "./pages/notification/Notifications";
import Profile from "./pages/profile/Profile";
import MyContributions from "./pages/contributions/MyContributions";
import Logout from "./pages/auth/Logout";
import ZenMode from "./components/ZenMode";
import Timeline from "./components/Timeline";
import Requests from "./pages/requests/Requests";
import ScriptDetails from "./components/ScriptDetails";
import Contributors from "./pages/contributors/Contributors";
import Explore from "./pages/explore/Explore";
import DraftLayout from "./layout/DraftLayout";
import Contribution from "./pages/contribution/Contribution";

const httpLink = new HttpLink({
  uri: "http://localhost:4000/graphql",
  credentials: "include",
});

const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
});

const router = createBrowserRouter([
  {
    path: "/",
    element: <HomeLayout />,
    children: [
      { path: "/", element: <Explore /> },
      { path: "/script/:id", element: <Script /> },
      { path: "/favourites", element: <Favourites /> },
      { path: "/contributions", element: <Contributions /> },
      { path: "/notifications", element: <Notifications /> },
      { path: "/profile/:username", element: <Profile /> },
      { path: "/my-contributions", element: <MyContributions /> },
      { path: "/contribution/:id", element: <Contribution /> },

      {
        path: "/",
        element: <DraftLayout />,
        children: [
          { path: "/timeline/:id", element: <Timeline /> },
          { path: "/requests/:id", element: <Requests /> },
          { path: "/contributors/:id", element: <Contributors /> },
          { path: "/about/:id", element: <ScriptDetails /> },
          { path: "/zen/:id", element: <ZenMode /> },
        ],
      },
    ],
  },

  {
    path: "/",
    element: <AuthLayout />,
    children: [
      { path: "/login", element: <Login /> },
      { path: "/create-account", element: <CreateAccount /> },
      { path: "/logout", element: <Logout /> },
    ],
  },
]);

createRoot(document.getElementById("root")).render(
  <ApolloProvider client={client}>
    {/* GLOBAL WRAPPER: Handles Fonts & Full Screen constraints */}
    <div className="relative min-h-screen w-full font-['Inter'] text-gray-900 dark:text-gray-100">
      {/* GLOBAL BACKGROUND: Fixed so it never scrolls, sits behind everything */}
      <div
        className="fixed inset-0 z-[-2] bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/46-starry-night-soft-gradient.jpg')" }}
      />

      {/* GLOBAL OVERLAY (Optional): Ensures text remains readable over the image */}
      <div className="fixed inset-0 z-[-1] bg-white/60 dark:bg-gray-950/70 backdrop-blur-[2px]" />

      {/* THE ACTUAL APP */}
      <div className="relative z-0 flex flex-col min-h-screen">
        <RouterProvider router={router} />
      </div>
    </div>
  </ApolloProvider>,
);
