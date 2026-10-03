<script setup lang="ts">
import { computed } from 'vue'
import { endpointState, type GatusEndpoint } from '../api/gatus'
import { formatDuration, formatRelative, uptimePercent } from '../api/format'
import StatusBadge from './StatusBadge.vue'
import UptimeBars from './UptimeBars.vue'

const props = defineProps<{ endpoint: GatusEndpoint }>()

const state = computed(() => endpointState(props.endpoint))
const latest = computed(() => props.endpoint.results[0])
const uptime = computed(() => uptimePercent(props.endpoint.results))
</script>

<template>
  <article class="rounded-[var(--radius)] border border-line bg-bg-card p-4 transition-colors">
    <header class="flex items-start justify-between gap-3">
      <div class="min-w-0">
        <h3 class="truncate font-medium">{{ endpoint.name }}</h3>
        <p v-if="endpoint.group" class="mt-0.5 text-xs text-ink-dim">{{ endpoint.group }}</p>
      </div>
      <StatusBadge :state="state" />
    </header>

    <UptimeBars class="mt-4" :results="endpoint.results" />

    <footer class="mt-3 flex items-center justify-between text-xs text-ink-dim">
      <span>
        <template v-if="uptime !== null">{{ uptime.toFixed(2) }}% uptime</template>
        <template v-else>no data</template>
      </span>
      <span v-if="latest">
        {{ formatDuration(latest.duration) }} · {{ formatRelative(latest.timestamp) }}
      </span>
    </footer>
  </article>
</template>
