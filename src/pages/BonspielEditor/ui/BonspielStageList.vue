<template>
<div class="flex items-center justify-center gap-4">

  <div v-for="stage, index in stages" :key="stage.id" class="flex relative">
    <div class="relative">
      <div
        class="translate-y-[-50%] absolute left-0 right-0 top-0 z-10 text-center bg-white rounded-md mb-2 rounded-xl shadow-sm w-fit text-2xl m-auto p-2 px-4 font-bold">
        Stage {{
          stage.stage_num }}
      </div>
      <StageCardPool v-if="stage.type === 'pool'" @click="emit('selectStage', stage)">

      </StageCardPool>
      <StageCardBracket v-if="stage.type === 'bracket'" @click="emit('selectStage', stage)" :bracket="stage" />
    </div>

  </div>
  <StageCard class="relative" @click="emit('addStage', stages?.length + 1)">
    <div class="absolute inset-0 flex justify-center items-center">
      <div>
        <div class="text-[5rem] text-slate-700 text-center">+</div>
        <div class="text-center text-slate-500 translate-y-[-50%]">Add stage</div>
      </div>

    </div>
  </StageCard>

</div>
</template>
<script setup lang="ts">
import { useBonspiel } from '@/entities/Bonspiel/lib/useBonspiel';
import StageCard from './StageCard.vue';
import StageCardPool from './StageCardPool.vue';
import StageCardBracket from './StageCardBracket.vue';
import NumberBubble from '@/shared/ui/NumberBubble.vue';
const props = defineProps<{
  bonspielId: string,

}>()
const { getBonspielStages } = useBonspiel();
const { data: stages } = getBonspielStages(props.bonspielId)

const emit = defineEmits(['addStage', 'selectStage'])
</script>
