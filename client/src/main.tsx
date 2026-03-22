import { createRoot } from "react-dom/client";
import "./index.css";
import { RouterProvider } from "react-router-dom";
import * as Sentry from "@sentry/react";
import { registerSW } from "virtual:pwa-register";
import { UserProvider } from "./components/providers/UserProvider";
import { CustomApolloProvider } from "./components/providers/CustomApolloProvider";
import { PostHogProvider } from "./components/providers/PostHogProvider";
import { router } from "./router";
import { Toaster } from "sonner";

Sentry.init({
  dsn: "https://2805ef33995874e631b94ef2244ed00d@o4511026054561792.ingest.de.sentry.io/4511029947334736",
  sendDefaultPii: true,
});

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Failed to find the root element");

registerSW({ immediate: true });

createRoot(rootElement).render(
  <CustomApolloProvider>
    <PostHogProvider>
      <UserProvider>
        <div className="relative z-0 flex flex-col min-h-screen bg-primary">
          <RouterProvider router={router} />
        </div>
        <Toaster />
      </UserProvider>
    </PostHogProvider>
  </CustomApolloProvider>,
);