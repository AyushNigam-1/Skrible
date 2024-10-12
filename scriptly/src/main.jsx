import * as React from "react";
import { createRoot } from "react-dom/client";
import './index.css'
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./state/store";
import Login from "./pages/auth/Login";
import Home from "./pages/home/Home";
import HomeLayout from "./layout/HomeLayout";
import CreateAccount from "./pages/auth/CreateAccount";
import AuthLayout from "./layout/AuthLayout";
import { ApolloClient, InMemoryCache, ApolloProvider, gql } from '@apollo/client';
import Script from "./pages/scripts/Script";
import Wishlist from "./pages/wishlist/Wishlist";
const client = new ApolloClient({
  uri: "http://localhost:3000/graphql",
  cache: new InMemoryCache()
})
const query = `
query GetTodos {
getTodos{
title
completed
user {
name
}
}
}
`
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
        path: "/wishlist",
        element: <Wishlist />
      }
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
    ]
  },
]);

createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <ApolloProvider client={client}>
      <RouterProvider router={router} />
    </ApolloProvider>
  </Provider>
);