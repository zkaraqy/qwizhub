import { config } from "dotenv"

// https://nuxt.com/docs/api/configuration/nuxt-config
config();

export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },
  modules: ['@sidebase/nuxt-auth', '@nuxt/image'],
  
  app: {
    head: {
      link: [
        {
          rel: 'stylesheet',
          href: 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css',
          integrity: 'sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH',
          crossorigin: 'anonymous'
        }
      ],
      script: [
        {
          src: 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js',
          integrity: 'sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz',
          crossorigin: 'anonymous',
          defer: true
        }
      ]
    }
  },
  
  auth: {
    baseURL: process.env.AUTH_ORIGIN,
    provider: {
      type: 'authjs'
    }
  },
  
  runtimeConfig: {
    // The private keys which are only available within server-side
    authSecret: process.env.NEXTAUTH_SECRET,
    // Keys within public, will be also exposed to the client-side
    public: {
      authUrl: process.env.NEXTAUTH_URL || "http://localhost:3000/api/auth"
    }
  }
})