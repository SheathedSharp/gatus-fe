import type { GatusEndpoint } from './gatus'

/** 服务图标名（SVG 见 components/ServiceIcon.vue） */
export type ServiceIconName =
  | 'firecrawl'
  | 'searxng'
  | 'hermes'
  | 'woodpecker'
  | 'dozzle'
  | 'proxy'
  | 'terminal'
  | 'desktop'
  | 'agent'
  | 'service'
  | 'node'

export interface EndpointLink {
  href: string
  label: string
  /** 目标受 Cloudflare Access 保护，点击后需先登录 */
  protected: boolean
}

export interface EndpointPresentation {
  icon: ServiceIconName
  link?: EndpointLink
}

interface Rule {
  /** 匹配 endpoint.key 或 name（不区分大小写） */
  test: RegExp
  icon: ServiceIconName
  /** 公网子域名前缀，配合 VITE_SITE_URL 推导可点击地址；缺省则不加链接 */
  subdomain?: string
  protected?: boolean
}

/** 具体服务规则，按顺序优先匹配 */
const RULES: Rule[] = [
  { test: /firecrawl/i, icon: 'firecrawl', subdomain: 'fc', protected: true },
  { test: /searxng/i, icon: 'searxng', subdomain: 'search', protected: true },
  { test: /hermes/i, icon: 'hermes', subdomain: 'hermes', protected: true },
  { test: /woodpecker/i, icon: 'woodpecker', subdomain: 'ci', protected: true },
  { test: /dozzle/i, icon: 'dozzle', subdomain: 'logs', protected: true },
  { test: /wb-proxy/i, icon: 'proxy', subdomain: 'wb', protected: true },
  { test: /rdp/i, icon: 'desktop', subdomain: 'rdp', protected: true },
  { test: /ssh/i, icon: 'terminal' },
]

/** 未命中具体规则时按分组兜底 */
const GROUP_ICONS: Record<string, ServiceIconName> = {
  agent: 'agent',
  service: 'service',
  node: 'node',
}

/** 去掉协议与末尾斜杠，得到裸域名 */
export function bareHost(siteUrl: string): string {
  return siteUrl.replace(/^https?:\/\//, '').replace(/\/+$/, '')
}

export function endpointPresentation(
  endpoint: GatusEndpoint,
  siteUrl: string,
): EndpointPresentation {
  const haystack = `${endpoint.key} ${endpoint.name}`
  const rule = RULES.find((r) => r.test.test(haystack))
  const icon =
    rule?.icon ?? GROUP_ICONS[endpoint.group.trim().toLowerCase()] ?? 'service'

  if (!rule?.subdomain) return { icon }

  const host = `${rule.subdomain}.${bareHost(siteUrl)}`
  return {
    icon,
    link: { href: `https://${host}`, label: host, protected: rule.protected ?? false },
  }
}
