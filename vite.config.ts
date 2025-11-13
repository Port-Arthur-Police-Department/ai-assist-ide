import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
  ],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') }
  },
  base: './', // Change to relative path
  build: {
    outDir: 'dist',
    sourcemap: false,
    emptyOutDir: true
  }
})
