import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globDirectory: 'dist',
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webmanifest}'],
        navigateFallback: '/ai-assist-ide/index.html',
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
      },
      manifest: {
        name: 'AI-Assist-IDE',
        short_name: 'AI-Assist-IDE',
        description: 'AI-Powered Development Environment',
        theme_color: '#2563eb',
        background_color: '#ffffff',
        display: 'standalone',
        scope: '/ai-assist-ide/',
        start_url: '/ai-assist-ide/',
        // Remove icons temporarily to avoid errors
        icons: []
      },
      devOptions: {
        enabled: false
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
