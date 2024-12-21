<template>
<div class="p-6 relative" :style="{
  height: `${containerHeight}px`,
}" @click="clickOutside">

  <div class="absolute inset-4  flex gap-8 pointer-events-none ">
    <div v-for="round in rounds" :key="round" class="min-w-[300px] bg-slate-100 rounded-xl">

    </div>
  </div>

  <div class="fixed  pointer-events-none" :id="mouseShadowId" :style="{
    top: `${mouseY}px`,
    left: `${mouseX}px`,
  }" />
  <div class="absolute inset-4 gap-8 overflow-auto flex">
    <div class="flex flex-col min-w-[300px] relative" v-for="round in rounds" :key="round">
      <header class="sticky top-0  z-20 w-full bg-white shadow-lg p-2 rounded-xl">
        <div class="bg-blue-100 rounded-md text-blue-500 text-center round-handle py-2 font-semibold ">

          Round {{ round }}
        </div>
        <div class="grid grid-cols-2 gap-2">
          <div
            class="bg-gray-100 hover:bg-blue-500 hover:text-white mt-4  w-fit m-auto px-2 rounded-lg py-1  text-center w-full cursor-pointer"
            @click="addGame(round)">
            Add game
          </div>
          <div @click="removeRound(round)"
            class="bg-gray-100 hover:bg-red-500 hover:text-white mt-4  w-fit m-auto px-2 rounded-lg py-1  text-center w-full cursor-pointer">
            Remove round
          </div>
        </div>

      </header>


      <div class="flex flex-col grow" :id="uniqueId + `_BRACKET_ROUND_${round}`">
        <Draggable yAxis class="absolute" handle="handle"
          v-for="game in editedGames.filter(({ roundNumber }) => roundNumber === round)"
          :id="`${uniqueId}_BRACKET_GAME_${game.id}`" :boundaryElementSelector="`#${uniqueId}_BRACKET_ROUND_${round}`"
          :x="game.transform.x" :y="game.transform.y" @update="onDragUpdate(game.id, $event)" :key="game.id" :class="{
            'z-50': selectedGame === game.id,
          }">
          <div>
            <div class="flex m-4 relative">
              <div class="flex items-center  absolute left-0 top-0 bottom-0  z-10" v-if="!originId && !selectedGame">
                <div
                  class="handle cursor-move bg-gray-400 hover:bg-blue-500 rounded-md h-[30px] w-[8px] translate-x-[-3px]">
                </div>
              </div>



              <BracketGame :game="game" :data-gameid="game.id" class="cursor-pointer" @click.stop="onClick(game)"
                @viewTeamConnection="$emit('viewTeamConnection', {
                  teamId: $event,
                  gameId: game.id
                })" :id="`${uniqueId}_CONNECTABLE_GAME_${game.id}`" @hover="onHover(game, $event)"
                :available="isGameAvailable(game)"
                :opaque="availableGames && !!availableGames.length && !isGameAvailable(game)"
                :loser="(mode === 'setLoser' && selectedGameId !== game.id && isGameAvailable(game)) || loser === game.id"
                :winner="winner === game.id">

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
                    'scale-0': winner !== game.id,
                    'scale-100': winner === game.id,
                  }">
                  <Trophy class=" h-[20px] w-[20px] mb-[-3px]  fill-white" />
                </NumberBubble>

                <NumberBubble
                  class="bg-red-500 absolute left-0 top-0 translate-x-[-40%] translate-y-[-40%] transition-all" :class="{
                    'scale-0': loser !== game.id,
                    'scale-100': loser === game.id,
                  }">
                  <BrokenHeart class=" h-[20px] w-[20px] mb-[-3px]  fill-white" />
                </NumberBubble>


                <div class="flex justify-end cursor-pointer" @click="selectGame(game.id)">


                </div>
              </BracketGame>
              <NumberBubble v-if="!selectedGame && !originId && !getConnectionId(game) && round === maxRound"
                class="absolute bg-green-500 right-0 translate-x-[50%] top-0 bottom-0 text-white m-auto cursor-pointer">
                <CheckeredFlag class=" h-[20px] w-[20px] mb-[-3px]  fill-white" />
              </NumberBubble>
              <NumberBubble v-if="!selectedGame && !originId && !getConnectionId(game) && round !== maxRound"
                class="absolute bg-blue-500 right-0 translate-x-[50%] top-0 bottom-0 text-white m-auto cursor-pointer"
                @click.stop="beginConnect(game.id)">+
              </NumberBubble>
              <NumberBubble v-if="!selectedGame && !originId && game.connections.winner"
                @click.stop="removeWinnerConnection(game.id)"
                class="absolute bg-white border-red-300 text-red-500 right-0 top-0 bottom-0 translate-x-[50%]  m-auto z-10 cursor-pointer">
                -
              </NumberBubble>
              <div class="relative grow">
                <div class="absolute top-0 bottom-0 m-auto h-[2px]">
                  <Connection v-if="connectionsVisible" :connectionId="getConnectionId(game)"
                    :opaque="(availableGames && !!availableGames.length && !isGameAvailable(game)) || loser === game.id || winner === game.id"
                    @updateLineWidth="onUpdateLineWidth(game.id, $event)" :lineWidth="game.transform.lineWidth" />
                  <Connection v-if="connectionsVisible && originId === `${uniqueId}_CONNECTABLE_GAME_${game.id}`"
                    :connectionId="connectionId"
                    :opaque="(availableGames && !!availableGames.length && !isGameAvailable(game)) || loser === game.id || winner === game.id" />
                </div>
              </div>
            </div>

          </div>
        </Draggable>
      </div>

    </div>
    <div class="w-[200px]">
      <div class="bg-gray-100 hover:bg-blue-500 hover:text-white mt-4 text-center" @click="addRound">
        Add round
      </div>
    </div>

  </div>

