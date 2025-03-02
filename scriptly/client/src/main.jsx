import * as React from "react";
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
import { ApolloClient, InMemoryCache, ApolloProvider, HttpLink, ApolloLink } from '@apollo/client';
import Script from "./pages/scripts/Script";
import Favourites from "./pages/favourites/Favourites";
import Contributions from "./pages/contributions/Contributions";
import Notifications from "./pages/notification/Notifications";
import Profile from "./pages/profile/Profile";
import MyContributions from "./pages/contributions/MyContributions";
import Para from "./pages/para/Para";
import Add from "./pages/add/Add";
import MyScripts from "./pages/scripts/MyScripts";
import Logout from "./pages/auth/Logout";
import ZenMode from "./components/ZenMode";
import ScriptLayout from "./layout/ScriptLayout";
import Paragraphs from "./components/Paragraphs";
import Requests from "./pages/requests/Requests";
import ScriptDetails from "./components/ScriptDetails";
import Contributors from "./pages/contributors/Contributors";

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
        path: "/profile",
        element: <Profile />
      },
      {
        path: "/my-contributions",
        element: <MyContributions />
      },
      {
        path: "/my-scripts",
        element: <MyScripts />
      },
      {
        path: "/para/:id",
        element: <Para />
      },
      {
        path: "/add",
        element: <Add />
      },

      {
        path: '/',
        element: <ScriptLayout />,
        children: [
          {
            path: "/paragraphs/:id",
            element: <Paragraphs />
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