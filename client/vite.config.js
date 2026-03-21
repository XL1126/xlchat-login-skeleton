import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import fs from 'fs'

const isHttps = process.env.HTTPS === 'true'
const httpsOptions = isHttps ? {
  cert: fs.readFileSync(path.join(__dirname, 'certs/fullchain.pem')),
  key: fs.readFileSync(path.join(__dirname, 'certs/privatekey.pem'))
} : {}

export default defineConfig({
  plugins: [react()],
  server: {
    port: isHttps ? 443 : 5173,
    host: true,
    https: isHttps ? httpsOptions : false,
    proxy: {
      '/api': 'http://localhost:3000'
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
})
