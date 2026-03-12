import React from "react";
import {
  ApolloClient,
  InMemoryCache,
  HttpLink,
  ApolloProvider,
  from,
  Observable,
} from "@apollo/client";
import { onError } from "@apollo/client/link/error";

const uri = `http://${window.location.hostname}:4000/graphql`;

const httpLink = new HttpLink({
  uri,
  credentials: "include",
});

let isRefreshing = false;
let pendingRequests: (() => void)[] = [];

const resolvePendingRequests = () => {
  pendingRequests.forEach((callback) => callback());
  pendingRequests = [];
};

const errorLink = onError(
  ({ graphQLErrors, networkError, operation, forward }) => {
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
      console.log("⚠️ Token expired or missing. Initiating silent refresh...");

      return new Observable((observer) => {
        if (!isRefreshing) {
          isRefreshing = true;

          fetch(uri, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
              query: `mutation { refreshToken { token } }`,
            }),
          })
            .then((res) => res.json())
            .then((res) => {
              if (res.errors) {
                console.error(
                  "❌ Refresh failed (Token dead/Replay attack). Logging out.",
                );
                localStorage.removeItem("user");
                window.location.href = "/login";
                return observer.error(new Error("Refresh failed"));
              }

              console.log("✅ Refresh successful! Replaying paused queries.");
              isRefreshing = false;
              resolvePendingRequests();

              const subscriber = {
                next: observer.next.bind(observer),
                error: observer.error.bind(observer),
                complete: observer.complete.bind(observer),
              };
              forward(operation).subscribe(subscriber);
            })
            .catch((fetchErr) => {
              console.error("💥 Network crashed during refresh:", fetchErr);
              isRefreshing = false;
              observer.error(fetchErr);
            });
        } else {
          pendingRequests.push(() => {
            const subscriber = {
              next: observer.next.bind(observer),
              error: observer.error.bind(observer),
              complete: observer.complete.bind(observer),
            };
            forward(operation).subscribe(subscriber);
          });
        }
      });
    }
  },
);

const client = new ApolloClient({
  link: from([errorLink, httpLink]),
  cache: new InMemoryCache({}),
});

export const CustomApolloProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return <ApolloProvider client={client}>{children}</ApolloProvider>;
};
