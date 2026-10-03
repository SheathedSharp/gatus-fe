import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

// 本地开发时 /api/* 代理到 Gatus 后端，避免 CORS
export default defineConfig({
  plugins: [vue(), tailwindcss()],
  server: {
    proxy: {
      '/api': {
        target: process.env.GATUS_API_BASE ?? 'https://monitor.example.com',
        changeOrigin: true,
      },
    },
  },
})
