import React from "react";
import {
  ApolloClient,
  InMemoryCache,
  HttpLink,
  ApolloProvider,
  from,
} from "@apollo/client";
import { onError } from "@apollo/client/link/error";
import { setContext } from "@apollo/client/link/context";
import { authClient } from "../lib/authClient";

const uri = import.meta.env.VITE_GRAPHQL_URL;

const httpLink = new HttpLink({
  uri: `${uri}/graphql`,
});

const authLink = setContext(async (_, { headers }) => {
  try {
    const { data } = await authClient.getSession();
    const token = data?.session?.token;

    return {
      headers: {
        ...headers,
        authorization: token ? `Bearer ${token}` : "",
      },
    };
  } catch (error) {
    return { headers };
  }
});

const errorLink = onError(({ graphQLErrors, networkError }) => {
  let isUnauthenticated = false;

  if (graphQLErrors) {
    for (let err of graphQLErrors) {
      const code = err.extensions?.code;
      const msg = err.message.toLowerCase();
      if (
        code === "UNAUTHENTICATED" ||
        msg.includes("not authenticated") ||
        msg.includes("auth required")
      ) {
        isUnauthenticated = true;
      }
    }
  }

  if (
    networkError &&
    "statusCode" in networkError &&
    networkError.statusCode === 401
  ) {
    isUnauthenticated = true;
  }

  if (isUnauthenticated) {
    console.error("⚠️ Session expired or invalid. Logging out.");
    localStorage.removeItem("user");
    window.location.href = "/login";
  }
});

const client = new ApolloClient({
  link: from([errorLink, authLink, httpLink]),
  cache: new InMemoryCache({}),
});

export const CustomApolloProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return <ApolloProvider client={client}>{children}</ApolloProvider>;
};