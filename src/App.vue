<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { endpointState } from './api/gatus'
import { useGatus } from './api/useGatus'
import EndpointCard from './components/EndpointCard.vue'

const { endpoints, error, loading, lastUpdated, refresh } = useGatus(30_000)

const dark = ref(true)
onMounted(() => {
  const stored = localStorage.getItem('theme')
  dark.value = stored ? stored === 'dark' : true
  document.documentElement.classList.toggle('dark', dark.value)
})

function toggleTheme() {
  dark.value = !dark.value
  localStorage.setItem('theme', dark.value ? 'dark' : 'light')
  document.documentElement.classList.toggle('dark', dark.value)
}

const overall = computed(() => {
  if (!endpoints.value.length) return 'unknown'
  return endpoints.value.some((e) => endpointState(e) === 'down') ? 'down' : 'up'
})

const groups = computed(() => {
  const map = new Map<string, typeof endpoints.value>()
  for (const e of endpoints.value) {
    const key = e.group || 'Other'
    map.set(key, [...(map.get(key) ?? []), e])
  }
  return [...map.entries()].sort(([a], [b]) => a.localeCompare(b))
})
</script>

<template>
  <div class="mx-auto max-w-5xl px-5 py-10">
    <header class="flex flex-wrap items-center justify-between gap-4">
      <div class="flex items-center gap-3">
        <span class="relative flex size-3">
          <span
            v-if="overall === 'up'"
            class="absolute inline-flex size-full animate-ping rounded-full bg-up opacity-60"
          />
          <span
            class="relative inline-flex size-3 rounded-full"
            :class="overall === 'up' ? 'bg-up' : overall === 'down' ? 'bg-down' : 'bg-unknown'"
          />
        </span>
        <div>
          <h1 class="text-lg font-semibold">Zayju Status</h1>
          <p class="text-xs text-ink-dim">
            <template v-if="error">API error: {{ error }}</template>
            <template v-else-if="lastUpdated">
              updated {{ new Date(lastUpdated).toLocaleTimeString() }}
            </template>
            <template v-else>loading…</template>
          </p>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <button
          class="rounded-lg border border-line px-3 py-1.5 text-xs text-ink-dim transition-colors hover:text-ink"
          @click="refresh()"
        >
          Refresh
        </button>
        <button
          class="rounded-lg border border-line px-3 py-1.5 text-xs text-ink-dim transition-colors hover:text-ink"
          @click="toggleTheme"
        >
          {{ dark ? 'Light' : 'Dark' }}
        </button>
      </div>
    </header>

    <main class="mt-8 space-y-8">
      <p v-if="loading" class="text-sm text-ink-dim">Loading endpoints…</p>
      <p v-else-if="!endpoints.length" class="text-sm text-ink-dim">
        No endpoints returned by the API.
      </p>

      <section v-for="[group, list] in groups" :key="group">
        <h2 class="mb-3 text-xs font-semibold uppercase tracking-wider text-ink-dim">
          {{ group }}
        </h2>
        <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <EndpointCard v-for="endpoint in list" :key="endpoint.key" :endpoint="endpoint" />
        </div>
      </section>
    </main>

    <footer class="mt-12 text-center text-xs text-ink-dim">
      Powered by Gatus API · Vue + Tailwind
    </footer>
  </div>
</template>
