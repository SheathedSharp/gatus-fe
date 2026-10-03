<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { endpointState, type GatusEndpoint, type GatusResult } from './api/gatus'
import { useGatus } from './api/useGatus'
import { formatDuration, formatRelative, uptimePercent } from './api/format'
import { now } from './api/useNow'
import AppIcon from './components/AppIcon.vue'
import EndpointCard from './components/EndpointCard.vue'

const { endpoints, error, loading, lastUpdated, refresh } = useGatus(30_000)

/* ---------- 主题 ---------- */

const dark = ref(true)

function syncThemeColor() {
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute('content', dark.value ? '#171018' : '#faf7f2')
}

onMounted(() => {
  const stored = localStorage.getItem('theme')
  dark.value = stored ? stored === 'dark' : true
  document.documentElement.classList.toggle('dark', dark.value)
  syncThemeColor()
})

function setTheme(next: boolean) {
  dark.value = next
  localStorage.setItem('theme', next ? 'dark' : 'light')
  document.documentElement.classList.toggle('dark', next)
  syncThemeColor()
}

/* ---------- 品牌短语轮播 ---------- */

const phrases = [
  { verb: 'Define', rest: 'Everything' },
  { verb: 'Dream', rest: 'Endless' },
  { verb: 'Dare', rest: 'Evolve' },
  { verb: 'Discover', rest: 'Everywhere' },
] as const

const phraseIndex = ref(0)
let phraseTimer: number | undefined

onMounted(() => {
  phraseTimer = window.setInterval(() => {
    phraseIndex.value = (phraseIndex.value + 1) % phrases.length
  }, 4000)
})

onUnmounted(() => window.clearInterval(phraseTimer))

const phrase = computed(() => phrases[phraseIndex.value])

/* ---------- 状态汇总 ---------- */

type Overall = 'up' | 'degraded' | 'down' | 'unknown'

const overall = computed<Overall>(() => {
  const list = endpoints.value
  if (!list.length) return 'unknown'
  const down = list.filter((e) => endpointState(e) === 'down').length
  if (down === 0) return 'up'
  return down === list.length ? 'down' : 'degraded'
})

const overallLabels: Record<Overall, string> = {
  up: 'All systems operational',
  degraded: 'Partial outage',
  down: 'Major outage',
  unknown: 'Status unknown',
}

const overallLabel = computed(() => overallLabels[overall.value])

const dotClass: Record<Overall, string> = {
  up: 'bg-up',
  degraded: 'bg-degraded',
  down: 'bg-down',
  unknown: 'bg-unknown',
}

const chipClass: Record<Overall, string> = {
  up: 'border-up/25 bg-up/10 text-up',
  degraded: 'border-degraded/30 bg-degraded/10 text-degraded',
  down: 'border-down/30 bg-down/10 text-down',
  unknown: 'border-line bg-bg-inset text-ink-dim',
}

const upCount = computed(() => endpoints.value.filter((e) => endpointState(e) === 'up').length)
const allResults = computed<GatusResult[]>(() => endpoints.value.flatMap((e) => e.results))
const overallUptime = computed(() => uptimePercent(allResults.value))

const avgDuration = computed(() => {
  const latest = endpoints.value
    .map((e) => e.results[0])
    .filter((r): r is GatusResult => Boolean(r))
  if (!latest.length) return null
  return latest.reduce((sum, r) => sum + r.duration, 0) / latest.length
})

const updatedText = computed(() => {
  if (error.value) return 'connection issue'
  if (!lastUpdated.value) return null
  return `updated ${formatRelative(new Date(lastUpdated.value).toISOString(), now.value)}`
})

const stats = computed(() => {
  const total = endpoints.value.length
  const uptime = overallUptime.value
  return [
    {
      label: 'Endpoints',
      value: total ? `${upCount.value}/${total}` : '—',
      sub: 'reporting up',
      tone: total && upCount.value < total ? 'text-down' : 'text-ink',
    },
    {
      label: 'Uptime',
      value: uptime !== null ? `${uptime.toFixed(2)}%` : '—',
      sub: `${allResults.value.length} checks`,
      tone:
        uptime === null || uptime >= 99
          ? 'text-ink'
          : uptime >= 95
            ? 'text-degraded'
            : 'text-down',
    },
    {
      label: 'Avg response',
      value: avgDuration.value !== null ? formatDuration(avgDuration.value) : '—',
      sub: 'latest checks',
      tone: 'text-ink',
    },
    {
      label: 'Last check',
      value: lastUpdated.value
        ? formatRelative(new Date(lastUpdated.value).toISOString(), now.value)
        : '—',
      sub: 'auto-refresh 30s',
      tone: 'text-ink',
    },
  ]
})

