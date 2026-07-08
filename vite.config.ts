// import { defineConfig, type Plugin } from "vite";
// import path from "path";
// import tailwindcss from "@tailwindcss/vite";
// import react from "@vitejs/plugin-react";
// import { VitePWA } from "vite-plugin-pwa";

// const HYMNIZE_ORIGIN = "https://hymnize.com";

// function figmaAssetResolver(): Plugin {
//   return {
//     name: "figma-asset-resolver",
//     resolveId(id) {
//       if (id.startsWith("figma:asset/")) {
//         const filename = id.replace("figma:asset/", "");
//         return path.resolve(__dirname, "src/assets", filename);
//       }
//     },
//   };
// }

// export default defineConfig(({ command }) => {
//   const isBuild = command === "build";

//   return {
//     plugins: [
//       figmaAssetResolver(),
//       react(), // ALWAYS include this for both dev and build
//       tailwindcss(),

//       // PWA only during build is fine, but ensure it doesn't break dev
//       ...(isBuild
//         ? [
//             VitePWA({
//               strategies: "generateSW",
//               registerType: "autoUpdate",
//               injectRegister: "auto",
//               includeAssets: [
//                 "icons/icon-192.png",
//                 "icons/icon-512.png",
//                 "icons/maskable-192.png",
//                 "icons/maskable-512.png",
//                 "icons/apple-touch-icon.png",
//               ],
//               manifest: {
//                 name: "CAC Gospel Hymnal",
//                 short_name: "CAC Hymnal",
//                 description: "CAC Gospel Hymnal in English and Yoruba",
//                 id: "/",
//                 start_url: "/",
//                 scope: "/",
//                 display: "standalone",
//                 orientation: "portrait",
//                 theme_color: "#1A237E",
//                 background_color: "#1A237E",
//                 lang: "en",
//                 categories: ["books", "music", "lifestyle", "education"],
//                 icons: [
//                   {
//                     src: "/icons/icon-192.png",
//                     sizes: "192x192",
//                     type: "image/png",
//                     purpose: "any",
//                   },
//                   {
//                     src: "/icons/icon-512.png",
//                     sizes: "512x512",
//                     type: "image/png",
//                     purpose: "any",
//                   },
//                   {
//                     src: "/icons/maskable-192.png",
//                     sizes: "192x192",
//                     type: "image/png",
//                     purpose: "maskable",
//                   },
//                   {
//                     src: "/icons/maskable-512.png",
//                     sizes: "512x512",
//                     type: "image/png",
//                     purpose: "maskable",
//                   },
//                 ],
//               },
//               workbox: {
//                 cleanupOutdatedCaches: true,
//                 skipWaiting: true,
//                 clientsClaim: true,
//                 cacheId: "cac-hymnal-v2",
//                 globPatterns: [
//                   "**/*.{js,css,html,ico,png,svg,webp,jpg,jpeg,woff,woff2}",
//                 ],
//                 maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
//                 navigateFallback: "/index.html",
//                 runtimeCaching: [
//                   {
//                     urlPattern: ({ url }) =>
//                       url.origin === HYMNIZE_ORIGIN &&
//                       url.pathname.startsWith("/api/collections/"),
//                     handler: "StaleWhileRevalidate",
//                     options: {
//                       cacheName: "hymnize-collections-v1",
//                       expiration: {
//                         maxEntries: 10,
//                         maxAgeSeconds: 60 * 60 * 24 * 365,
//                       },
//                       cacheableResponse: {
//                         statuses: [0, 200],
//                       },
//                       backgroundSync: {
//                         name: "collections-sync",
//                         options: {
//                           maxRetentionTime: 24 * 60,
//                         },
//                       },
//                     },
//                   },
//                 ],
//               },
//             }),
//           ]
//         : []),
//     ],
//     resolve: {
//       alias: {
//         "@": path.resolve(__dirname, "./src"),
//       },
//     },
//     assetsInclude: ["**/*.svg", "**/*.csv"],
//     esbuild: {
//       jsx: "automatic",
//     },
//     server: {
//       proxy: {
//         "/api": {
//           target: "https://hymnize.com",
//           changeOrigin: true,
//           secure: true,
//         },
//       },
//     },
//   };
// });

