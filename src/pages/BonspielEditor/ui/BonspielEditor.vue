<template>
<div class="fixed inset-0 grid grid-rows-[auto,_1fr,auto] ">
  <header class="bg-blue-500 text-white p-4   flex justify-between">

    <div></div>
    <div class="font-bold text-xl cursor-pointer">Bonspiel Editor</div>
    <div></div>
  </header>
  <div v-if="showEditor" class="relative mx-4 bg-white">
    <PoolManager v-if="showEditor === 'pool'"></PoolManager>

    <BracketManager v-if="showEditor === 'bracket'"></BracketManager>
  </div>
  <div v-else-if="showOptions" class="relative flex items-center justify-center">
    <StageSelect @select="selectStage" />
  </div>
  <div class="relative flex items-center justify-center" v-else>

    <div v-for="stage, index in stages" :key="stage.id" class="flex relative">
      <div class="relative">
        <div
          class="translate-y-[-50%] absolute left-0 right-0 top-0 z-10 text-center bg-white rounded-md mb-2 rounded-xl shadow-sm w-fit text-2xl m-auto p-2 px-4 font-bold">
          Stage {{
            index + 1 }}
        </div>
        <StageCardPool v-if="stage.type === 'pool'">

        </StageCardPool>
        <StageCardBracket v-if="stage.type === 'bracket'" />
      </div>
      <div class="flex items-center px-4">
        <NumberBubble class="bg-emerald-500 text-white text-2xl" style="width: 40px; height: 40px">4</NumberBubble>
      </div>
    </div>
    <StageCard class="relative" @click="showOptions = true">
      <div class="absolute inset-0 flex justify-center items-center">
        <div>
          <div class="text-[5rem] text-slate-700 text-center">+</div>
          <div class="text-center text-slate-500 translate-y-[-50%]">Add stage</div>
        </div>

      </div>
    </StageCard>

  </div>
  <div v-if="showEditor" class="px-4 py-2">
    <div class="bg-white rounded-xl p-4 shadow-md flex justify-between">
      <Button variant="tonal" color="slate" @click="goToStart">Back</Button>
      <Button variant="primary">Save</Button>
    </div>

  </div>
  <div v-else />

</div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import type { BonspielStage, StageType } from '../lib/types';
import StageCard from './StageCard.vue';
import StageCardPool from './StageCardPool.vue';
import StageCardBracket from './StageCardBracket.vue';
import Button from '@/shared/ui/Button.vue';
import StageSelect from './StageSelect.vue'
import NumberBubble from '@/shared/ui/NumberBubble.vue';
import { PoolManager } from '@/widgets/PoolManager';
import { BracketManager } from '@/widgets/BracketManager';

const stages = ref<BonspielStage[]>([{
  id: '1',
  type: 'pool',
  name: 'Pool 1',
}])
const showOptions = ref(false)

const showEditor = ref<StageType | null>(null)

function selectStage(type: StageType) {
  showOptions.value = false
  if (type === 'pool') {
    console.log('pool')
    showEditor.value = 'pool'
  } else if (type === 'bracket') {
    console.log('bracket')
    showEditor.value = 'bracket'
  }
}

function goToStart() {
  showOptions.value = false
  showEditor.value = null
}
</script>
