import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    base: './', // important for file:// access
    plugins: [react()],
    define: {
      'import.meta.env.VITE_API_KEY': JSON.stringify(env.VITE_API_KEY),
      'import.meta.env.VITE_BASE_PROMPT': JSON.stringify(env.VITE_BASE_PROMPT),
    },
    build: {
      sourcemap: true, // Enable source maps
      rollupOptions: {
        output: {
          // Optional: add inline sourcemaps to make debugging easier
          sourcemap: true,
        },
      },
    },
  }
})
