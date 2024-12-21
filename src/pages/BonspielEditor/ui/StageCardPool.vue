<template>
<StageCard class="relative ">
  <div class="absolute inset-0 bg-indigo-100 hover:bg-indigo-500 rounded-[inherit] group grid grid-rows-[1fr,_auto]">
    <div class="relative">
      <RoundTable class="absolute inset-0 m-auto fill-indigo-500 group-hover:fill-white" />
    </div>
    <div class="text-center rounded-xl p-2 mb-4  text-indigo-500 group-hover:text-white font-bold text-4xl">
      Pool</div>
    <slot />
  </div>

</StageCard>
</template>
<script setup lang="ts">
import StageCard from './StageCard.vue';
import RoundTable from '@/shared/icons/RoundTable.vue';
</script>
