import { config } from "dotenv"

// https://nuxt.com/docs/api/configuration/nuxt-config
config();

export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },
  modules: ['@sidebase/nuxt-auth', '@nuxt/image'],

  vite: {
    server: {
      allowedHosts: true 
    },
    resolve: {
      alias: {
        '#app-manifest': 'defu'
      }
    }
  },

  experimental: {
    appManifest: false
  },
  
  css: [
    '~/assets/css/main.css',
    '~/assets/css/modern-saas.css'
  ],
  
  app: {
    head: {
      title: 'QwizHub — Platform Riset & Instrumen Penelitian dengan AI',
      meta: [
        { name: 'description', content: 'QwizHub membantu mahasiswa dan peneliti menyusun instrumen penelitian dengan bantuan AI, mengevaluasi kualitas pertanyaan, dan menemukan responden yang sesuai.' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { charset: 'utf-8' }
      ],
      link: [
        {
          rel: 'preconnect',
          href: 'https://fonts.googleapis.com'
        },
        {
          rel: 'preconnect',
          href: 'https://fonts.gstatic.com',
          crossorigin: ''
        },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300..800;1,300..800&display=swap'
        },
        {
          rel: 'stylesheet',
          href: 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css',
          integrity: 'sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH',
          crossorigin: 'anonymous'
        },
        {
          rel: 'stylesheet',
          href: 'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css'
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
    midtransServerKey: process.env.MIDTRANS_SERVER_KEY,
    midtransIsProduction: process.env.MIDTRANS_IS_PRODUCTION,
    
    // Keys within public, will be also exposed to the client-side
    public: {
      authUrl: process.env.NEXTAUTH_URL || "http://localhost:3000/api/auth",
      midtransClientKey: process.env.MIDTRANS_CLIENT_KEY,
      midtransSnapUrl: process.env.MIDTRANS_IS_PRODUCTION === 'true' 
        ? 'https://app.midtrans.com/snap/snap.js'
        : 'https://app.sandbox.midtrans.com/snap/snap.js'
    }
  }
})