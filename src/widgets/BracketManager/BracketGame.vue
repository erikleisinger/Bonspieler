<template>
<div class="bg-white rounded-xl px-2 py-2 w-[200px] border-2 h-fit transform-all" ref="el" :class="{
  'border-red-500': loser,
  'border-amber-500': winner,
  'border-blue-500 hover:bg-blue-50 cursor-pointer ': available && !loser && !winner,
  'opacity-30': opaque,

}">
  <slot name="prepend" />
  <div class="bg-gray-100 rounded-lg overflow-hidden">
    <div class="text-sm whitespace-nowrap overflow-hidden overflow-ellipsis border-b-[1px] py-1 hover:bg-gray-200 px-2"
      @click="viewTeamConnection(teams[0])">
      {{
        teams[0] }}</div>
    <div class="text-sm whitespace-nowrap overflow-hidden overflow-ellipsis py-1 hover:bg-gray-200 px-2"
      @click="viewTeamConnection(teams[1])">{{
        teams[1] }}
    </div>
  </div>
  <slot />
</div>
</template>
<script setup lang="ts">
import { useElementHover } from '@vueuse/core';
import { ref, watch, computed } from 'vue'
const props = defineProps<{
  available?: boolean,
  opaque?: boolean,
  game?: any,
  loser?: boolean;
  winner?: boolean;
}>()

const el = ref(null)
const emit = defineEmits(['hover', 'viewTeamConnection'])
const hovered = useElementHover(el)
watch(hovered, (val) => {
  emit('hover', val)
})

function viewTeamConnection(teamId: string) {
  emit('viewTeamConnection', teamId)
}



const teams = computed(() => {
  const { origins } = props.game || {};
  const { loser = [], winner = [] } = origins || {};
  const all = [...loser.map(({ id }) => `Loser ${id}`), ...winner.map(({ id }) => `Winner ${id}`)];
  let t = []
  if (all.length === 0) {
    t = ['Team 1', 'Team 2']
  } else if (all.length === 1) {
    t = [...all, 'Team 2']
  } else {
    t = [...all]
  }
  return t


})
</script>
