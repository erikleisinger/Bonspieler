<template>
<div v-if="game" class="bg-white rounded-xl px-2 py-2 w-[200px] border-2 h-fit transform-all" ref="el" :class="{
  'border-red-500': loser,
  'border-amber-500': winner,
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
  <div class=" rounded-md overflow-hidden">
    <div
      class="text-sm whitespace-nowrap overflow-hidden overflow-ellipsis border-b-[1px] border-gray-300 py-1  px-2 flex gap-1 items-center"
      :class="{
        'bg-gray-50 hover:bg-gray-200': !!teams[0],
        'bg-blue-100': !teams[0],

      }">

      {{
        teams[0]?.name || teams[0] || 'Starting team' }}
      <CheckCircle v-if="isWinner(teams[0]?.id)" class="text-emerald-500 h-[18px] w-[18px]" />
    </div>
    <div class="text-sm whitespace-nowrap overflow-hidden overflow-ellipsis py-1  px-2 flex gap-1 items-center" :class="{
      'bg-gray-50 hover:bg-gray-200': !!teams[1],
      'bg-blue-100': !teams[1],

    }">

      {{
        teams[1]?.name || teams[1] || 'Starting team' }}
      <CheckCircle v-if="isWinner(teams[1]?.id)" class="text-emerald-500 h-[18px] w-[18px]" />
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
import CheckCircle from '@/shared/icons/CheckCircle.vue';
import { useBracket } from '../lib/useBracket';

const props = defineProps<{
  available?: boolean,
  bracketId: string
  opaque?: boolean,
  gameId: string,
  loser?: boolean;
  winner?: boolean;
}>()
const bracketStore = useBracket(props.bracketId)
const { getFullGame, getTeamById } = bracketStore


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
  const gameTeams = game.value?.teams || []
  const all = [...loser.map(({ id }) => ({
    originGameId: id,
    type: 'loser'
  })), ...winner.map(({ id }) => ({
    originGameId: id,
    type: 'winner'
  })), ...gameTeams.map((t) => ({
    team: t,
    type: 'team'
  }))];



  const x = all.map(({ originGameId: id, type, team }) => {
    if (type === 'loser') {
      const fullGame = getFullGame(id)
      if (!fullGame) return null;
      if (fullGame.game.loserTeamId) return {
        gameY: fullGame.game.transform.y,
        team: getTeamById(fullGame.game.loserTeamId)
      }
      const { readableId } = fullGame;
      return {
        gameY: fullGame.game.transform.y,
        text: `Loser ${readableId}`
      };
    }
    else if (type === 'winner') {
      const fullGame = getFullGame(id)
      if (!fullGame) return null;
      if (fullGame.game.winnerTeamId) return {
        gameY: fullGame.game.transform.y,
        team: getTeamById(fullGame.game.winnerTeamId)
      }
      const { readableId } = fullGame;
      return {
        gameY: fullGame.game.transform.y,
        text: `Winner ${readableId}`
      };
    } else if (type === 'team') {
      return {
        gameY: game.value.game.transform.y,
        team: team
      }
    }

  }).sort((a, b) => a.gameY - b.gameY).map(({ team, text }) => team || text)

  return x;


})

const connections = computed(() => {
  return game.value?.game?.connections || {};
})

const loserConnection = computed(() => !connections.value?.loser ? null : getFullGame(connections.value.loser))

function isWinner(teamId: string) {
  return game.value?.game?.winnerTeamId === teamId;
}
</script>
