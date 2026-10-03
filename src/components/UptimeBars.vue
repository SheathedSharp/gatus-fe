<script setup lang="ts">
import { computed } from 'vue'
import type { GatusResult } from '../api/gatus'
import { formatDuration, formatRelative } from '../api/format'

const props = defineProps<{ results: GatusResult[]; max?: number }>()

/** 最新的一批结果，从左到右 = 从旧到新 */
const bars = computed(() => props.results.slice(0, props.max ?? 40).reverse())
</script>

<template>
  <div class="flex h-8 items-end gap-[3px]">
    <div
      v-for="(r, i) in bars"
      :key="i"
      class="min-w-[3px] flex-1 rounded-[2px] transition-opacity hover:opacity-80"
      :class="r.success ? 'bg-up/70' : 'bg-down'"
      :title="`${formatRelative(r.timestamp)} · ${r.success ? 'OK' : 'FAIL'} · ${formatDuration(r.duration)}`"
    />
  </div>
</template>
