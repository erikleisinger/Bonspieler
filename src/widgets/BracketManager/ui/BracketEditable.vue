<template>
<Bracket :mode="mode" :rounds="editedRounds" :games="editedGames" :availableGames="availableGames"
  :drawNumbers="drawNumbers" :uniqueId="uniqueId" @hover="onHover" :bracketId="bracketId"
  @selectGame="emit('selectGame', $event)" @clear="emit('clear', $event)"
  @viewTeamConnection="emit('viewTeamConnection', $event)" @update:dragPosition="onDragUpdate">
  <div class="fixed  pointer-events-none" :id="mouseShadowId" :style="{
    top: `${mouseY}px`,
    left: `${mouseX}px`,
  }" />
  <template #append-round="{ round }">
    <div class="grid grid-cols-2 gap-2">
      <div
        class="bg-gray-100 hover:bg-blue-500 hover:text-white mt-4  w-fit m-auto px-2 rounded-lg py-1  text-center w-full cursor-pointer"
        @click="addGameToBracket(round)">
        Add game
      </div>
      <div @click="removeRound(round)"
        class="bg-gray-100 hover:bg-red-500 hover:text-white mt-4  w-fit m-auto px-2 rounded-lg py-1  text-center w-full cursor-pointer">
        Remove round
      </div>
    </div>
  </template>

  <template #prepend-game>
    <div class="flex items-center  absolute left-0 top-0 bottom-0  z-10" v-if="!originId && !selectedGame">
      <div class="handle cursor-move bg-gray-400 hover:bg-blue-500 rounded-md h-[30px] w-[8px] translate-x-[-3px]">
      </div>
    </div>
  </template>

  <template #append-game="{ game, round }">

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

  </template>

  <template #append-bracket>
    <div class="w-[200px]">
      <div class="bg-gray-100 hover:bg-blue-500 hover:text-white mt-4 text-center" @click="addRound">
        Add round
      </div>
    </div>
  </template>
</Bracket>
</template>
<script setup>
import Bracket from './Bracket.vue'
import CheckeredFlag from '@/shared/icons/CheckeredFlag.vue'
import NumberBubble from '@/shared/ui/NumberBubble.vue';
import { ref, onMounted, computed } from 'vue'
import { useConnectionStore } from '../lib/useConnection'
import { useMouse } from '@vueuse/core'
import { useUniqueId } from '@/shared/composables/useUniqueId'
import { useBracket } from '../lib/useBracket';
import { useEditableBracket } from '../lib/useEditableBracket';
import { storeToRefs } from 'pinia';

const props = defineProps({
  bracketId: String,
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
})

const emit = defineEmits(['update:selectedGameId', 'update:games', 'selectGame', 'beginConnect', 'clear', 'viewTeamConnection', 'addGame', 'setMode'])

const { x: mouseX, y: mouseY } = useMouse();

const mouseShadowId = ref('MOUSE_SHADOW_' + props.uniqueId)

const { originId } = storeToRefs(useConnectionStore());
const { setOriginId, setConnectionId } = useConnectionStore();


const { useBracketStore } = useBracket(props.bracketId)
const bracketStore = useBracketStore();
const { addGame, updateGame, getGameById, getGamesForBracket, setGamesForBracket, getEditableGames, removeWinnerConnection, removeRoundFromBracket, getRoundsForBracket, setSelectedGameId } = bracketStore;

const editableBracketStore = useEditableBracket(props.bracketId)();
const { beginConnect } = editableBracketStore

const editedRounds = ref([])

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


function addGameToBracket(roundNumber) {
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
  addGame(newGame, props.uniqueId)

}

function addRound() {
  editedRounds.value.push(editedRounds.value.length + 1)
}

const selectedGame = computed({
  get() {
    return props.selectedGameId
  },
  set(value) {
    emit('update:selectedGameId', value)
  }
})

function getConnectionId(game) {
  const { connections } = game;
  const { winner } = connections;
  if (!winner) return null;
  return `${props.uniqueId}_CONNECTABLE_GAME_${winner}`;
}

const maxRound = computed(() => editedRounds.value[editedRounds.value.length - 1])

const editedGames = computed({
  get() {
    return getEditableGames(Array.from(getGamesForBracket(props.uniqueId)))
  },
  set(newGames) {
    setGamesForBracket(props.uniqueId, newGames)
  }
})

function removeRound(round) {
  removeRoundFromBracket(round, props.uniqueId)
  const index = editedRounds.value.indexOf(round)
  editedRounds.value.splice(index, 1)

}

function isGameAvailable(game) {
  return props.availableGames.includes(game.id)
}

function onHover({ game, isHovered }) {
  if (!originId.value) return;
  const gameId = game.id
  if (isHovered && isGameAvailable(game)) {
    setConnectionId(`${props.uniqueId}_CONNECTABLE_GAME_${gameId}`);
  } else {
    setConnectionId(mouseShadowId.value);
  }

}

onMounted(() => {
  setOriginId('');
  setConnectionId('');
  editedRounds.value = getRoundsForBracket(props.uniqueId)
})

function onDragUpdate({
  gameId,
  updates
}) {
  const game = getGameById(gameId);
  const updatedGame = {
    ...game,
    transform: {
      ...game.transform,
      x: updates.x,
      y: updates.y,
    }
  }
  updateGame(updatedGame);
}

</script>
