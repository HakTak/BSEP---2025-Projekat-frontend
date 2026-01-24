import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    https: {
      key: fs.readFileSync('./server.key'),
      cert: fs.readFileSync('./server.crt'),
    },
    proxy: {
      '/api': {
        target: 'https://localhost:8443',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})