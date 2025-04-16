
import { resolve } from 'path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

const {
  OUT_DIR = 'dist',
} = process.env

// https://vite.dev/config/
export default defineConfig({
  root: resolve(__dirname, 'src'),
  publicDir: resolve(__dirname, 'static'),
  build: {
    outDir: resolve(__dirname, OUT_DIR),
  },
  plugins: [vue()],
})
