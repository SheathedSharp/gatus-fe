export function formatDuration(ns: number): string {
  if (!Number.isFinite(ns)) return '—'
  const ms = ns / 1e6
  if (ms < 1000) return `${Math.round(ms)} ms`
  return `${(ms / 1000).toFixed(2)} s`
}

export function formatRelative(iso: string, at: number = Date.now()): string {
  const diff = at - Date.parse(iso)
  if (!Number.isFinite(diff)) return '—'
  const s = Math.max(0, Math.round(diff / 1000))
  if (s < 60) return `${s}s ago`
  const m = Math.round(s / 60)
  if (m < 60) return `${m}m ago`
  const h = Math.round(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.round(h / 24)}d ago`
}

export function uptimePercent(results: { success: boolean }[]): number | null {
  if (!results.length) return null
  const ok = results.filter((r) => r.success).length
  return (ok / results.length) * 100
}
