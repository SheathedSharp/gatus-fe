<script setup lang="ts">
import { computed } from 'vue'
import { endpointState, type GatusEndpoint } from '../api/gatus'
import { endpointPresentation } from '../api/presentation'
import { formatDuration, formatRelative, uptimePercent } from '../api/format'
import { now } from '../api/useNow'
import AppIcon from './AppIcon.vue'
import ServiceIcon from './ServiceIcon.vue'
import StatusBadge from './StatusBadge.vue'
import UptimeBars from './UptimeBars.vue'

const props = defineProps<{ endpoint: GatusEndpoint; siteUrl: string }>()

const state = computed(() => endpointState(props.endpoint))
const latest = computed(() => props.endpoint.results[0])
const uptime = computed(() => uptimePercent(props.endpoint.results))
const presentation = computed(() => endpointPresentation(props.endpoint, props.siteUrl))
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
      <div class="flex min-w-0 items-start gap-3">
        <span
          class="grid size-9 shrink-0 place-items-center rounded-lg border border-line bg-bg-inset text-ink-dim transition-colors group-hover:border-accent/30 group-hover:text-accent"
          aria-hidden="true"
        >
          <ServiceIcon :name="presentation.icon" class="size-[18px]" />
        </span>
        <div class="min-w-0">
          <h3 class="truncate text-[15px] font-medium tracking-tight">{{ endpoint.name }}</h3>
          <p class="mt-0.5 truncate font-mono text-[11px] text-ink-dim" :title="endpoint.key">
            {{ endpoint.key }}
          </p>
        </div>
      </div>
      <StatusBadge :state="state" />
    </header>

    <UptimeBars class="mt-4" :results="endpoint.results" />

    <a
      v-if="presentation.link"
      :href="presentation.link.href"
      target="_blank"
      rel="noreferrer"
      class="mt-3 inline-flex max-w-full items-center gap-1.5 text-xs text-ink-dim transition-colors hover:text-accent"
      :title="presentation.link.protected ? 'Protected by Cloudflare Access' : undefined"
    >
      <AppIcon
        v-if="presentation.link.protected"
        name="lock"
        class="size-3 shrink-0 opacity-70"
      />
      <span class="truncate">{{ presentation.link.label }}</span>
      <AppIcon name="arrow" class="size-3 shrink-0 opacity-70" />
    </a>

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
