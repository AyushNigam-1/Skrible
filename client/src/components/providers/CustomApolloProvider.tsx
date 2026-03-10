import React from "react";
import {
  ApolloClient,
  InMemoryCache,
  HttpLink,
  ApolloProvider,
} from "@apollo/client";

const httpLink = new HttpLink({
  // uri: `http://${window.location.hostname}:4000/graphql`,
  uri: "https://internet-subscription-exotic-tax.trycloudflare.com/graphql",
  credentials: "include",
});

const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
});

export const CustomApolloProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return <ApolloProvider client={client}>{children}</ApolloProvider>;
};
