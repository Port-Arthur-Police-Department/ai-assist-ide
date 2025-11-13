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
      workbox: {
        globDirectory: 'dist',
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webmanifest}'],
        navigateFallback: '/ai-assist-ide/index.html',
        navigateFallbackAllowlist: [/^(?!\/__).*/],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
        cacheId: 'ai-assist-ide-v2',
        // Remove the invalid 'exclude' property and use 'ignoreURLParametersMatching' instead
        ignoreURLParametersMatching: [/^utm_/, /^fbclid$/],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\./i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: { maxEntries: 10, maxAgeSeconds: 86400 }
            }
          },
          {
            urlPattern: /\/ai-assist-ide\/manifest\.webmanifest/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'manifest-cache'
            }
          },
          // Cache Google Fonts
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-webfonts',
              expiration: {
                maxEntries: 4,
                maxAgeSeconds: 365 * 24 * 60 * 60 // 365 days
              }
            }
          }
        ]
      },
      manifest: {
        name: 'AI-Assist-IDE',
        short_name: 'AI-Assist-IDE',
        description: 'AI-Powered Development Environment',
        theme_color: '#2563eb',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/ai-assist-ide/',
        start_url: '/ai-assist-ide/',
        lang: 'en-US',
        categories: ['productivity', 'business'],
        icons: [
          {
            src: '/ai-assist-ide/icons/android-chrome-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: '/ai-assist-ide/icons/android-chrome-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      includeManifest: true,
      manifestFilename: 'manifest.webmanifest',
      strategies: 'generateSW',
      devOptions: { 
        enabled: false,
        type: 'module',
        navigateFallback: '/ai-assist-ide/index.html'
      },
      includeAssets: ['icons/*']
    })
  ],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') }
  },
  base: '/ai-assist-ide/',
  build: {
    outDir: 'dist',
    sourcemap: false,
    emptyOutDir: true,
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 600
  }
})
