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
    class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium"
    :class="{
      'bg-up/15 text-up': state === 'up',
      'bg-down/15 text-down': state === 'down',
      'bg-unknown/20 text-ink-dim': state === 'unknown',
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
