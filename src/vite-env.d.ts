/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** 生产环境 API 基地址（开发环境留空走 Vite 代理） */
  readonly VITE_API_BASE?: string
  /** 页面展示的站点域名，如 status.example.com */
  readonly VITE_SITE_HOST?: string
  /** 页脚外链地址，如 https://example.com */
  readonly VITE_SITE_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
