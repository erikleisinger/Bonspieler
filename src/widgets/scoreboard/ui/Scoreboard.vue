<template>
<div class="flex flex-row gap-4 py-4 overflow-auto" ref="scrollContainer">
  <div class="flex flex-col sticky left-0 transition-all" :class="scrolled ? 'translate-x-[-50%]' : 'bg-white/90'">
    <div class="text-center font-semibold py-1 mb-4" :style="{
      opacity: scrolled ? 0 : 1,
    }">Teams</div>
    <div class="flex items-center transition-all h-[100px]">
      <Rock :color="props.homeColor" :class="scrolled ? 'h-[40px] w-[40px]' : 'h-[100px] w-[100px]'"
        class="transition-all" />

    </div>
    <div class="flex items-center mt-4 h-[100px]">
      <Rock :color="props.awayColor" :class="scrolled ? 'h-[40px] w-[40px]' : 'h-[100px] w-[100px]'"
        class="transition-all" />
    </div>
  </div>
  <div v-for="s, index in score" :key="index">

    <ScoreboardColumn :score="score[index]" @update:score="updateScore(index, $event)" :title="`End ` + (index + 1)">
      <ShakeHandsButton v-if="handshakes && score[index][0] === 'X'" class="w-8 h-8 bg-black/50 opacity-75" />
      <BellButton v-if="bellRung && score[index][0] === 'X'" class="w-8 h-8 bg-black/50 opacity-75" />
    </ScoreboardColumn>
    <div class="flex gap-2 justify-center mt-2" v-if="index !== score.length - 1">
      <ShakeHandsButton class="w-8 h-8 bg-indigo-500 hover:bg-indigo-600 cursor-pointer" @click="shake(index)" />
      <BellButton class="w-8 h-8 bg-amber-500 hover:bg-amber-600 cursor-pointer" @click="bell(index)" />
    </div>
  </div>
</div>
</template>
<script setup lang="ts">
import ScoreboardColumn from './ScoreboardColumn.vue';
import ShakeHandsButton from './ShakeHandsButton.vue'
import BellButton from './BellButton.vue';
import Rock from '@/shared/Rock.vue'
import { useScoreboard } from '../lib/useScoreboard'
import type { EndScore } from '../lib/types';
import { ref, computed } from 'vue'
import { useScroll } from '@vueuse/core';

const props = withDefaults(defineProps<{
  modelValue: EndScore[],
  ends?: number,
  homeColor?: 'red' | 'yellow' | 'blue',
  awayColor?: 'red' | 'yellow' | 'blue',
}>(), {
  ends: 8,
  homeColor: 'red',
  awayColor: 'yellow',
})

const emit = defineEmits(['update:modelValue', 'update:total'])

const editedScore = computed({
  get() {
    return props.modelValue
  },
  set(newScore: EndScore[]) {
    emit('update:modelValue', newScore)
  }
})

const { score, handshakes, bellRung, updateScore, shake, bell } = useScoreboard({
  ends: 8,
  onUpdateScore: (newScore) => {
    editedScore.value = newScore
  },
})

const scrollContainer = ref<HTMLElement>()
const { x } = useScroll(scrollContainer)
const scrolled = computed(() => x.value >= 100)


</script>
