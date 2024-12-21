<template>
<StageCard class="relative ">
  <div class="absolute inset-0 bg-emerald-100 hover:bg-emerald-500 rounded-[inherit] group grid grid-rows-[1fr,_auto]">
    <div class="relative">
      <FamilyTree class="absolute inset-0 m-auto fill-emerald-500 group-hover:fill-white" />
    </div>
    <div class="text-center rounded-xl p-2 mb-4  text-emerald-500 group-hover:text-white font-bold text-4xl">
      Bracket</div>
  </div>

</StageCard>
</template>
<script setup lang="ts">
import StageCard from './StageCard.vue';
import FamilyTree from '@/shared/icons/FamilyTree.vue';
</script>
