// import { defineConfig } from 'vite'
// import path from 'path'
// import tailwindcss from '@tailwindcss/vite'
// import react from '@vitejs/plugin-react'


// function figmaAssetResolver() {
//   return {
//     name: 'figma-asset-resolver',
//     resolveId(id) {
//       if (id.startsWith('figma:asset/')) {
//         const filename = id.replace('figma:asset/', '')
//         return path.resolve(__dirname, 'src/assets', filename)
//       }
//     },
//   }
// }

// export default defineConfig({
//   plugins: [
//     figmaAssetResolver(),
//     // The React and Tailwind plugins are both required for Make, even if
//     // Tailwind is not being actively used – do not remove them
//     react(),
//     tailwindcss(),
//   ],
//   resolve: {
//     alias: {
//       // Alias @ to the src directory
//       '@': path.resolve(__dirname, './src'),
//     },
//   },

//   // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
//   assetsInclude: ['**/*.svg', '**/*.csv'],
// })

import { defineConfig, type Plugin } from "vite";
import path from "path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

const HYMNIZE_ORIGIN = "https://worker.hymnize.com";

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

export default defineConfig(({ command }) => {
  const isBuild = command === "build";

  return {
    plugins: [
      figmaAssetResolver(),

      /**
       * Keep Tailwind active in both dev and build.
       */
      tailwindcss(),

      /**
       * Important:
       * Use React plugin only for production build.
       * This avoids the dev React Refresh preamble error.
       */
      // ...(isBuild ? [react()] : []),
      react(),
      /**
       * PWA only during build.
       */
      ...(isBuild
        ? [
            VitePWA({
              strategies: "generateSW",
              registerType: "autoUpdate",
              injectRegister: "auto",

              includeAssets: [
                // "favicon.ico",
                // "favicon.svg",
                // "robots.txt",
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

                globPatterns: [
                  "**/*.{js,css,html,ico,png,svg,webp,jpg,jpeg,woff,woff2}",
                ],

                maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,

                navigateFallback: "/index.html",

                runtimeCaching: [
                  {
                    urlPattern: ({ url }) =>
                      url.origin === HYMNIZE_ORIGIN && url.pathname === "/api",

                    handler: "NetworkFirst",

                    options: {
                      cacheName: "hymnize-api-root-v1",
                      networkTimeoutSeconds: 5,

                      expiration: {
                        maxEntries: 5,
                        maxAgeSeconds: 60 * 60 * 24 * 30,
                      },

                      cacheableResponse: {
                        statuses: [0, 200],
                      },
                    },
                  },

                  {
                    urlPattern: ({ url }) =>
                      url.origin === HYMNIZE_ORIGIN &&
                      url.pathname.startsWith("/api/hymns/") &&
                      url.pathname.endsWith("/indexes"),

                    handler: "NetworkFirst",

                    options: {
                      cacheName: "hymnize-indexes-v1",
                      networkTimeoutSeconds: 5,

                      expiration: {
                        maxEntries: 30,
                        maxAgeSeconds: 60 * 60 * 24 * 30,
                      },

                      cacheableResponse: {
                        statuses: [0, 200],
                      },
                    },
                  },

                  {
                    urlPattern: ({ url }) =>
                      url.origin === HYMNIZE_ORIGIN &&
                      /^\/api\/hymns\/[^/]+\/[^/]+\/[^/]+\/hymn\/\d+$/.test(
                        url.pathname
                      ),

                    handler: "NetworkFirst",

                    options: {
                      cacheName: "hymnize-hymns-v1",
                      networkTimeoutSeconds: 8,

                      expiration: {
                        maxEntries: 3000,
                        maxAgeSeconds: 60 * 60 * 24 * 180,
                      },

                      cacheableResponse: {
                        statuses: [0, 200],
                      },
                    },
                  },
                ],
              },
            }),
          ]
        : []),
    ],

    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },

    assetsInclude: ["**/*.svg", "**/*.csv"],

    esbuild: {
      jsx: "automatic",
    },
  };
});