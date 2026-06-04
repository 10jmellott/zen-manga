import type { PwaModuleOptions } from "@vite-pwa/nuxt";

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  devServer: {
    port: 8086
  },
  modules: ['@nuxt/icon', '@nuxt/fonts', '@pinia/nuxt', '@vite-pwa/nuxt'],
  ssr: false,
  app: {
    baseURL: '/zen-manga/'
  },
  router: {
    options: {
      hashMode: true
    }
  },
  pwa: {
    registerType: 'autoUpdate',
    appManifest: true,
    devOptions: {
      enabled: true
    },
    manifest: {
      name: "Zen Manga",
      short_name: "Zen Manga",
      icons: [
        {
          src: "/zen-manga/android-chrome-192x192.png",
          sizes: "192x192",
          type: "image/png"
        },
        {
          src: "/zen-manga/android-chrome-512x512.png",
          sizes: "512x512",
          type: "image/png"
        }
      ],
      theme_color: "#e07a5f",
      background_color: "#3d405b",
      display: "standalone"
    }
  } as PwaModuleOptions
});
