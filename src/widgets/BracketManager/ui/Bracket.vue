<template>
<div class="p-6 relative" :style="{
  height: `${containerHeight}px`,
}" @click="clickOutside">
  <slot />
  <div class="absolute inset-4 gap-8  flex w-fit">
    <div class="flex flex-col min-w-[300px] relative " v-for="round in rounds" :key="round">
      <div class="absolute bg-gray-100 rounded-xl inset-0 z-[0]"></div>
      <header class="sticky top-0  z-20 w-full bg-white shadow-lg p-2 rounded-xl">
        <div class="bg-blue-100 rounded-md text-blue-500 text-center round-handle py-2 font-semibold ">
          Round {{ round }}
        </div>
        <slot name="append-round" v-bind:round="round" />
      </header>


      <div class="flex flex-col grow relative z-[1]" :id="uniqueId + `_BRACKET_ROUND_${round}`">
        <Draggable :yAxis="!!editable" class="absolute" handle="handle"
          v-for="game in editedGames.filter(({ roundNumber }) => roundNumber === round)"
          :id="`${uniqueId}_BRACKET_GAME_${game.id}`" :boundaryElementSelector="`#${uniqueId}_BRACKET_ROUND_${round}`"
          :x="game.transform.x" :y="game.transform.y" @update="onDragUpdate(game.id, $event)" :key="game.id" :class="{
            'z-50': selectedGameId === game.id,
          }">
          <div>
            <div class="flex m-4 relative">
              <slot name="prepend-game" />
              <BracketGame :game="game" :data-gameid="game.id" class="cursor-pointer" @click.stop="onClick(game)"
                @viewTeamConnection="$emit('viewTeamConnection', {
                  teamId: $event,
                  gameId: game.id
                })" :id="`${uniqueId}_CONNECTABLE_GAME_${game.id}`" @hover="onHover(game, $event)"
                :available="isGameAvailable(game)"
                :opaque="availableGames && !!availableGames.length && !isGameAvailable(game)"
                :loser="(mode === 'setLoser' && selectedGameId !== game.id && isGameAvailable(game)) || loserGame === game.id"
                :winner="winnerGame === game.id">

                <template #prepend>
                  <div class="flex justify-between mb-2">
                    <div class="flex gap-1 ">
                      <NumberBubble :class="getDrawColor(drawNumbers[game.id])"
                        class="text-white text-xs absolute translate-y-[-25%]">
                        <div class="mt-[1px]"> {{
                          game.readableId }}</div>

                      </NumberBubble>
                      <!-- <div class="w-fit text-xs   rounded-lg  ">
                          Draw {{ drawNumbers[game.id] }}
                        </div> -->
                    </div>

                    <div class="text-xs text-right rounded-lg  w-fit  px-2  text-red-500">
                      <div v-if="game.connections.loser">
                        Loser {{ game.connections.loser }}


                      </div>
                      <div v-else>
                        Loser out
                      </div>
                    </div>
                  </div>

                </template>



                <NumberBubble
                  class="bg-amber-500 absolute left-0 top-0 translate-x-[-40%] translate-y-[-40%] transition-all"
                  :class="{
                    'scale-0': winnerGame !== game.id,
                    'scale-100': winnerGame === game.id,
                  }">
                  <Trophy class=" h-[20px] w-[20px] mb-[-3px]  fill-white" />
                </NumberBubble>

                <NumberBubble
                  class="bg-red-500 absolute left-0 top-0 translate-x-[-40%] translate-y-[-40%] transition-all" :class="{
                    'scale-0': loserGame !== game.id,
                    'scale-100': loserGame === game.id,
                  }">
                  <BrokenHeart class=" h-[20px] w-[20px] mb-[-3px]  fill-white" />
                </NumberBubble>
              </BracketGame>
              <slot name="append-game" v-bind:game="game" v-bind:round="round" />
              <div class="relative grow ">
                <div class="absolute top-0 bottom-0 m-auto h-[2px]">
                  <Connection v-if="connectionsVisible" :connectionId="getConnectionId(game)"
                    :opaque="(availableGames && !!availableGames.length && !isGameAvailable(game)) || loserGame === game.id || winnerGame === game.id"
                    :lineWidth="game.transform.lineWidth" />
                  <Connection v-if="connectionsVisible && originId === `${uniqueId}_CONNECTABLE_GAME_${game.id}`"
                    :connectionId="connectionId"
                    :opaque="(availableGames && !!availableGames.length && !isGameAvailable(game)) || loserGame === game.id || winnerGame === game.id" />
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
import NumberBubble from '@/shared/ui/NumberBubble.vue';
import Trophy from '@/shared/icons/Trophy.vue'
import BrokenHeart from '@/shared/icons/BrokenHeart.vue'
import { watch, ref, nextTick, onMounted, computed } from 'vue'
import { useDraggableStore } from '../lib/useDraggable';
import { useConnectionStore } from '../lib/useConnection'
import { useDrawColor } from '@/shared/composables/useDrawColor'
import { storeToRefs } from 'pinia';
import { useBracket } from '../lib/useBracket'



const { getDrawColor } = useDrawColor()

const props = defineProps({
  games: Object,
  bracketId: String,
  editable: Boolean,
  mode: String,
  selectedGameId: {
    type: String,
    default: null
  },
  availableGames: {
    type: Array,
    default: () => []
  },
  drawNumbers: Object,
  uniqueId: String,
  rounds: Array,
})
const { useBracketStore } = useBracket(props.bracketId);
const bracketStore = useBracketStore();
const { winnerGame, loserGame } = storeToRefs(bracketStore);
const { setSelectedGameId } = bracketStore;


const emit = defineEmits(['selectGame', 'clear', 'viewTeamConnection', 'hover', 'update:dragPosition'])

const { dragElementId } = storeToRefs(useDraggableStore())

const { originId, connectionId } = storeToRefs(useConnectionStore());

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
    }, 10)
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
    }, 10)
  } else {
    clearInterval(interval.value)
    interval.value = null;
  }
})

const editedGames = computed(() => props.games)

const gamesCount = computed(() => (props.games || []).length)

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
  return `${props.uniqueId}_CONNECTABLE_GAME_${winner}`;
}



function onDragUpdate(gameId, updates) {
  emit('update:dragPosition', {
    gameId,
    updates
  })

}

function isGameAvailable(game) {
  return props.availableGames.includes(game.id)
}

const containerHeight = ref(500)

function setContainerHeight() {
  nextTick(() => {
    const lowestEl = editedGames.value.reduce((lowest, { id }) => {
      const el = document.getElementById(`${props.uniqueId}_BRACKET_GAME_${id}`)
      if (!el) return lowest;
      const rect = el.getBoundingClientRect();
      const top = new WebKitCSSMatrix(window.getComputedStyle(el).transform).m42
      if (top + rect.height > lowest) return top + rect.height;
      return lowest;
    }, 0) || 500
    containerHeight.value = lowestEl + 200
  })

}

watch(gamesCount, () => {
  setContainerHeight()
})

function clickOutside() {
  emit('clear')
}

function onHover(game, isHovered) {
  emit('hover', {
    game,
    isHovered
  })

}

</script>
