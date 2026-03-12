import { sentryVitePlugin } from "@sentry/vite-plugin";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [react(), VitePWA({
    // Automatically updates the app when you deploy a new version
    registerType: "autoUpdate",

    // Files to cache for offline routing
    includeAssets: ["favicon.ico", "apple-touch-icon.png", "logo.png"],
    workbox: {
      navigateFallbackDenylist: [/^\/graphql/], // Ignores any route starting with /graphql
      cleanupOutdatedCaches: true,
    },
    // Your PWA Manifest configuration
    manifest: {
      name: "Skribe",
      short_name: "Skribe",
      description: "Collaborative Storytelling & Drafting",
      theme_color: "#0A0A14",
      background_color: "#0A0A14",
      display: "standalone", // Makes it look like a native app (hides browser UI)
      orientation: "portrait",
      icons: [
        {
          src: "/ic_launcher.png",
          sizes: "192x192",
          type: "image/png",
        },
        {
          src: "/playstore.png",
          sizes: "512x512",
          type: "image/png",
          purpose: "any maskable", // Recommended for Android sizing
        },
      ],
    },
  }), sentryVitePlugin({
    org: "demo-me",
    project: "javascript-react"
  })],

  build: {
    sourcemap: true
  }
});
