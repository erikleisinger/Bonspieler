<template>
<div v-if="game" class="bg-white rounded-xl px-2 py-2 w-[200px] border-2 h-fit transform-all" ref="el" :class="{
  'border-red-500': loser,
  'border-amber-500': winner,
  'hover:bg-blue-500': !!teamToAssignId,
  'border-blue-500 hover:bg-blue-50 cursor-pointer ': available && !loser && !winner,
  'opacity-30': opaque,


}">
  <div class="flex justify-between mb-2">
    <div class="flex gap-1 ">

      <NumberBubble :class="getDrawColor(game.drawNumber)" class="text-white text-xs absolute translate-y-[-25%]">
        <div class="mt-[1px]"> {{
          game.readableId }}</div>

      </NumberBubble>

    </div>

    <div class="text-xs text-right rounded-lg  w-fit  px-2  text-red-500">
      <div v-if="loserConnection" class="flex gap-1 items-center">
        Loser to {{ loserConnection.readableId }}


      </div>
      <div v-else>Loser out</div>
    </div>
  </div>
  <div class="bg-gray-100 rounded-lg overflow-hidden">
    <div class="text-sm whitespace-nowrap overflow-hidden overflow-ellipsis border-b-[1px] border-gray-300 py-1  px-2"
      :class="{
        'bg-gray-100 hover:bg-gray-200': !!teams[0],
        'bg-blue-100': !teams[0],

      }">
      {{
        teams[0] || 'Starting team' }}</div>
    <div class="text-sm whitespace-nowrap overflow-hidden overflow-ellipsis py-1  px-2" :class="{
      'bg-gray-100 hover:bg-gray-200': !!teams[1],
      'bg-blue-100': !teams[1],

    }">{{
      teams[1] || 'Starting team' }}
    </div>
  </div>
  <slot />
</div>
</template>
<script setup lang="ts">
import { useElementHover } from '@vueuse/core';
import { ref, watch, computed } from 'vue'
import { useDrawColor } from '@/shared/composables/useDrawColor'
import NumberBubble from '@/shared/ui/NumberBubble.vue';
import { useBracket } from '../lib/useBracket';
import { storeToRefs } from 'pinia';
const props = defineProps<{
  available?: boolean,
  bracketId: string
  opaque?: boolean,
  gameId: string,
  loser?: boolean;
  winner?: boolean;
}>()
const bracketStore = useBracket(props.bracketId)
const { getFullGame } = bracketStore
const { teamToAssignId } = storeToRefs(bracketStore)

const { getDrawColor } = useDrawColor()

const el = ref(null)
const emit = defineEmits(['hover'])
const hovered = useElementHover(el)
watch(hovered, (val) => {
  emit('hover', val)
})

const game = computed(() => getFullGame(props.gameId))



const teams = computed(() => {

  const { origins } = game.value || {};
  const { loser = [], winner = [] } = origins || {};

  const realTeams = game.value?.teams || [];

  const all = [...loser.map(({ id }) => {
    const { readableId } = getFullGame(id) || {};
    return `Loser ${readableId}`;
  }), ...winner.map(({ id }) => {
    const { readableId } = getFullGame(id) || {};
    return `Winner ${readableId}`;
  })];
  let t = []
  if (all.length === 0) {
    t = realTeams.map(({ name }) => name)
  } else if (all.length === 1) {
    t = [...all, realTeams[0]?.name]
  } else {
    t = [...all]
  }
  return t


})

const connections = computed(() => {
  return game.value?.game?.connections || {};
})

const loserConnection = computed(() => !connections.value?.loser ? null : getFullGame(connections.value.loser))
</script>
