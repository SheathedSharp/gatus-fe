export interface GatusConditionResult {
  condition: string
  success: boolean
}

export interface GatusResult {
  status: number
  /** 耗时，单位纳秒 */
  duration: number
  timestamp: string
  success: boolean
  conditionResults?: GatusConditionResult[]
}

export interface GatusEndpoint {
  key: string
  name: string
  group: string
  results: GatusResult[]
}

export type EndpointState = 'up' | 'down' | 'unknown'

/** 拉取 Gatus API（开发环境由 Vite 代理，生产环境由 Pages Function 代理） */
export async function fetchEndpoints(signal?: AbortSignal): Promise<GatusEndpoint[]> {
  const res = await fetch('/api/v1/endpoints/statuses', {
    signal,
    headers: { accept: 'application/json' },
  })
  if (!res.ok) throw new Error(`Gatus API responded ${res.status}`)

  const data = (await res.json()) as GatusEndpoint[]
  for (const endpoint of data) {
    // 统一按时间倒序，results[0] 永远是最新一次
    endpoint.results = [...(endpoint.results ?? [])].sort(
      (a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp),
    )
  }
  return data
}

export function endpointState(endpoint: GatusEndpoint): EndpointState {
  const latest = endpoint.results[0]
  if (!latest) return 'unknown'
  return latest.success ? 'up' : 'down'
}
