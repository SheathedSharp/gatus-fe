<script setup lang="ts">
import type { ServiceIconName } from '../api/presentation'

defineProps<{ name: ServiceIconName }>()
</script>

<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.7"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <!-- Firecrawl：火苗 -->
    <template v-if="name === 'firecrawl'">
      <path
        d="M12 3.5c.9 3.2 2.6 4.9 4 6.9a6.3 6.3 0 0 1 1.5 4.1 5.5 5.5 0 1 1-11 0c0-1.6.6-3.1 1.7-4.5.2 1.3.8 2.3 1.8 3-.4-3.3.1-6.4 2-9.5Z"
      />
    </template>

    <!-- SearXNG：放大镜 -->
    <template v-else-if="name === 'searxng'">
      <circle cx="10.5" cy="10.5" r="6.25" />
      <path d="m15.3 15.3 4.4 4.4" />
    </template>

    <!-- Hermes：带翼头盔 -->
    <template v-else-if="name === 'hermes'">
      <path d="M5.25 12.25a6.75 6.75 0 0 1 13.5 0" />
      <path d="M5.25 12.25h13.5" />
      <path d="M9.75 12.25v3.25a2.25 2.25 0 0 0 4.5 0v-3.25" />
      <path d="M5.25 12.25c-1.7 0-3.1-.7-4-2 1.5-.1 2.9.2 4 1" />
      <path d="M18.75 12.25c1.7 0 3.1-.7 4-2-1.5-.1-2.9.2-4 1" />
    </template>

    <!-- Woodpecker：啄木鸟 -->
    <template v-else-if="name === 'woodpecker'">
      <path d="M18.2 3.5v17" />
      <ellipse cx="11.6" cy="11.4" rx="3.6" ry="5" transform="rotate(14 11.6 11.4)" />
      <circle cx="13.6" cy="5.6" r="2.4" />
      <path d="M15.9 5.2l2.3-.2" />
      <path d="M9.2 16.2 7.6 19" />
      <circle cx="14.2" cy="5.1" r="0.35" fill="currentColor" stroke="none" />
    </template>

    <!-- Dozzle：日志终端 -->
    <template v-else-if="name === 'dozzle'">
      <rect x="3" y="4.5" width="18" height="15" rx="2.5" />
      <path d="M3 8.5h18" />
      <path d="m6.8 12.2 1.8 1.8-1.8 1.8" />
      <path d="M11.5 15.8h5.7" />
    </template>

    <!-- wb-proxy：流量转发 -->
    <template v-else-if="name === 'proxy'">
      <path d="M4 8h14.5m0 0-3-3m3 3-3 3" />
      <path d="M20 16H5.5m0 0 3-3m-3 3 3 3" />
    </template>

    <!-- SSH：终端提示符 -->
    <template v-else-if="name === 'terminal'">
      <path d="m4.5 6.5 5.5 5.5-5.5 5.5" />
      <path d="M12.5 17.5h7" />
    </template>

    <!-- RDP：远程桌面 -->
    <template v-else-if="name === 'desktop'">
      <rect x="3" y="4.5" width="18" height="12" rx="2" />
      <path d="M12 16.5v4" />
      <path d="M9 20.5h6" />
    </template>

    <!-- Agent：星芒 -->
    <template v-else-if="name === 'agent'">
      <path
        d="M12 3.5c.7 4.4 2.1 5.8 6.5 6.5-4.4.7-5.8 2.1-6.5 6.5-.7-4.4-2.1-5.8-6.5-6.5 4.4-.7 5.8-2.1 6.5-6.5Z"
      />
      <path
        d="M18 15.5c.3 1.8.9 2.4 2.7 2.7-1.8.3-2.4.9-2.7 2.7-.3-1.8-.9-2.4-2.7-2.7 1.8-.3 2.4-.9 2.7-2.7Z"
      />
    </template>

    <!-- Service：立方体 -->
    <template v-else-if="name === 'service'">
      <path d="M12 3.25 20 7.75v8.5L12 20.75l-8-4.5v-8.5l8-4.5Z" />
      <path d="m4 7.75 8 4.5 8-4.5" />
      <path d="M12 12.25v8.5" />
    </template>

    <!-- Node：服务器机架 -->
    <template v-else>
      <rect x="3.5" y="4" width="17" height="7" rx="2" />
      <rect x="3.5" y="13" width="17" height="7" rx="2" />
      <path d="M7.2 7.5h.01M7.2 16.5h.01" />
    </template>
  </svg>
</template>
