import { config } from "dotenv"

// https://nuxt.com/docs/api/configuration/nuxt-config
config();

export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },
  modules: ['@sidebase/nuxt-auth', '@nuxt/image'],
  
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