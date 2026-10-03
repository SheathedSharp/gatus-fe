<script setup lang="ts">
import type { EndpointState } from '../api/gatus'

defineProps<{ state: EndpointState }>()

const labels: Record<EndpointState, string> = {
  up: 'Up',
  down: 'Down',
  unknown: 'Unknown',
}
</script>

<template>
  <span
    class="inline-flex shrink-0 items-center gap-1.5 rounded-md border px-2 py-0.5 text-[11px] font-medium"
    :class="{
      'border-up/25 bg-up/10 text-up': state === 'up',
      'border-down/30 bg-down/10 text-down': state === 'down',
      'border-line bg-bg-inset text-ink-dim': state === 'unknown',
    }"
  >
    <span
      class="size-1.5 rounded-full"
      :class="{
        'bg-up': state === 'up',
        'bg-down': state === 'down',
        'bg-unknown': state === 'unknown',
      }"
    />
    {{ labels[state] }}
  </span>
</template>
