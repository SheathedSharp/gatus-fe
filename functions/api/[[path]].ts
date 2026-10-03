interface Env {
  /** Gatus 后端地址，默认 https://monitor.example.com */
  GATUS_API_BASE?: string
}

interface PagesContext {
  request: Request
  params: Record<string, string | string[]>
  env: Env
}

const CORS_HEADERS = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET, OPTIONS',
  'access-control-allow-headers': '*',
}

/**
 * Cloudflare Pages Function：把 /api/* 代理到 Gatus 后端。
 *
 * 注意：本 Function 必须通过 pages.dev 域名访问（跨 Zone），
 * 若通过 example.com 的自定义域名访问，Cloudflare 会把同 Zone 子请求
 * 直接送往源站、绕过隧道，导致 404。
 * 因此前端生产环境通过 VITE_API_BASE=https://your-project.pages.dev 直连这里，
 * 由这里附带 CORS 头，浏览器跨域读取。
 */
export const onRequest = async ({ request, params, env }: PagesContext): Promise<Response> => {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS })
  }

  const base = (env.GATUS_API_BASE ?? 'https://monitor.example.com').replace(/\/+$/, '')
  const path = Array.isArray(params.path) ? params.path.join('/') : (params.path ?? '')
  const { search } = new URL(request.url)

  const target = `${base}/api/${path}${search}`
  const upstream = await fetch(target, {
    headers: { accept: 'application/json', 'accept-encoding': 'gzip' },
  })

  return new Response(upstream.body, {
    status: upstream.status,
    headers: {
      'content-type': upstream.headers.get('content-type') ?? 'application/json',
      'cache-control': 'public, max-age=10',
      'x-upstream': target,
      'x-upstream-status': String(upstream.status),
      ...CORS_HEADERS,
    },
  })
}
