<template>
<div class="flex flex-col gap-4 ">
  <div class="text-center font-semibold py-1">{{ title }}</div>
  <ScoreboardSquare @click="addScore(0)" :disabled="disabled">
    <slot> {{ editedScore[0] }}</slot>

  </ScoreboardSquare>
  <ScoreboardSquare :score="score[1]" @click="addScore(1)" :disabled="disabled">
    <slot>{{ editedScore[1] }}</slot>
  </ScoreboardSquare>
</div>
</template>
<script setup lang="ts">
import ScoreboardSquare from './ScoreboardSquare.vue';
import { computed } from 'vue'
const props = defineProps<{
  disabled?: Boolean;
  score: (number | 'X')[];
  title: string
}>()

const emit = defineEmits(['update:score'])

const editedScore = computed({
  get() {
    return props.score;
  },
  set(newScore: (number | 'X')[]) {
    emit('update:score', newScore)
  }
})

function getOtherIndex(index: number) {
  return index === 0 ? 1 : 0
}

function clearOtherScoreIfNotZero(index: number) {
  const otherIndex = getOtherIndex(index)
  if (editedScore.value[otherIndex] === 0) return false;
  const newScore = [...editedScore.value]
  newScore.splice(getOtherIndex(index), 1, 0)
  editedScore.value = newScore;
  return true;
}


function addScore(index: number) {
  const newScore = [...editedScore.value]
  if (editedScore.value[index] === 'X') {
    newScore.splice(index, 1, 0)
    newScore.splice(getOtherIndex(index), 1, 0)
    editedScore.value = newScore

    return;
  }


  const otherScoreIsNotZero = clearOtherScoreIfNotZero(index)
  if (otherScoreIsNotZero) return;


  if (editedScore.value[index] + 1 > 8) {
    newScore.splice(index, 1, 0)
    editedScore.value = newScore
  } else {
    newScore.splice(index, 1, editedScore.value[index] + 1)
    editedScore.value = newScore

  }

};
</script>
