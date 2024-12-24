<template>
<div class="fixed inset-0 grid grid-rows-[auto,_1fr]">
  <div class="cursor-pointer" @click="editable = !editable">{{ editable ? 'End edit' : 'start edit' }}</div>
  <div class="relative">
    <BracketManager :editable="editable" :uniqueId="uniqueId"></BracketManager>
  </div>

</div>
</template>
<script setup lang="ts">
import { ref, watch, onBeforeMount } from 'vue'
import { useDebounceFn } from '@vueuse/core';
import BracketManager from './BracketManager.vue'
import { useBracket } from '../lib/useBracket';
import { storeToRefs } from 'pinia';
import { useUniqueId } from '@/shared/composables/useUniqueId';
const uniqueId = ref(useUniqueId())
const bracketStore = useBracket();
const { games } = storeToRefs(bracketStore)
const editable = ref(false)

const saveLocal = useDebounceFn((val) => {
  localStorage.setItem('games', JSON.stringify(val))
}, 4000)

watch(games, (val) => {
  saveLocal(val)
}, { deep: true })

const initialGames = ref({})
onBeforeMount(() => {
  const g = localStorage.getItem('games')
  if (g) {
    games.value = JSON.parse(g)
  }
})
</script>
