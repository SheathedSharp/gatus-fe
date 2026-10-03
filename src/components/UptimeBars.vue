<script setup lang="ts">
import { computed } from 'vue'
import type { GatusResult } from '../api/gatus'
import { formatDuration, formatRelative } from '../api/format'

const props = defineProps<{ results: GatusResult[]; max?: number }>()

/** 最新的一批结果，从左到右 = 从旧到新 */
const bars = computed(() => props.results.slice(0, props.max ?? 40).reverse())
</script>

<template>
  <div
    class="flex h-9 items-end gap-[3px]"
    role="img"
    :aria-label="`Last ${bars.length} checks`"
  >
    <template v-if="bars.length">
      <div
        v-for="(r, i) in bars"
        :key="i"
        class="min-w-[3px] flex-1 origin-bottom rounded-[3px] transition-all duration-200 hover:scale-y-110"
        :class="r.success ? 'bg-up/55 hover:bg-up' : 'bg-down/90 hover:bg-down'"
        :title="`${formatRelative(r.timestamp)} · ${r.success ? 'OK' : 'FAIL'} · ${formatDuration(r.duration)}`"
      />
    </template>
    <div v-else class="h-full w-full rounded-lg bg-bg-inset" />
  </div>
</template>
