<script setup lang="ts">
import { computed, ref } from 'vue'
import type { GatusResult } from '../api/gatus'
import { formatDuration, formatRelative } from '../api/format'
import { now } from '../api/useNow'

const props = defineProps<{ results: GatusResult[]; max?: number }>()

/** 最新的一批结果，从左到右 = 从旧到新 */
const bars = computed(() => props.results.slice(0, props.max ?? 40).reverse())

const active = ref<number | null>(null)

/** 悬浮窗靠近两端时贴边，避免溢出卡片 */
function alignClass(i: number) {
  const n = bars.value.length
  if (i < 5) return 'left-0'
  if (i > n - 6) return 'right-0'
  return 'left-1/2 -translate-x-1/2'
}

function absoluteTime(iso: string) {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}
</script>

<template>
  <div class="flex h-9 items-end gap-[3px]" role="img" :aria-label="`Last ${bars.length} checks`">
    <template v-if="bars.length">
      <div
        v-for="(r, i) in bars"
        :key="i"
        class="group relative h-full min-w-[3px] flex-1"
        @mouseenter="active = i"
        @mouseleave="active = null"
      >
        <div
          class="h-full w-full origin-bottom rounded-[3px] transition-all duration-200 group-hover:scale-y-110"
          :class="r.success ? 'bg-up/55 group-hover:bg-up' : 'bg-down/90 group-hover:bg-down'"
        />

        <Transition name="tip">
          <div
            v-if="active === i"
            class="pointer-events-none absolute bottom-full z-50 mb-2.5 w-64 rounded-xl border border-line bg-bg-card p-3 text-left shadow-lift"
            :class="alignClass(i)"
            role="tooltip"
          >
            <div class="flex items-center justify-between gap-2">
              <span
                class="inline-flex items-center gap-1.5 text-[11px] font-semibold"
                :class="r.success ? 'text-up' : 'text-down'"
              >
                <span class="size-1.5 rounded-full" :class="r.success ? 'bg-up' : 'bg-down'" />
                {{ r.success ? 'OK' : 'FAIL' }}
              </span>
              <span class="font-mono text-[10px] text-ink-dim">HTTP {{ r.status }}</span>
            </div>

            <p class="mt-2 text-[11px] font-medium text-ink">{{ absoluteTime(r.timestamp) }}</p>
            <p class="text-[10px] tabular-nums text-ink-dim">
              {{ formatRelative(r.timestamp, now) }} · {{ formatDuration(r.duration) }} response
            </p>

            <div v-if="r.conditionResults?.length" class="mt-2.5 border-t border-line pt-2">
              <p class="text-[9px] font-semibold uppercase tracking-[0.14em] text-ink-dim">
                Conditions
              </p>
              <ul class="mt-1.5 space-y-1">
                <li
                  v-for="(c, ci) in r.conditionResults"
                  :key="ci"
                  class="flex items-start gap-1.5"
                >
                  <span
                    class="mt-px text-[10px] leading-none"
                    :class="c.success ? 'text-up' : 'text-down'"
                  >
                    {{ c.success ? '✓' : '✕' }}
                  </span>
                  <span class="break-all font-mono text-[10px] leading-snug text-ink-dim">
                    {{ c.condition }}
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </Transition>
      </div>
    </template>
    <div v-else class="h-full w-full rounded-lg bg-bg-inset" />
  </div>
</template>
