<script setup lang="ts">
import { computed } from 'vue'
import { endpointState, type GatusEndpoint } from '../api/gatus'
import { formatDuration, formatRelative, uptimePercent } from '../api/format'
import { now } from '../api/useNow'
import StatusBadge from './StatusBadge.vue'
import UptimeBars from './UptimeBars.vue'

const props = defineProps<{ endpoint: GatusEndpoint }>()

const state = computed(() => endpointState(props.endpoint))
const latest = computed(() => props.endpoint.results[0])
const uptime = computed(() => uptimePercent(props.endpoint.results))
const relative = computed(() =>
  latest.value ? formatRelative(latest.value.timestamp, now.value) : null,
)
</script>

<template>
  <article class="card group relative p-4 hover:z-20" data-anim="endpoint">
    <div
      class="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-line-strong/70 to-transparent"
      aria-hidden="true"
    />

    <header class="flex items-start justify-between gap-3">
      <div class="min-w-0">
        <h3 class="truncate text-[15px] font-medium tracking-tight">{{ endpoint.name }}</h3>
        <p class="mt-0.5 truncate font-mono text-[11px] text-ink-dim" :title="endpoint.key">
          {{ endpoint.key }}
        </p>
      </div>
      <StatusBadge :state="state" />
    </header>

    <UptimeBars class="mt-4" :results="endpoint.results" />

    <footer class="mt-3 flex items-center justify-between gap-3 text-xs text-ink-dim">
      <span class="tabular-nums">
        <template v-if="uptime !== null">
          <span class="font-medium text-ink">{{ uptime.toFixed(2) }}%</span>
          uptime
        </template>
        <template v-else>no data</template>
      </span>
      <span v-if="latest" class="tabular-nums">
        {{ formatDuration(latest.duration) }} · {{ relative }}
      </span>
    </footer>
  </article>
</template>
