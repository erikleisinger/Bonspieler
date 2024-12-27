<template>
<div>
  <DrawButton v-for="draw in Array.from(Array((drawCount)).keys())" :key="draw" :drawNumber="draw + 1"
    :selected="selectedDraw === draw + 1" :numGames="gamesPerDraw[draw + 1]?.length" @click="selectDraw(draw + 1)" />
</div>
</template>
<script setup lang="ts">

import { computed } from 'vue';
import DrawButton from './DrawButton.vue';
import { useBracket } from '../lib/useBracket';
import { storeToRefs } from 'pinia';

const props = defineProps<{
  bracketId: string,
  modelValue: number | null
}>()

const emit = defineEmits(['update:modelValue'])

const bracketStore = useBracket(props.bracketId)
const { gamesIndex } = storeToRefs(bracketStore)

const selectedDraw = computed({
  get() {
    return props.modelValue
  },
  set(val) {
    emit('update:modelValue', val)
  }
})

function selectDraw(drawNum: number) {
  selectedDraw.value = drawNum;
}

const gamesPerDraw = computed(() => {
  return Array.from(gamesIndex.value.entries()).reduce((all, [gameId, {
    drawNumber
  }]) => {
    if (!all[drawNumber]) {
      return {
        ...all,
        [drawNumber]: [gameId]
      }
    }
    return {
      ...all,
      [drawNumber]: [...all[drawNumber], gameId]
    }
  }, {})
})

const drawCount = computed(() => Object.keys(gamesPerDraw.value).length)


</script>
