import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // base relativa para que funcione en GitHub Pages bajo /pixel-editor/
  base: './',
  server: {
    port: 5174,
  },
  build: {
    outDir: 'dist',
  },
})