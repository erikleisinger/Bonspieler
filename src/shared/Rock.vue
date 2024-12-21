<template><svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="50" cy="50" r="47.5" fill="#d1d5db" stroke="#c2c8cf" stroke-width="5" />
  <circle cx="50" cy="50" r="31" :fill="colors.foreground" :stroke="colors.background" stroke-width="4" />
  <rect x="44" y="12" width="12" height="53" rx="6" :fill="colors.background" />
</svg></template>
<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  color: 'red' | 'yellow' | 'blue'
}>()

const colors = computed(() => {
  return {
    blue: {
      foreground: '#2563eb',
      background: '#1e3a8a',
    },
    red: {
      foreground: '#dc2626',
      background: '#7f1d1d',
    },
    yellow: {
      foreground: '#facc15',
      background: '#ca8a04'
    }
  }[props.color]
})
</script>
