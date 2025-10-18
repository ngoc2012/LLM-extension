import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    sourcemap: true, // Enable source maps
    rollupOptions: {
      output: {
        // Optional: add inline sourcemaps to make debugging easier
        sourcemap: true,
      },
    },
  },
})
