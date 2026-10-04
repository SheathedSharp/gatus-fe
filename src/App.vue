<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { gsap } from 'gsap'
import { endpointState, type GatusEndpoint, type GatusResult } from './api/gatus'
import { useGatus } from './api/useGatus'
import { formatDuration, formatRelative, uptimePercent } from './api/format'
import { now } from './api/useNow'
import AppIcon from './components/AppIcon.vue'
import EndpointCard from './components/EndpointCard.vue'

const { endpoints, error, loading, lastUpdated, refresh } = useGatus(30_000)

/* ---------- 站点信息（通过环境变量注入，仓库内不保留真实域名） ---------- */

const siteHost = import.meta.env.VITE_SITE_HOST ?? 'status.example.com'
const siteUrl = import.meta.env.VITE_SITE_URL ?? 'https://example.com'
const siteLink = siteUrl.replace(/^https?:\/\//, '').replace(/\/+$/, '')

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

/* ---------- 品牌短语（GSAP 轮播） ---------- */

const phrases = [
  { verb: 'Define', rest: 'Everything' },
  { verb: 'Dream', rest: 'Endless' },
  { verb: 'Dare', rest: 'Evolve' },
  { verb: 'Discover', rest: 'Everywhere' },
] as const

const root = ref<HTMLElement | null>(null)
const phraseStage = ref<HTMLElement | null>(null)
let pageMedia: gsap.MatchMedia | undefined

const PHRASE_HOLD = 2.9
const PHRASE_ROLL = 0.72

/**
 * 短语整体做「卷轴」式滚动：上一句向上滚出、下一句从下方同步滚入，
 * 两条补间共享同一时长与缓动，衔接处严丝合缝。
 */
function setupPhraseRoll(stage: HTMLElement) {
  const items = Array.from(stage.querySelectorAll<HTMLElement>('.phrase-item'))
  if (items.length < 2) return

  gsap.set(items, { autoAlpha: 1, yPercent: 100 })
  gsap.set(items[0], { yPercent: 0 })

  let index = 0
  let loop: gsap.core.Timeline | undefined

  const cycle = () => {
    const from = items[index]
    index = (index + 1) % items.length
    const to = items[index]

    // 短语此刻在舞台外，瞬移到下方等待滚入，不可见也不会闪现
    gsap.set(to, { yPercent: 100 })

    loop = gsap.timeline({ delay: PHRASE_HOLD, onComplete: cycle })
    loop
      .to(from, { yPercent: -100, duration: PHRASE_ROLL, ease: 'power3.inOut' }, 0)
      .to(to, { yPercent: 0, duration: PHRASE_ROLL, ease: 'power3.inOut' }, 0)
  }

  cycle()

  return () => loop?.kill()
}

/* ---------- 首屏与数据入场（GSAP） ---------- */

function playIntro() {
  const el = root.value
  if (!el) return

  const hero = Array.from(el.querySelectorAll<HTMLElement>('[data-anim="hero"]'))
  const stats = Array.from(el.querySelectorAll<HTMLElement>('#overview .card'))
  if (!hero.length && !stats.length) return

  gsap.set([...hero, ...stats], { autoAlpha: 0, y: 14 })
  stats.forEach((card) => card.classList.add('no-transition'))

  gsap
    .timeline({
      defaults: { duration: 0.7, ease: 'power3.out' },
      delay: 0.05,
      onComplete: () => stats.forEach((card) => card.classList.remove('no-transition')),
    })
    .to(hero, { autoAlpha: 1, y: 0, stagger: 0.09 })
    .to(
      stats,
      { autoAlpha: 1, y: 0, stagger: 0.07, clearProps: 'transform,opacity,visibility' },
      '-=0.45',
    )
}

let cardsIntroPlayed = false

function playCards() {
  if (cardsIntroPlayed || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  const el = root.value
  if (!el) return

  const targets = Array.from(
    el.querySelectorAll<HTMLElement>('[data-anim="group"], [data-anim="endpoint"]'),
  )
  if (!targets.length) return
  cardsIntroPlayed = true

  targets.forEach((target) => target.classList.add('no-transition'))

  gsap.fromTo(
    targets,
    { autoAlpha: 0, y: 16 },
    {
      autoAlpha: 1,
      y: 0,
      duration: 0.55,
      ease: 'power3.out',
      stagger: { each: 0.045, from: 'start' },
      clearProps: 'transform,opacity,visibility',
      onComplete: () => targets.forEach((target) => target.classList.remove('no-transition')),
    },
  )
}

watch([loading, endpoints], async () => {
  if (loading.value || !endpoints.value.length) return
  await nextTick()
  playCards()
})

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

const statusTone: Record<Overall, string> = {
  up: 'text-up',
  degraded: 'text-degraded',
  down: 'text-down',
  unknown: 'text-ink-dim',
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

/* ---------- 生命周期 ---------- */

onMounted(() => {
  pageMedia = gsap.matchMedia()

  // 减少动态：只静态展示第一句，其余全部跳过
  pageMedia.add('(prefers-reduced-motion: reduce)', () => {
    const first = phraseStage.value?.querySelector<HTMLElement>('.phrase-item')
    if (first) gsap.set(first, { autoAlpha: 1 })
  })

  pageMedia.add('(prefers-reduced-motion: no-preference)', () => {
    const stopPhrase = phraseStage.value ? setupPhraseRoll(phraseStage.value) : undefined
    playIntro()
    return () => stopPhrase?.()
  })
})

onUnmounted(() => {
  pageMedia?.revert()
  window.clearTimeout(spinTimer)
})
</script>

<template>
  <div ref="root" class="relative min-h-full">
    <div class="aurora" aria-hidden="true" />
    <div class="grain" aria-hidden="true" />

    <div
      class="fixed right-4 top-4 z-40 flex items-center rounded-lg border border-line bg-bg-soft p-0.5 shadow-sm sm:right-6 sm:top-5"
    >
      <button
        type="button"
        class="grid size-8 place-items-center rounded-md transition-colors"
        :class="!dark ? 'bg-bg-inset text-accent' : 'text-ink-dim hover:text-ink'"
        :aria-pressed="!dark"
        aria-label="Light theme"
        @click="setTheme(false)"
      >
        <AppIcon name="sun" class="size-4" />
      </button>
      <button
        type="button"
        class="grid size-8 place-items-center rounded-md transition-colors"
        :class="dark ? 'bg-bg-inset text-accent' : 'text-ink-dim hover:text-ink'"
        :aria-pressed="dark"
        aria-label="Dark theme"
        @click="setTheme(true)"
      >
        <AppIcon name="moon" class="size-4" />
      </button>
      <span class="mx-0.5 h-4 w-px bg-line" aria-hidden="true" />
      <button
        type="button"
        class="grid size-8 place-items-center rounded-md text-ink-dim transition-colors hover:text-ink"
        aria-label="Refresh"
        @click="onRefresh"
      >
        <AppIcon name="refresh" class="size-4" :class="spinning ? 'animate-spin' : ''" />
      </button>
    </div>

    <main class="mx-auto max-w-5xl px-5">
      <section class="pb-12 pt-16 text-center sm:pt-24">
        <div class="relative mx-auto size-24" data-anim="hero">
          <span class="avatar-glow" :data-state="overall" aria-hidden="true" />
          <span class="avatar-ring absolute -inset-1.5" aria-hidden="true" />
          <img
            src="/avatar.jpg"
            alt="zayju"
            width="96"
            height="96"
            class="relative size-24 rounded-full object-cover ring-1 ring-line-strong/60"
          />
        </div>

        <p
          class="mt-6 inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.24em] text-ink-dim"
          data-anim="hero"
        >
          <span class="relative flex size-1.5">
            <span
              class="absolute inline-flex size-full animate-ping rounded-full bg-up opacity-60"
            />
            <span class="relative inline-flex size-1.5 rounded-full bg-up" />
          </span>
          {{ siteHost }}
        </p>

        <h1
          class="font-display mx-auto mt-4 flex items-baseline justify-center gap-3 whitespace-nowrap text-[clamp(1.25rem,7.1vw,3.75rem)] font-light tracking-tight"
          aria-label="zayju. Define Everything, Dream Endless, Dare Evolve, Discover Everywhere"
          data-anim="hero"
        >
          <span class="font-medium text-accent">zayju.</span>
          <span ref="phraseStage" class="phrase-stage relative inline-grid select-none" aria-hidden="true">
            <span v-for="p in phrases" :key="p.verb" class="phrase-item col-start-1 row-start-1">
              <em class="italic">{{ p.verb }}</em> <em class="italic">{{ p.rest }}</em>
            </span>
          </span>
        </h1>

        <div
          class="mt-7 flex flex-wrap items-center justify-center gap-x-2.5 gap-y-2 text-[13px]"
          data-anim="hero"
        >
          <span class="inline-flex items-center gap-2 font-medium" :class="statusTone[overall]">
            <span class="relative flex size-2">
              <span
                v-if="overall === 'up'"
                class="absolute inline-flex size-full animate-ping rounded-full bg-up opacity-60"
              />
              <span class="relative inline-flex size-2 rounded-full" :class="dotClass[overall]" />
            </span>
            {{ overallLabel }}
          </span>
          <span class="text-ink-dim/50">·</span>
          <span class="tabular-nums text-ink-dim">{{ updatedText ?? 'connecting…' }}</span>
        </div>
      </section>

      <section id="overview" aria-label="Overview" class="grid grid-cols-2 gap-3 lg:grid-cols-4">
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
        <div v-if="error" class="card border-down/25 bg-down/5 p-4 text-sm text-down" role="alert">
          API error: {{ error }}
        </div>

        <div v-if="loading" class="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
          <div v-for="i in 6" :key="i" class="card p-4">
            <div class="flex items-start justify-between gap-3">
              <div class="space-y-2">
                <div class="h-4 w-28 animate-pulse rounded bg-bg-inset" />
                <div class="h-3 w-36 animate-pulse rounded bg-bg-inset" />
              </div>
              <div class="h-5 w-14 animate-pulse rounded bg-bg-inset" />
            </div>
            <div class="mt-4 h-9 animate-pulse rounded-lg bg-bg-inset" />
            <div class="mt-3 h-3 w-40 animate-pulse rounded bg-bg-inset" />
          </div>
        </div>

        <p v-else-if="!endpoints.length" class="py-16 text-center text-sm text-ink-dim">
          No endpoints returned by the API.
        </p>

        <template v-else>
          <section v-for="[group, list] in groups" :key="group">
            <div class="mb-4 flex items-center gap-3" data-anim="group">
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
                  :href="siteUrl"
                  target="_blank"
                  rel="noreferrer"
                  class="mt-1 inline-flex items-center gap-1 text-xs text-ink-dim transition-colors hover:text-accent"
                >
                  {{ siteLink }}
                  <AppIcon name="arrow" class="size-3" />
                </a>
          </div>
        </div>
        <p class="mt-4 max-w-xs text-xs leading-relaxed text-ink-dim">
          A quiet watchtower over every service. Powered by the Gatus API, Vue and Tailwind.
        </p>
      </div>
    </footer>
  </div>
</template>