/* ---------- 分组 ---------- */

const groups = computed(() => {
  const map = new Map<string, GatusEndpoint[]>()
  for (const e of endpoints.value) {
    const key = e.group || 'Other'
    map.set(key, [...(map.get(key) ?? []), e])
  }
  return [...map.entries()].sort(([a], [b]) => a.localeCompare(b))
})

/* ---------- 刷新反馈 ---------- */

const spinning = ref(false)
let spinTimer: number | undefined

function onRefresh() {
  spinning.value = true
  window.clearTimeout(spinTimer)
  spinTimer = window.setTimeout(() => (spinning.value = false), 700)
  void refresh()
}
</script>

<template>
  <div class="relative min-h-full">
    <div class="aurora" aria-hidden="true" />
    <div class="grain" aria-hidden="true" />

    <header
      class="sticky top-0 z-40 border-b border-line/70 bg-bg/70 backdrop-blur-xl backdrop-saturate-150"
    >
      <div class="mx-auto flex h-16 max-w-5xl items-center justify-between gap-4 px-5">
        <a href="/" class="flex items-center gap-2.5">
          <img
            src="/avatar.jpg"
            alt=""
            width="28"
            height="28"
            class="size-7 rounded-full object-cover ring-1 ring-line-strong/50"
          />
          <span class="font-display text-[17px] leading-none">
            zayju<span class="text-accent">.</span>
            <span class="ml-1.5 font-sans text-xs tracking-wide text-ink-dim">status</span>
          </span>
        </a>

        <div class="flex items-center gap-2.5">
          <span
            class="hidden items-center gap-2 rounded-full border border-line bg-bg-soft/70 py-1.5 pl-2.5 pr-3 text-xs sm:inline-flex"
          >
            <span class="relative flex size-2">
              <span
                v-if="overall === 'up'"
                class="absolute inline-flex size-full animate-ping rounded-full bg-up opacity-60"
              />
              <span class="relative inline-flex size-2 rounded-full" :class="dotClass[overall]" />
            </span>
            <span class="text-ink-dim">{{ overallLabel }}</span>
          </span>

          <div
            class="relative flex rounded-full border border-line bg-bg-soft/70 p-0.5"
            role="group"
            aria-label="Theme"
          >
            <span
              class="absolute left-0.5 top-0.5 size-7 rounded-full bg-bg-card shadow-sm transition-transform duration-300 ease-out"
              :class="dark ? 'translate-x-7' : ''"
              aria-hidden="true"
            />
            <button
              type="button"
              class="relative z-10 grid size-7 place-items-center rounded-full transition-colors"
              :class="!dark ? 'text-accent' : 'text-ink-dim hover:text-ink'"
              :aria-pressed="!dark"
              aria-label="Light theme"
              @click="setTheme(false)"
            >
              <AppIcon name="sun" class="size-3.5" />
            </button>
            <button
              type="button"
              class="relative z-10 grid size-7 place-items-center rounded-full transition-colors"
              :class="dark ? 'text-accent' : 'text-ink-dim hover:text-ink'"
              :aria-pressed="dark"
              aria-label="Dark theme"
              @click="setTheme(true)"
            >
              <AppIcon name="moon" class="size-3.5" />
            </button>
          </div>

          <button
            type="button"
            class="grid size-8 place-items-center rounded-full border border-line bg-bg-soft/70 text-ink-dim transition-colors hover:text-ink"
            aria-label="Refresh"
            @click="onRefresh"
          >
            <AppIcon name="refresh" class="size-3.5" :class="spinning ? 'animate-spin' : ''" />
          </button>
        </div>
      </div>
    </header>

    <main class="mx-auto max-w-5xl px-5">
      <section class="pb-12 pt-14 text-center sm:pt-20">
        <div class="relative mx-auto size-24">
          <span class="avatar-glow" :data-state="overall" aria-hidden="true" />
          <span class="avatar-ring absolute -inset-1.5" aria-hidden="true" />
          <img
            src="/avatar.jpg"
            alt="zayju"
            width="96"
            height="96"
            class="relative size-24 rounded-full object-cover ring-1 ring-line-strong/60"
          />
          <span
            class="absolute bottom-0 right-0 size-5 rounded-full border-[3px] border-bg"
            :class="dotClass[overall]"
            :title="overallLabel"
          />
        </div>

        <p class="mt-6 text-[11px] font-medium uppercase tracking-[0.24em] text-ink-dim">
          example.com · status
        </p>

        <h1
          class="font-display mx-auto mt-3 max-w-3xl text-4xl leading-[1.08] tracking-tight sm:text-6xl"
        >
          <span class="text-accent">zayju.</span>
          <Transition name="phrase" mode="out-in">
            <span :key="phraseIndex" class="inline-block">
              {{ phrase.verb }}&nbsp;<em class="italic">{{ phrase.rest }}</em>
            </span>
          </Transition>
        </h1>

        <div class="mt-7 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-sm">
          <span
            class="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[13px] font-medium"
            :class="chipClass[overall]"
          >
            <span class="relative flex size-2">
              <span
                v-if="overall === 'up'"
                class="absolute inline-flex size-full animate-ping rounded-full bg-up opacity-60"
              />
              <span class="relative inline-flex size-2 rounded-full" :class="dotClass[overall]" />
            </span>
            {{ overallLabel }}
          </span>
          <span class="text-[13px] tabular-nums text-ink-dim">
            {{ updatedText ?? 'connecting…' }}
          </span>
        </div>
      </section>

      <section aria-label="Overview" class="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div v-for="stat in stats" :key="stat.label" class="card p-4">
          <p class="text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-dim">
            {{ stat.label }}
          </p>
          <p class="font-display mt-2 text-2xl tracking-tight tabular-nums" :class="stat.tone">
            {{ stat.value }}
          </p>
          <p class="mt-1 text-[11px] text-ink-dim">{{ stat.sub }}</p>
        </div>
      </section>

      <div class="mt-14 space-y-12 pb-2">
        <div
          v-if="error"
          class="card border-down/25 bg-down/5 p-4 text-sm text-down"
          role="alert"
        >
          API error: {{ error }}
        </div>

        <div v-if="loading" class="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
          <div v-for="i in 6" :key="i" class="card p-4">
            <div class="flex items-start justify-between gap-3">
              <div class="space-y-2">
                <div class="h-4 w-28 animate-pulse rounded-full bg-bg-inset" />
                <div class="h-3 w-36 animate-pulse rounded-full bg-bg-inset" />
              </div>
              <div class="h-5 w-14 animate-pulse rounded-full bg-bg-inset" />
            </div>
            <div class="mt-4 h-9 animate-pulse rounded-lg bg-bg-inset" />
            <div class="mt-3 h-3 w-40 animate-pulse rounded-full bg-bg-inset" />
          </div>
        </div>

        <p
          v-else-if="!endpoints.length"
          class="py-16 text-center text-sm text-ink-dim"
        >
          No endpoints returned by the API.
        </p>

        <template v-else>
          <section v-for="[group, list] in groups" :key="group">
            <div class="mb-4 flex items-center gap-3">
              <h2 class="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-dim">
                {{ group }}
              </h2>
              <span class="h-px flex-1 bg-line" />
              <span class="font-mono text-[10px] text-ink-dim">{{ list.length }}</span>
            </div>
            <div class="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
              <EndpointCard v-for="endpoint in list" :key="endpoint.key" :endpoint="endpoint" />
            </div>
          </section>
        </template>
      </div>
    </main>

    <footer class="mx-auto mt-20 max-w-5xl px-5 pb-16">
      <div class="border-t border-line pt-10">
        <div class="grid gap-10 sm:grid-cols-[1.1fr_1fr]">
          <div>
            <div class="flex items-center gap-3">
              <img
                src="/avatar.jpg"
                alt=""
                width="36"
                height="36"
                class="size-9 rounded-full object-cover ring-1 ring-line-strong/50"
              />
              <div>
                <p class="font-display text-lg leading-none">
                  zayju<span class="text-accent">.</span>
                </p>
                <a
                  href="https://example.com"
                  target="_blank"
                  rel="noreferrer"
                  class="mt-1 inline-flex items-center gap-1 text-xs text-ink-dim transition-colors hover:text-accent"
                >
                  example.com
                  <AppIcon name="arrow" class="size-3" />
                </a>
              </div>
            </div>
            <p class="mt-4 max-w-xs text-xs leading-relaxed text-ink-dim">
              A quiet watchtower over every service. Powered by the Gatus API, Vue and Tailwind.
            </p>
          </div>

          <ul class="grid content-start gap-3 sm:grid-cols-2">
            <li
              v-for="(p, i) in phrases"
              :key="p.verb"
              class="flex items-baseline gap-3"
            >
              <span class="font-mono text-[10px] text-accent">
                {{ String(i + 1).padStart(2, '0') }}
              </span>
              <span class="font-display text-sm text-ink-dim">
                <span class="text-ink">zayju.</span> {{ p.verb }}
                <em class="italic">{{ p.rest }}</em>
              </span>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  </div>
</template>
