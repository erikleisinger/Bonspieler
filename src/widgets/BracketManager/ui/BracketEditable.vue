<template>
<Bracket editable :mode="mode" :rounds="editedRounds" :availableGames="availableGames"
  @updateLineWidth="onUpdateLineWidth" :uniqueId="uniqueId" @hover="onHover" :bracketId="bracketId"
  @selectGame="emit('selectGame', $event)" @update:dragPosition="onDragUpdate" @click="emit('clear', $event)">
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
    <AddButton class="absolute right-0 top-0 bottom-0 translate-x-[50%]  m-auto z-10"
      v-if="!selectedGame && !originId && !getConnectionId(game) && round !== maxRound"
      @click.stop="beginConnect(game.id)" />
    <RemoveButton class="absolute right-0 top-0 bottom-0 translate-x-[50%]  m-auto z-10"
      v-if="!selectedGame && !originId && game.connections.winner" @click.stop="removeWinnerConnection(game.id)" />


  </template>

  <template #append-bracket>
    <div class="w-[200px]">
      <div class="bg-gray-100 hover:bg-blue-500 hover:text-white mt-4 text-center" @click="addRound">
        Add round
      </div>
    </div>
  </template>
  <template #append-connection="{ winnerGame, loserGame, game }">
    <Connection v-if="originId === getConnectableGameElementId(uniqueId, game.id)" :connectionId="connectionId" editable
      class="EEEEECTION"
      :opaque="(availableGames && !!availableGames.length && !isGameAvailable(game)) || loserGame === game.id || winnerGame === game.id" />
  </template>

</Bracket>
</template>
<script setup>
import Bracket from './Bracket.vue'
import CheckeredFlag from '@/shared/icons/CheckeredFlag.vue'
import Connection from './Connection.vue';
import NumberBubble from '@/shared/ui/NumberBubble.vue';
import RemoveButton from './RemoveButton.vue'
import AddButton from './AddButton.vue'
import { ref, onMounted, computed } from 'vue'
import { useConnectionStore } from '../lib/useConnection'
import { useMouse } from '@vueuse/core'
import { useUniqueId } from '@/shared/composables/useUniqueId'
import { useBracket } from '../lib/useBracket';
import { useBracketElement } from '../lib/useBracketElement';
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
  uniqueId: String,
})

const emit = defineEmits(['update:selectedGameId', 'update:games', 'selectGame', 'beginConnect', 'clear', 'addGame', 'setMode'])

const { x: mouseX, y: mouseY } = useMouse();

const mouseShadowId = ref('MOUSE_SHADOW_' + props.uniqueId)

const { getBracketRoundElementId, getConnectableGameElementId, getBracketGameElementId } = useBracketElement()

const { originId, connectionId } = storeToRefs(useConnectionStore());
const { setOriginId, setConnectionId } = useConnectionStore();


const bracketStore = useBracket(props.bracketId)
const { addGame, updateGame, getGameById, getGamesForBracket, setGamesForBracket, getEditableGames, removeWinnerConnection, removeRoundFromBracket, getRoundsForBracket } = bracketStore;

const editableBracketStore = useEditableBracket(props.bracketId)();
const { beginConnect } = editableBracketStore

const editedRounds = ref([])



function getNextGamePosition(roundNumber) {
  const boundary = document.getElementById(getBracketRoundElementId(props.uniqueId, roundNumber)).getBoundingClientRect()
  const height = boundary.height;
  const { top: boundaryTop } = boundary;

  let yValues = Array.from(Array(Number(height.toFixed(0))).keys()).map(i => i + boundaryTop);
  const gamesForRound = editedGames.value.filter(({ roundNumber: round }) => round === roundNumber)
  gamesForRound.forEach(({ id }) => {
    const rect = document.getElementById(getBracketGameElementId(props.uniqueId, id)).getBoundingClientRect();
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
  return getConnectableGameElementId(props.uniqueId, winner)
}

const maxRound = computed(() => editedRounds.value[editedRounds.value.length - 1])

const editedGames = computed(() => getGamesForBracket(props.uniqueId))

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
    setConnectionId(getConnectableGameElementId(props.uniqueId, gameId));
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

function onUpdateLineWidth({
  gameId,
  newWidth
}) {
  const game = getGameById(gameId);
  const updatedGame = {
    ...game,
    transform: {
      ...game.transform,
      lineWidth: newWidth,
    }
  }
  updateGame(updatedGame);
}

</script>
