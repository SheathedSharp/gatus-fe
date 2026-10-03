import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

// 本地开发：/api/* 代理到 Gatus 后端（受 Zero Trust 保护时，
// 在 .env.local 里配置 Service Token）
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const accessHeaders =
    env.GATUS_ACCESS_CLIENT_ID && env.GATUS_ACCESS_CLIENT_SECRET
      ? {
          'CF-Access-Client-Id': env.GATUS_ACCESS_CLIENT_ID,
          'CF-Access-Client-Secret': env.GATUS_ACCESS_CLIENT_SECRET,
        }
      : undefined

  return {
    plugins: [vue(), tailwindcss()],
    server: {
      proxy: {
        '/api': {
          target: env.GATUS_API_BASE || 'https://monitor.example.com',
          changeOrigin: true,
          headers: accessHeaders,
        },
      },
    },
  }
})
