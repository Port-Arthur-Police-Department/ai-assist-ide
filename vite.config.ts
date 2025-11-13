import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    // REMOVE PWA for now to get basic routing working
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
