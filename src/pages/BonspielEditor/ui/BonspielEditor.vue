<template>
<div class="fixed inset-0 grid grid-rows-[auto,_1fr,auto] ">
  <header class="bg-blue-500 text-white p-4   flex justify-between">

    <div></div>
    <div class="font-bold text-xl cursor-pointer">Bonspiel Editor</div>
    <div></div>
  </header>
  <BonspielList v-if="editorStep === 'select_event'" @select="selectBonspiel" />
  <div v-else-if="editorStep === 'view_stage'" class="relative mx-4 bg-white">


    <PoolManager v-if="selectedStage && selectedStage.type === 'pool'"></PoolManager>

    <BracketManager editable :uniqueId="'bonspiel-editor'" :bracketGroupId="selectedStage.id"
      v-if="selectedStage && selectedStage.type === 'bracket'"></BracketManager>



  </div>
  <div v-else-if="editorStep === 'add_stage'" class="relative flex items-center justify-center">
    <StageSelect @select="selectStage" />
  </div>
  <BonspielStageList class="relative" v-else-if="editorStep === 'select_stage'" :bonspielId="selectedSpiel"
    @addStage="onAddStage" @selectStage="editStage" />

  <div v-if="showEditor" class="px-4 ">
    <div class="bg-white rounded-xl p-4 shadow-md flex justify-between">
      <Button variant="tonal" color="slate" @click="goToStart">Back</Button>
      <Button variant="primary" @click="save">Save</Button>
    </div>

  </div>
  <div v-else />

</div>
</template>
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { BonspielStage, StageType } from '../lib/types';
import StageCard from './StageCard.vue';
import StageCardPool from './StageCardPool.vue';
import StageCardBracket from './StageCardBracket.vue';
import Button from '@/shared/ui/Button.vue';
import StageSelect from './StageSelect.vue'
import NumberBubble from '@/shared/ui/NumberBubble.vue';
import { PoolManager } from '@/widgets/PoolManager';
import { BracketManager } from '@/widgets/BracketManager';
import { useBracket } from '@/widgets/BracketManager/lib/useBracket';
import { useRoute, useRouter } from 'vue-router';
import { BonspielList } from '@/features/MyBonspiels';
import BonspielStageList from './BonspielStageList.vue';

const stages = ref<BonspielStage[]>([])
const showOptions = ref(false)

const showEditor = ref<StageType | null>(null)

const route = useRoute();
const router = useRouter()

type EditorStep = 'select_event' | 'select_stage' | 'add_stage' | 'view_stage'

const editorStep = computed(() => {
  const { hash } = route;
  const step = hash.split('#')[1] || null as EditorStep | null
  if (!step) return 'select_event';
  return step;
})

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


const selectedSpiel = ref<string | null>(null)
function selectBonspiel(bonspielId: string) {
  selectedSpiel.value = bonspielId;
  router.push({
    hash: '#select_stage'
  })

}

function onAddStage() {
  router.push({
    hash: '#add_stage'
  })
}

onMounted(() => {
  if (!selectedSpiel.value) {
    router.push({
      hash: ''
    })
  }
})

const selectedStage = ref(null)
function editStage(stage) {
  selectedStage.value = stage;
  router.push({
    hash: '#view_stage'
  })
}
</script>