import { defineConfig, type Plugin } from "vite";
import path from "path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

const HYMNIZE_ORIGIN = "https://hymnize.com";

function figmaAssetResolver(): Plugin {
  return {
    name: "figma-asset-resolver",
    resolveId(id) {
      if (id.startsWith("figma:asset/")) {
        const filename = id.replace("figma:asset/", "");
        return path.resolve(__dirname, "src/assets", filename);
      }
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [
      figmaAssetResolver(),
      react(), // ALWAYS include this
      tailwindcss(),
      VitePWA({
        strategies: "generateSW",
        registerType: "autoUpdate",
        injectRegister: "auto",
        devOptions: {
          enabled: true, // Prevents orphaned service workers in dev
        },
        includeAssets: [
          "icons/icon-192.png",
          "icons/icon-512.png",
          "icons/maskable-192.png",
          "icons/maskable-512.png",
          "icons/apple-touch-icon.png",
        ],
        manifest: {
          name: "CAC Gospel Hymnal",
          short_name: "CAC Hymnal",
          description: "CAC Gospel Hymnal in English and Yoruba",
          id: "/",
          start_url: "/",
          scope: "/",
          display: "standalone",
          display_override: ["fullscreen", "window-controls-overlay"],
          orientation: "portrait",
          theme_color: "#1A237E",
          background_color: "#1A237E",
          lang: "en",
          categories: ["books", "music", "lifestyle", "education"],
          icons: [
            {
              src: "/icons/icon-192.png",
              sizes: "192x192",
              type: "image/png",
              purpose: "any",
            },
            {
              src: "/icons/icon-512.png",
              sizes: "512x512",
              type: "image/png",
              purpose: "any",
            },
            {
              src: "/icons/maskable-192.png",
              sizes: "192x192",
              type: "image/png",
              purpose: "maskable",
            },
            {
              src: "/icons/maskable-512.png",
              sizes: "512x512",
              type: "image/png",
              purpose: "maskable",
            },
          ],
        },
        workbox: {
          cleanupOutdatedCaches: true,
          skipWaiting: true,
          clientsClaim: true,
          cacheId: "cac-hymnal-v2",
          globPatterns: [
            "**/*.{js,css,html,ico,png,svg,webp,jpg,jpeg,woff,woff2}",
          ],
          maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
          navigateFallback: "/index.html",
          // runtimeCaching: [
          //   {
          //     urlPattern: ({ url }) =>
          //       url.origin === HYMNIZE_ORIGIN &&
          //       url.pathname.startsWith("/api/collections/"),
          //     handler: "StaleWhileRevalidate",
          //     options: {
          //       cacheName: "hymnize-collections-v1",
          //       expiration: {
          //         maxEntries: 10,
          //         maxAgeSeconds: 60 * 60 * 24 * 365,
          //       },
          //       cacheableResponse: {
          //         statuses: [0, 200],
          //       },
          //       backgroundSync: {
          //         name: "collections-sync",
          //         options: {
          //           maxRetentionTime: 24 * 60,
          //         },
          //       },
          //     },
          //   },
          // ],
          runtimeCaching: [
            {
              // Hardcode the URL string here instead of using the variable
              urlPattern: ({ url }) =>
                url.origin === "https://hymnize.com" &&
                url.pathname.startsWith("/api/collections/"),
              handler: "StaleWhileRevalidate",
              options: {
                cacheName: "hymnize-collections-v1",
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365,
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
                backgroundSync: {
                  name: "collections-sync",
                  options: {
                    maxRetentionTime: 24 * 60,
                  },
                },
              },
            },
          ],
        },
      }),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    assetsInclude: ["**/*.svg", "**/*.csv"],
    // REMOVED: esbuild: { jsx: "automatic" }
    server: {
      proxy: {
        "/api": {
          target: "https://hymnize.com",
          changeOrigin: true,
          secure: true,
        },
      },
    },
  };
});
