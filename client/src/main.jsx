import { createRoot } from "react-dom/client";
import './index.css'
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import Login from "./pages/auth/Login";
import Home from "./pages/home/Home";
import HomeLayout from "./layout/HomeLayout";
import CreateAccount from "./pages/auth/CreateAccount";
import AuthLayout from "./layout/AuthLayout";
import { ApolloClient, InMemoryCache, ApolloProvider, HttpLink } from '@apollo/client';
import Script from "./pages/scripts/Script";
import Favourites from "./pages/favourites/Favourites";
import Contributions from "./pages/contributions/Contributions";
import Notifications from "./pages/notification/Notifications";
import Profile from "./pages/profile/Profile";
import MyContributions from "./pages/contributions/MyContributions";
import Add from "./components/Add";
import Logout from "./pages/auth/Logout";
import ZenMode from "./components/ZenMode";
import Timeline from "./components/Timeline";
import Requests from "./pages/requests/Requests";
import ScriptDetails from "./components/ScriptDetails";
import Contributors from "./pages/contributors/Contributors";
import Explore from "./pages/explore/Explore";
import DraftLayout from "./layout/DraftLayout";
import Contribution from "./pages/contribution/Contribution";
import DraftSettings from "./pages/settings/DraftSetting";
import '@fontsource/inter'; // Defaults to weight 400
import '@fontsource/lora';
import "@fontsource/crimson-pro"
import '@fontsource/playfair-display/700.css';
const httpLink = new HttpLink({
  uri: "http://localhost:4000/graphql",
  credentials: 'include'
});

const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
});

const router = createBrowserRouter([
  {
    path: '/',
    element: <HomeLayout />,
    children: [
      {
        path: "/",
        element: <Home />
      },
      {
        path: "/script/:id",
        element: <Script />
      },
      {
        path: "/favourites",
        element: <Favourites />
      },
      {
        path: "/contributions",
        element: <Contributions />
      },
      {
        path: "/notifications",
        element: <Notifications />
      },
      {
        path: "/profile/:username",
        element: <Profile />
      },
      {
        path: "/my-contributions",
        element: <MyContributions />
      },
      {
        path: "/explore",
        element: <Explore />
      },
      {
        path: "/contribution/:id",
        element: <Contribution />
      },
      {
        path: "/add",
        element: <Add />
      },

      {
        path: '/',
        element: <DraftLayout
        />,
        children: [
          {
            path: "/timeline/:id",
            element: <Timeline />
          },
          {
            path: "/requests/:id",
            element: <Requests />
          },
          {
            path: "/contributors/:id",
            element: <Contributors />
          },
          {
            path: "/about/:id",
            element: <ScriptDetails />
          },
          {
            path: "/zen/:id",
            element: <ZenMode />
          },
          {
            path: "/settings/:id",
            element: <DraftSettings />
          }
        ]
      },
    ]
  },

  {
    path: '/',
    element: <AuthLayout />,
    children: [
      {
        path: "/login",
        element: <Login />
      },
      {
        path: "/create-account",
        element: <CreateAccount />
      },
      {
        path: "/logout",
        element: <Logout />
      },
    ]
  },

]);

createRoot(document.getElementById("root")).render(

  <ApolloProvider client={client}>
    <RouterProvider router={router} />
  </ApolloProvider>

);