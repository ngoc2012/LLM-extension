import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  // Load all env vars from .env, .env.[mode], etc.
  const env = loadEnv(mode, process.cwd(), '')

  // Automatically include all variables starting with VITE_
  const defineEnv = Object.keys(env)
    .filter((key) => key.startsWith('VITE_'))
    .reduce((acc, key) => {
      acc[`import.meta.env.${key}`] = JSON.stringify(env[key])
      return acc
    }, {})

  return {
    base: './', // important for file:// access
    plugins: [react()],
    define: defineEnv,
    build: {
      sourcemap: true,
      rollupOptions: {
        output: {
          sourcemap: true,
        },
      },
    },
  }
})
