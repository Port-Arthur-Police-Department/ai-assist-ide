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
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
        cacheId: 'ai-assist-ide-v3', // Increment this to force cache update
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
            src: 'icons/icon-192x192.png', // Use the actual file names from your build
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: 'icons/icon-512x512.png', // Use the actual file names from your build
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      devOptions: { 
        enabled: true,
        type: 'module',
        navigateFallback: '/ai-assist-ide/index.html'
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
