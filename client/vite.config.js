import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import fs from 'fs'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd())
  
  // 检查是否启用 HTTPS
  const isHttps = process.env.HTTPS === 'true' || env.VITE_HTTPS === 'true'
  
  // 检查证书文件是否存在
  const certPath = path.join(__dirname, 'certs/fullchain.pem')
  const keyPath = path.join(__dirname, 'certs/privatekey.pem')
  const certsExist = fs.existsSync(certPath) && fs.existsSync(keyPath)
  
  let httpsOptions = false
  if (isHttps) {
    if (certsExist) {
      httpsOptions = {
        cert: fs.readFileSync(certPath),
        key: fs.readFileSync(keyPath)
      }
    } else {
      // 如果没有证书文件，使用 Vite 的默认自签名证书
      httpsOptions = true
    }
  }
  
  return {
    plugins: [react()],
    server: {
      port: isHttps ? 443 : 5173,
      host: true,
      https: httpsOptions,
      proxy: {
        '/api': 'http://localhost:3000'
      }
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src')
      }
    }
  }
})
