<script setup lang="ts">
defineProps<{ name: 'sun' | 'moon' | 'refresh' | 'arrow' | 'lock' }>()
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
    <template v-if="name === 'sun'">
      <circle cx="12" cy="12" r="3.75" />
      <path
        d="M12 2.75v2.1m0 14.3v2.1m6.54-16.84-1.49 1.49M6.95 17.05l-1.49 1.49M21.25 12h-2.1m-14.3 0h-2.1m16.84 6.54-1.49-1.49M6.95 6.95 5.46 5.46"
      />
    </template>
    <path
      v-else-if="name === 'moon'"
      d="M21.75 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z"
    />
    <path
      v-else-if="name === 'refresh'"
      d="M16.023 9.348h4.992V4.356M2.985 19.644v-4.992h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182"
    />
    <template v-else-if="name === 'lock'">
      <path d="M7.25 10.5V8a4.75 4.75 0 0 1 9.5 0v2.5" />
      <rect x="5" y="10.5" width="14" height="9.5" rx="2" />
      <path d="M12 14.5v2" />
    </template>
    <path v-else d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
  </svg>
</template>
