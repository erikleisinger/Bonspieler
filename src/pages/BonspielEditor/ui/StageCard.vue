<template>
<div class="min-h-[400px] min-w-[300px] bg-white p-4 rounded-xl shadow-sm hover:bg-gray-100 cursor-pointer">
  <slot></slot>

</div>
</template>
<script setup lang="ts">
import type { BonspielStage } from '../lib/types';
const props = defineProps<{
  stage?: BonspielStage,
  stageNumber?: number,
}>()

</script>