</div>
</template>
<script setup>
import Draggable from './Draggable.vue'
import Connection from './Connection.vue'
import BracketGame from './BracketGame.vue'
import DrawColorIcon from '@/shared/ui/DrawColorIcon.vue'
import CheckeredFlag from '@/shared/icons/CheckeredFlag.vue'
import NumberBubble from '@/shared/ui/NumberBubble.vue';
import Trophy from '@/shared/icons/Trophy.vue'
import BrokenHeart from '@/shared/icons/BrokenHeart.vue'
import { watch, ref, nextTick, onMounted, computed } from 'vue'
import { useDraggableStore } from './draggable';
import { useConnectionStore } from './connection'
import { get, useMouse } from '@vueuse/core'
import { useUniqueId } from '@/shared/composables/useUniqueId'
import { useDrawColor } from '@/shared/composables/useDrawColor'

import { storeToRefs } from 'pinia';

const { getDrawColor } = useDrawColor()

const props = defineProps({
  mode: String,
  selectedGameId: {
    type: String,
    default: null
  },
  games: {
    type: Array,
    default: () => []
  },
  availableGames: {
    type: Array,
    default: () => []
  },
  drawNumbers: Object,
  uniqueId: String,
  loser: String,
  winner: String,
})

const emit = defineEmits(['update:selectedGameId', 'update:games', 'selectGame', 'beginConnect', 'removeWinnerConnection', 'removeRound', 'clear', 'viewTeamConnection', 'addGame'])


const { dragElementId } = storeToRefs(useDraggableStore())

const { x: mouseX, y: mouseY } = useMouse();

const mouseShadowId = ref('MOUSE_SHADOW_' + props.uniqueId)



const { originId, connectionId, loserOriginId } = storeToRefs(useConnectionStore());
const { setOriginId, setConnectionId, setLoserOriginId } = useConnectionStore();

const connectionsVisible = ref(true);
const interval = ref(null);
watch(dragElementId, (val) => {
  if (val) {
    interval.value = setInterval(() => {
      connectionsVisible.value = false;
      nextTick(() => {
        connectionsVisible.value = true;
      })
    }, 1)
  } else {
    clearInterval(interval.value)
    interval.value = null;
  }

})

function getNextGamePosition(roundNumber) {
  const boundary = document.getElementById(`${props.uniqueId}_BRACKET_ROUND_${roundNumber}`).getBoundingClientRect()
  const height = boundary.height;
  const { top: boundaryTop } = boundary;

  let yValues = Array.from(Array(Number(height.toFixed(0))).keys()).map(i => i + boundaryTop);
  const gamesForRound = editedGames.value.filter(({ roundNumber: round }) => round === roundNumber)
  gamesForRound.forEach(({ id }) => {
    const rect = document.getElementById(`${props.uniqueId}_BRACKET_GAME_${id}`).getBoundingClientRect();
    yValues = yValues.filter((i) => !(i > rect.top && i < rect.top + rect.height))
  })

  const nextValue = yValues.find((i) => {
    return yValues.indexOf(i + 100) - yValues.indexOf(i) === 100;
  }) || yValues[yValues.length - 1] + 100
  return nextValue - (boundaryTop);

}


