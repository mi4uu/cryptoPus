import { defineConfig } from 'vite'
import * as dotenv from 'dotenv';
import react from '@vitejs/plugin-react'

dotenv.config()

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // with options
      '/api': {
        target: process.env.ORIGIN,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      },
    }
  }
})
