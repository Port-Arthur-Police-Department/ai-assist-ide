import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      
      // Workbox configuration
      workbox: {
        globDirectory: 'dist',
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webmanifest}'],
        navigateFallback: '/ai-assist-ide/index.html',
        navigateFallbackAllowlist: [/^(?!\/__).*/],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 365 days
              }
            }
          }
        ]
      },

      // Complete manifest for installability
      manifest: {
        name: 'AI-Assist-IDE',
        short_name: 'AI-Assist-IDE',
        description: 'AI-Powered Development Environment',
        theme_color: '#2563eb',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'any',
        scope: '/ai-assist-ide/',
        start_url: '/ai-assist-ide/',
        id: '/ai-assist-ide/',
        lang: 'en-US',
        categories: ['development', 'productivity', 'utilities'],
        
        // Icons - make sure these files exist in public/icons/
        icons: [
          {
            src: 'icons/android-chrome-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: 'icons/android-chrome-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: 'icons/apple-touch-icon.png',
            sizes: '180x180',
            type: 'image/png',
            purpose: 'any'
          }
        ],

        // Screenshots for app store-like experience
        screenshots: [
          {
            src: 'screenshots/wide.png',
            sizes: '1280x720',
            type: 'image/png',
            form_factor: 'wide'
          },
          {
            src: 'screenshots/narrow.png',
            sizes: '750x1334',
            type: 'image/png',
            form_factor: 'narrow'
          }
        ]
      },

      // Manifest generation
      includeAssets: ['icons/*', 'screenshots/*'],
      manifestFilename: 'manifest.webmanifest',
      strategies: 'generateSW',

      // Dev options
      devOptions: {
        enabled: false,
        type: 'module'
      }
    })
  ],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') }
  },
  base: '/ai-assist-ide/',
  build: {
    outDir: 'dist',
    sourcemap: false,
    emptyOutDir: true
  }
})