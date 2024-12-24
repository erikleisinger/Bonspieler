<template>
<StageCard class="relative ">
  <div
    class="absolute inset-0 bg-emerald-100 hover:bg-emerald-500 text-emerald-500 hover:text-white hover:fill-white fill-emerald-500  rounded-[inherit] group grid grid-rows-[1fr,_auto]">
    <div class="relative">
      <FamilyTree class="absolute inset-0 m-auto  " />
    </div>
    <div class="text-center rounded-xl p-2 mb-4   font-bold text-4xl">
      <div>{{ bracket?.name || 'Bracket' }}</div>
      <div class="text-sm" v-if="bracket?.start_team_count">{{ bracket.start_team_count }} teams</div>
    </div>
  </div>

</StageCard>
</template>
<script setup lang="ts">
import type { Tables } from '@/shared/types/database.types';
import StageCard from './StageCard.vue';
import FamilyTree from '@/shared/icons/FamilyTree.vue';

const props = defineProps<{
  bracket?: Tables<'bracket_groups'>
}>()
</script>
