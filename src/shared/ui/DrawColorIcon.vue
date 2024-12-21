<template>
<div class="rounded-full" :class="getDrawColor(drawNumber)" />
</template>
<script setup lang="ts">
import { useDrawColor } from '@/shared/composables/useDrawColor';
const props = defineProps<{
  drawNumber: number | string
}>()

const { getDrawColor } = useDrawColor();
</script>
