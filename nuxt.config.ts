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
		}
	} as PwaModuleOptions
});
