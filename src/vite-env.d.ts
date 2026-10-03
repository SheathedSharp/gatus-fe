/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** 生产环境 API 基地址（开发环境留空走 Vite 代理） */
  readonly VITE_API_BASE?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
