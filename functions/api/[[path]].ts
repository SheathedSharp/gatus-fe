interface Env {
  /** Gatus 后端地址，如 https://monitor.example.com（必须配置） */
  GATUS_API_BASE?: string
  /** Cloudflare Access Service Token（后端受 Zero Trust 保护时配置） */
  CF_ACCESS_CLIENT_ID?: string
  CF_ACCESS_CLIENT_SECRET?: string
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
 * - 必须通过 pages.dev 域名访问（跨 Zone），同 Zone 子请求会被 Cloudflare
 *   直接送往源站、绕过隧道导致 404。
 * - 后端受 Zero Trust 保护时，用 Service Token 通过 Access 校验。
 * - 前端生产环境通过 VITE_API_BASE 指向 Pages 项目的 pages.dev 域名直连这里，
 *   由这里附带 CORS 头，浏览器跨域读取。
 */
export const onRequest = async ({ request, params, env }: PagesContext): Promise<Response> => {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS })
  }

  const base = (env.GATUS_API_BASE ?? '').replace(/\/+$/, '')
  if (!base) {
    return new Response(JSON.stringify({ error: 'GATUS_API_BASE is not configured' }), {
      status: 500,
      headers: { 'content-type': 'application/json', ...CORS_HEADERS },
    })
  }

  const path = Array.isArray(params.path) ? params.path.join('/') : (params.path ?? '')
  const { search } = new URL(request.url)

  const headers: Record<string, string> = {
    accept: 'application/json',
    'accept-encoding': 'gzip',
  }
  if (env.CF_ACCESS_CLIENT_ID && env.CF_ACCESS_CLIENT_SECRET) {
    headers['CF-Access-Client-Id'] = env.CF_ACCESS_CLIENT_ID
    headers['CF-Access-Client-Secret'] = env.CF_ACCESS_CLIENT_SECRET
  }

  const target = `${base}/api/${path}${search}`
  const upstream = await fetch(target, { headers })

  // 如果 Access 没有放行（凭据缺失/失效），返回明确的错误而不是登录页
  const location = upstream.headers.get('location') ?? ''
  if (upstream.status >= 300 && upstream.status < 400 && location.includes('cloudflareaccess.com')) {
    return new Response(JSON.stringify({ error: 'Upstream is protected by Cloudflare Access and the service token was rejected' }), {
      status: 502,
      headers: { 'content-type': 'application/json', ...CORS_HEADERS },
    })
  }

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