function addGame(roundNumber) {
  const id = useUniqueId();
  const newGame = {
    id,
    roundNumber,
    connections: {
      winner: '',
      loser: '',
    },
    transform: {
      x: 0,
      y: getNextGamePosition(roundNumber),
      lineWidth: 50,
    }
  }
  emit('addGame', newGame)

}

const rounds = ref([1]);

function addRound() {
  rounds.value.push(rounds.value.length + 1)
}

function getGameIndexById(gameId) {
  return editedGames.value.findIndex(({ id }) => id === gameId)
};


function onHover(game, isHovered) {
  if (!originId.value) return;

  const gameId = game.id
  if (isHovered && isGameAvailable(game)) {
    setConnectionId(`${props.uniqueId}_CONNECTABLE_GAME_${gameId}`);
  } else {
    setConnectionId(mouseShadowId.value);
    connectionsVisible.value = false;
    nextTick(() => {
      connectionsVisible.value = true;
    })
  }

}

const selectedGame = computed({
  get() {
    return props.selectedGameId
  },
  set(value) {
    emit('update:selectedGameId', value)
  }
})
function selectGame(gameId) {
  selectedGame.value = gameId
}

function onClick(game) {
  emit('selectGame', game)
}

function removeWinnerConnection(gameId) {
  emit('removeWinnerConnection', gameId);
  nextTick(() => {
    onUpdateLineWidth(gameId, 50)
  })

}

function setRounds() {
  const maxRound = props.games.map(({ roundNumber }) => roundNumber).sort((a, b) => a - b).pop();
  if (maxRound) {
    rounds.value = Array.from(Array(maxRound).keys()).map(i => i + 1);
    const gamesClone = [...props.games]
    setGames([])
    setTimeout(() => {
      setGames(gamesClone)
    }, 10)

  }

}

onMounted(() => {
  setOriginId('');
  setConnectionId('');
  setRounds()
})

function getConnectionId(game) {
  const { connections } = game;
  const { winner } = connections;
  if (!winner) return null;
  return `${props.uniqueId}_CONNECTABLE_GAME_${winner}`;
}

function beginConnect(gameId) {
  emit('beginConnect', gameId);

}


function onDragUpdate(gameId, updates) {
  const gameIndex = getGameIndexById(gameId);
  const gamesClone = [...editedGames.value];
  const game = gamesClone[gameIndex];
  const { x, y } = game.transform;
  gamesClone.splice(gameIndex, 1, {
    ...gamesClone[gameIndex],
    transform: {
      ...gamesClone[gameIndex].transform,
      x: updates.x,
      y: updates.y,
    }
  })
  setGames(gamesClone);

}

const maxRound = computed(() => rounds.value[rounds.value.length - 1])



function isGameAvailable(game) {
  return props.availableGames.includes(game.id)
}

function onUpdateLineWidth(gameId, lineWidth) {
  const gameIndex = getGameIndexById(gameId);
  const gamesClone = [...editedGames.value];
  gamesClone.splice(gameIndex, 1, {
    ...gamesClone[gameIndex],
    transform: {
      ...gamesClone[gameIndex].transform,
      lineWidth,
    }
  })
  setGames(gamesClone);
}

const editedGames = computed({
  get() {
    return props.games;
  },
  set(newGames) {
    emit('update:games', newGames)
  }
})

function setGames(newGames) {
  editedGames.value = newGames;
  nextTick(() => {
    setContainerHeight();
  })
}

const containerHeight = ref(500)

function setContainerHeight() {
  const lowest = editedGames.value.reduce((lowest, { id }) => {
    const el = document.getElementById(`${props.uniqueId}_BRACKET_GAME_${id}`)
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const top = new WebKitCSSMatrix(window.getComputedStyle(el).transform).m42
    if (top + rect.height > lowest) return top + rect.height;
    return lowest;
  }, 0) || 500
  containerHeight.value = lowest + 200
}




function clickOutside() {
  emit('clear')
}

function removeRound(round) {
  emit('removeRound', round)
  rounds.value = rounds.value.filter(r => r !== round)
}

</script>
