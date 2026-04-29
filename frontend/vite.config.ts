import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Capacitor iOS / Android 加载本地 file:// → 必须用相对路径资源
// Web 部署（GitHub Pages / VPS nginx）也兼容 './'
export default defineConfig({
  plugins: [react()],
  base: './',
})
