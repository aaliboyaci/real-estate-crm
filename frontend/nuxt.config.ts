// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: ['@pinia/nuxt', '@nuxtjs/tailwindcss'],

  runtimeConfig: {
    public: {
      apiBase: 'http://localhost:3001/api',
    },
  },

  app: {
    head: {
      title: 'Real Estate CRM',
      meta: [
        { name: 'description', content: 'Transaction management and commission distribution' },
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      ],
    },
  },
})
