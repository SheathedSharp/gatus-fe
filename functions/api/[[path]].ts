interface Env {
  /** Gatus 后端地址，默认 https://status.example.com */
  GATUS_API_BASE?: string
}

interface PagesContext {
  request: Request
  params: Record<string, string | string[]>
  env: Env
}

/**
 * Cloudflare Pages Function：把前端同源的 /api/* 代理到 Gatus 后端，
 * 避免 CORS，也方便以后切换后端地址（改环境变量即可）。
 */
export const onRequest = async ({ request, params, env }: PagesContext): Promise<Response> => {
  const base = (env.GATUS_API_BASE ?? 'https://status.example.com').replace(/\/+$/, '')
  const path = Array.isArray(params.path) ? params.path.join('/') : (params.path ?? '')
  const { search } = new URL(request.url)

  const upstream = await fetch(`${base}/api/${path}${search}`, {
    headers: { accept: 'application/json', 'accept-encoding': 'gzip' },
  })

  return new Response(upstream.body, {
    status: upstream.status,
    headers: {
      'content-type': upstream.headers.get('content-type') ?? 'application/json',
      'cache-control': 'public, max-age=10',
    },
  })
}
