import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["icon-192.png", "icon-512.png"],
      manifest: {
        name: "GeoópS — Inteligência Operacional",
        short_name: "GeoópS",
        description:
          "Plataforma de gestão operacional de projetos ambientais — GEOAMBIENTE S/A",
        theme_color: "#0F2E4D",
        background_color: "#0F2E4D",
        display: "standalone",
        orientation: "portrait",
        start_url: "/",
        scope: "/",
        lang: "pt-BR",
        icons: [
          { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
          {
            src: "/icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,png,svg,woff2}"],
        // CRÍTICO: nunca deixar o Service Worker interceptar /api — essas chamadas
        // precisam SEMPRE ir à rede (função serverless), nunca ao cache do PWA.
        navigateFallbackDenylist: [/^\/api\//],
        runtimeCaching: [
          {
            // /api sempre via rede, sem cache
            urlPattern: /^\/api\/.*/i,
            handler: "NetworkOnly",
          },
          {
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts",
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
        ],
      },
    }),
  ],
});
