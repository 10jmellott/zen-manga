// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  devServer: {
    port: 8086
  },
  modules: ['@nuxt/icon', '@nuxt/fonts'],
  ssr: false,
  app: {
    baseURL: '/zen-manga/'
  },
  router: {
    options: {
      hashMode: true
    }
  }
})