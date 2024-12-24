<template>
<div
  class="flex  gap-2 rounded-lg mb-1 py-1 px-2 border-2 bg-white hover:bg-gray-200 hover:text-slate-900 cursor-pointer min-w-[200px]"
  :class="{

    [`border-blue-500 border-2`]: selected
  }">

  <DrawColorIcon class="w-[12px] h-[12px] mt-[0.45rem]" :drawNumber="drawNumber" />
  <div>
    <div>
      Draw {{ drawNumber }}
    </div>
    <div class="text-xs -mt-1 text-slate-600">{{ numGames }} {{
      `game${numGames > 1 ? 's' : ''}` }}</div>
  </div>

</div>
</template>
<script setup lang="ts">
import DrawColorIcon from '@/shared/ui/DrawColorIcon.vue';
const props = defineProps<{
  drawNumber: number,
  numGames: number,
  selected: boolean,
}>()
</script>
