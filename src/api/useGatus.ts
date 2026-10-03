import { onMounted, onUnmounted, ref } from 'vue'
import { fetchEndpoints, type GatusEndpoint } from './gatus'

/** 轮询 Gatus API，默认 30 秒刷新一次 */
export function useGatus(intervalMs = 30_000) {
  const endpoints = ref<GatusEndpoint[]>([])
  const error = ref<string | null>(null)
  const loading = ref(true)
  const lastUpdated = ref<number | null>(null)

  let timer: number | undefined
  let controller: AbortController | undefined

  async function refresh() {
    controller?.abort()
    controller = new AbortController()
    try {
      endpoints.value = await fetchEndpoints(controller.signal)
      error.value = null
      lastUpdated.value = Date.now()
    } catch (e) {
      if ((e as Error).name === 'AbortError') return
      error.value = (e as Error).message
    } finally {
      loading.value = false
    }
  }

  onMounted(() => {
    void refresh()
    timer = window.setInterval(() => void refresh(), intervalMs)
  })

  onUnmounted(() => {
    if (timer) window.clearInterval(timer)
    controller?.abort()
  })

  return { endpoints, error, loading, lastUpdated, refresh }
}
