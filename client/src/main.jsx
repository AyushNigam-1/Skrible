import { createRoot } from "react-dom/client";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Login from "./pages/auth/Login";
import CreateAccount from "./pages/auth/CreateAccount";
import AuthLayout from "./layouts/AuthLayout";
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  HttpLink,
} from "@apollo/client";
import Script from "./pages/scripts/Script";
import Favourites from "./pages/favourites/Favourites";
import Notifications from "./pages/notification/Notifications";
import Logout from "./pages/auth/Logout";
import Requests from "./pages/requests/Requests";
import Contribution from "./pages/contribution/Contribution";
import Profile from "./pages/profile/Profile";
import DraftLayout from "./layouts/DraftLayout";
import Explore from "./pages/explore/Explore";
import Timeline from "./pages/timeline/Timeline";
import ScriptDetails from "./pages/about/ScriptDetails";
import Contributors from "./pages/contributors/Contributors";
import DraftSettings from "./pages/setting/DraftSettings";
import Contributions from "./pages/contributions/Contributions";
import MyContributions from "./pages/contributions/MyContributions";
import HomeLayout from "./layouts/HomeLayout";
import ZenMode from "./pages/zen/ZenMode";

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
          { path: "/settings/:id", element: <DraftSettings /> },
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
    <div className="relative z-0 flex flex-col min-h-screen bg-[#0A0A14]">
      <RouterProvider router={router} />
    </div>
  </ApolloProvider>,
);
