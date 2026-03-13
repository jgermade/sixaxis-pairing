
import { resolve } from 'path'
import { defineConfig, loadEnv } from 'vite'

import vue from '@vitejs/plugin-vue'

const {
  OUT_DIR = 'dist',
} = process.env

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_')

  if (mode === 'development') {
    console.log('Loaded environment variables:', env)
  }

  return {
    root: resolve(__dirname, 'src'),
    publicDir: resolve(__dirname, 'static'),
    build: {
      outDir: resolve(__dirname, OUT_DIR),
      cssMinify: false,
    },
    plugins: [
      vue(),
    ],
    define: {
      global: 'globalThis',
      GOOGLE_CLIENT_ID: JSON.stringify(process.env.GOOGLE_CLIENT_ID || env.VITE_GOOGLE_CLIENT_ID),
    },
    envPrefix: 'VITE_',
  }
})
