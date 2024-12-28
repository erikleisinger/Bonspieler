<template>
<div class="p-6 relative transition-all" :style="{
  height: `${containerHeight}px`,
}" :id="getBracketElementId(uniqueId)">
  <slot />
  <div class="absolute inset-4 gap-8  flex w-fit">
    <div class="flex flex-col min-w-[300px] relative " v-for="round in rounds" :key="round">
      <div class="absolute bg-gray-100 rounded-xl inset-0 z-[0]"></div>
      <RoundHeader :round="round" class="sticky top-0  z-20 w-full ">
        <slot name="append-round" v-bind:round="round" />
      </RoundHeader>
      <div class="flex flex-col grow relative z-[1]" :id="getBracketRoundElementId(uniqueId, round)">
        <Draggable :yAxis="!!editable" class="absolute" handle="handle"
          v-for="game in games.filter(({ roundNumber }) => roundNumber === round)"
          :id="getBracketGameElementId(uniqueId, game.id)"
          :boundaryElementSelector="'#' + getBracketRoundElementId(uniqueId, round)" :initialX="game.transform.x"
          :initialY="game.transform.y" @update="onDragUpdate(game.id, $event)" :key="game.id" :class="{
            'z-50': selectedGameId === game.id,
          }">
          <div>
            <div class="flex m-4 relative">
              <slot name="prepend-game" />
              <BracketGame :gameId="game.id" :bracketId="bracketId" :data-gameid="game.id" class="cursor-pointer"
                @click.stop="onClick(game)" :id="getConnectableGameElementId(uniqueId, game.id)"
                @hover="onHover(game, $event)" :available="isGameAvailable(game)"
                :opaque="availableGames && !!availableGames.length && !isGameAvailable(game)"
                :loser="(mode === 'setLoser' && selectedGameId !== game.id && isGameAvailable(game)) || loserGame === game.id"
                :winner="winnerGame === game.id">


                <WinnerIconBubble
                  class="bg-amber-500 absolute left-0 top-0 translate-x-[-40%] translate-y-[-40%] transition-all"
                  :class="{
                    'scale-0': winnerGame !== game.id,
                    'scale-100': winnerGame === game.id,
                  }" />

                <LoserIconBubble
                  class="bg-red-500 absolute left-0 top-0 translate-x-[-40%] translate-y-[-40%] transition-all" :class="{
                    'scale-0': loserGame !== game.id,
                    'scale-100': loserGame === game.id,
                  }" />
              </BracketGame>
              <slot name="append-game" v-bind:game="game" v-bind:round="round" />
              <div class="relative grow ">
                <div class="absolute top-0 bottom-0 m-auto h-[2px]" v-if="connectionsVisible">
                  <Connection :connectionId="getConnectionId(game)" @updateLineWidth="emit('updateLineWidth', {
                    newWidth: $event,
                    gameId: game.id
                  })" :editable="editable"
                    :opaque="(availableGames && !!availableGames.length && !isGameAvailable(game)) || loserGame === game.id || winnerGame === game.id"
                    :lineWidth="game.transform.lineWidth" />
                  <slot name="append-connection" v-bind:winnerGame="winnerGame" v-bind:loserGame="loserGame"
                    v-bind:game="game" />

                </div>
              </div>
            </div>

          </div>
        </Draggable>
      </div>

    </div>
    <slot name="append-bracket" />
  </div>

</div>
</template>
<script setup>
import Draggable from './Draggable.vue'
import Connection from './Connection.vue'
import BracketGame from './BracketGame.vue'
import WinnerIconBubble from './WinnerIconBubble.vue'
import LoserIconBubble from './LoserIconBubble.vue'
import RoundHeader from './RoundHeader.vue'
import { watch, ref, nextTick, onMounted, computed } from 'vue'
import { useDraggableStore } from '../lib/useDraggable';
import { useConnectionStore } from '../lib/useConnection'
import { useDrawColor } from '@/shared/composables/useDrawColor'
import { storeToRefs } from 'pinia';
import { useBracket } from '../lib/useBracket'
import { useBracketElement } from '../lib/useBracketElement';
import { useDebounceFn, useThrottleFn } from '@vueuse/core';

const { getBracketRoundElementId, getConnectableGameElementId, getBracketGameElementId, getBracketElementId } = useBracketElement()

const { getDrawColor } = useDrawColor()

const props = defineProps({
  editable: Boolean,
  bracketId: String,
  mode: String,
  availableGames: {
    type: Array,
    default: () => []
  },
  uniqueId: String,
  rounds: Array,
})
const bracketStore = useBracket(props.bracketId);
const { winnerGame, loserGame, selectedGameId } = storeToRefs(bracketStore);
const { getGamesForBracket, getFullGame } = bracketStore;

const games = computed(() => getGamesForBracket(props.uniqueId));



const emit = defineEmits(['selectGame', 'clear', 'hover', 'update:dragPosition', 'updateLineWidth'])

const { dragElementId } = storeToRefs(useDraggableStore())

const { connectionId } = storeToRefs(useConnectionStore());

const connectionsVisible = ref(true);
const interval = ref(null);
watch(dragElementId, (val) => {
  if (val) {
    if (interval.value) clearInterval(interval.value)
    interval.value = setInterval(() => {
      connectionsVisible.value = false;
      nextTick(() => {
        connectionsVisible.value = true;
      })
    }, 100)
  } else {
    clearInterval(interval.value)
    interval.value = null;
  }

})

watch(connectionId, (val) => {
  if (val) {
    if (interval.value) clearInterval(interval.value)
    interval.value = setInterval(() => {
      connectionsVisible.value = false;
      nextTick(() => {
        connectionsVisible.value = true;
      })
    }, 100)
  } else {
    clearInterval(interval.value)
    interval.value = null;
  }
})


const gamesCount = computed(() => (games.value || []).length)

function onClick(game) {
  emit('selectGame', game)
}

onMounted(() => {
  setContainerHeight()
})

function getConnectionId(game) {
  const { connections } = game;
  const { winner } = connections;
  if (!winner) return null;
  return getConnectableGameElementId(props.uniqueId, winner)
}

const emitDragUpdate = useDebounceFn((gameId, updates) => {
  emit('update:dragPosition', {
    gameId,
    updates
  })
}, 50)

function onDragUpdate(gameId, updates) {
  emitDragUpdate(gameId, updates)
  setContainerHeight();
}

function isGameAvailable(game) {
  return props.availableGames.includes(game.id)
}

const containerHeight = ref(500)

const setContainerHeight = useThrottleFn(() => {
  if (!props.editable) return;
  nextTick(() => {
    const lowestEl = games.value.reduce((lowest, { id }) => {
      const el = document.getElementById(getBracketGameElementId(props.uniqueId, id))
      if (!el) return lowest;
      const rect = el.getBoundingClientRect();
      const top = new WebKitCSSMatrix(window.getComputedStyle(el).transform).m42
      if (top + rect.height > lowest) return top + rect.height;
      return lowest;
    }, 0) || 500
    containerHeight.value = lowestEl + 200
  })

}, 10)

watch(gamesCount, () => {

  setContainerHeight()
})

function onHover(game, isHovered) {
  if (!props.editable) return;
  emit('hover', {
    game,
    isHovered
  })

}

</script>
