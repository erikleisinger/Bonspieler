<template>
<div class="absolute inset-0 pa-8 bg-black/10 ">
  <div class="absolute inset-4  overflow-auto grid grid-rows-[auto,_1fr]">
    <div class="flex gap-2 p-2 bg-gray-100 mb-2 rounded-xl sticky top-0 z-30 shadow-md">

      <BracketListEditor v-model:games="games" @click="scrollToBracket">
      </BracketListEditor>
    </div>
    <div class="grid grid-cols-[auto,_1fr] gap-4">
      <div class="bg-white p-4 rounded-xl  sticky top-[70px] overflow-auto" style="height: calc(100vh - 125px)">
        <div class="bg-gray-100 rounded-lg px-4 py-1 text-sm mb-2">
          <div class="flex justify-between">Starting teams: <strong>{{ requiredNumTeams }}</strong></div>
          <div class="flex justify-between">Ending teams: <strong>{{ numEndTeams }}</strong></div>
        </div>
        <div class="bg-gray-100 p-2 px-4 rounded-xl">
          <div class="font-semibold mb-2">
            <div>Draws ({{ numDraws }})</div>

          </div>
          <div class="bg-blue-500 p-2 rounded-lg mb-2  relative">
            <div class="flex mb-2 gap-2 items-center">
              <div class="text-xs">🔧</div>

              <div class="font-semibold text-white">
                Options
              </div>

            </div>

            <div class="flex flex-col bg-white rounded-lg  px-2 py-1">
              <label for="sheetsinput" class="text-sm text-slate-700">Sheets</label>
              <input class=" rounded-md focus:outline-blue-500 bg-gray-100" placeholder="Sheets" type="number"
                v-model="numSheets">
              </input>
            </div>
          </div>

          <div v-for="draw in Array.from(Array((numDraws)).keys())" :key="draw" @click="onDrawButtonClick(draw + 1)"
            class="flex  gap-2 rounded-lg mb-1 py-1 px-2 border-2 bg-white hover:bg-gray-200 hover:text-slate-900 cursor-pointer min-w-[200px]"
            :class="{

              [`border-blue-500 border-2`]: selectedDraw === draw + 1
            }">
            <DrawColorIcon class="w-[12px] h-[12px] mt-[0.45rem]" :drawNumber="draw + 1" />
            <div>
              <div>
                Draw {{ draw + 1 }}
              </div>
              <div class="text-xs -mt-1 text-slate-600">{{ gamesPerDraw[draw + 1]?.length }} {{ `game${gamesPerDraw[draw
                + 1]?.length >
                1 ? 's' : ''}` }}</div>
            </div>

          </div>
        </div>
      </div>
      <div class="relative">
        <div class="relative rounded-xl mb-8" v-for="bracket, index in Object.keys(games)" :key="bracket"
          :class="mode === 'viewGame' ? 'bg-blue-100' : 'bg-white'" :id="`BRACKET_${bracket}`">

          <Bracket class="rounded-xl min-h-[600px]" v-model:selectedGameId="selectedGameId" :mode="mode"
            :availableGames="availableGames" :games="gamesWithOrigins[bracket]"
            @update:games="setGamesForBracket($event, bracket)" @selectGame="onGameSelect($event, bracket)"
            @beginConnect="beginConnect" :uniqueId="bracket" :loser="loserGame" :winner="winnerGame"
            @removeWinnerConnection="removeWinnerConnection($event)"
            @removeRound="removeRoundFromBracket($event, bracket)" :drawNumbers="drawNumbers" @clear="reset"
            @viewTeamConnection="onViewTeamConnection" @addGame="addGame($event, bracket)" />

        </div>
      </div>
    </div>
    <div class="fixed inset-0 pointer-events-none rounded-xl  border-blue-500 z-50" :class="{
      'border-0': !selectedGame,
      'border-[16px]': !!selectedGame,
    }" style="transition: border 0.2s">
      <div class="absolute top-8 left-0 right-0 m-auto w-fit z-50 transition-transform " :class="{
        'scale-0': !selectedGame,
        'scale-100': !!selectedGame,
      }">
        <div class="p-4 bg-white font-semibold  rounded-xl shadow-md " style="pointer-events: all">
          <div class="text-blue-500 text-lg" v-if="mode === 'viewGame'">Editing Game</div>
          <div class="text-red-500 text-lg" v-else-if="mode === 'setLoser'">Select losing game</div>
          <div class="text-blue-500 text-lg" v-else-if="mode === 'setWinner'">Select winning game</div>
          <div>
            <div v-if="selectedGame && mode === 'viewGame'" class="flex gap-2 items-center mt-2">
              <div
                class="flex items-center gap-2 font-normal py-1 px-2 bg-gray-100 hover:bg-gray-200 rounded-md  cursor-pointer grow"
                @click="scrollToGame(selectedGame?.connections?.winner)">
                <NumberBubble class="bg-amber-500">
                  <Trophy class=" h-[20px] w-[20px] mb-[-3px]  fill-white" />

                </NumberBubble>
                <DrawColorIcon class="w-[12px] h-[12px] " v-if="selectedGame?.connections?.winner"
                  :drawNumber="drawNumbers[selectedGame.connections.winner]" />
                <div>{{ selectedGame?.connections?.winner || 'No winning game set' }}</div>
              </div>
              <NumberBubble class="text-red-500 cursor-pointer" @click="removeWinnerConnection(selectedGameId)"
                v-if="selectedGame && selectedGame.connections?.winner">
                -
              </NumberBubble>
              <NumberBubble class="bg-blue-500 text-white cursor-pointer" v-else @click="beginConnect(selectedGameId)">
                +
              </NumberBubble>
            </div>
            <div v-if="selectedGameId && mode === 'viewGame'" class="flex gap-2 items-center mt-2">
              <div
                class="flex items-center gap-2 font-normal py-1 px-2 bg-gray-100 hover:bg-gray-200 rounded-md  cursor-pointer grow"
                @click="scrollToGame(selectedGame?.connections?.loser)">
                <NumberBubble class="bg-red-500 ">
                  <BrokenHeart class=" h-[20px] w-[20px] mb-[-3px]  fill-white" />

                </NumberBubble>
                <DrawColorIcon class="w-[12px] h-[12px] " v-if="selectedGame?.connections?.loser"
                  :drawNumber="drawNumbers[selectedGame.connections.loser]" />
                <div>{{ selectedGame?.connections?.loser || 'No losing game set' }}</div>
              </div>
              <NumberBubble class="text-red-500 cursor-pointer" v-if="selectedGame && selectedGame.connections?.loser"
                @click="removeLoserConnection">
                -
              </NumberBubble>
              <NumberBubble class="bg-blue-500 text-white cursor-pointer" v-else @click="beginLoserConnect">
                +
              </NumberBubble>
            </div>

          </div>
          <div class="flex justify-center rounded-lg gap-1 mt-2">


            <div v-if="mode === 'viewGame'"
              class="w-full max-w-[150px] text-center bg-red-50 text-red-500 rounded-md px-2 py-1 hover:bg-red-500 hover:text-white cursor-pointer"
              @click="deleteGame(selectedGameId || loserOriginId, originBracketId)">
              Delete game
            </div>
            <div v-else-if="mode === 'setWinner' || mode === 'setLoser'"
              class="w-full max-w-[150px] text-center bg-blue-50 text-blue-500 rounded-md px-2 py-1 hover:bg-blue-500 hover:text-white cursor-pointer"
              @click="viewGame(selectedGame)">
              Cancel
            </div>


          </div>
        </div>
      </div>

    </div>
  </div>
</div>
</template>
<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { useDebounceFn } from '@vueuse/core';
import Bracket from './Bracket.vue'
import DrawColorIcon from '@/shared/ui/DrawColorIcon.vue';
import NumberBubble from '@/shared/ui/NumberBubble.vue';
import Trophy from '@/shared/icons/Trophy.vue';
import BrokenHeart from '@/shared/icons/BrokenHeart.vue';
import { useConnectionStore } from '../lib/useConnection';
import { storeToRefs } from 'pinia';
import BracketListEditor from './BracketListEditor.vue'
import { useBracket } from '../lib/useBracket';
import { useSchedule } from '../lib/useSchedule';
import type { BracketGame, BracketEvent } from './lib/types'

const { originId, loserOriginId, originBracketId } = storeToRefs(useConnectionStore());
const { setOriginId, setLoserOriginId, setConnectionId, setOriginBracketId } = useConnectionStore();

const selectedGameId = ref<string | null>(null)

const {
  games,
  gamesIndex,
  gamesBracketIndex,
  addGame,
  addWinnerConnection,
  deleteGameFromBracket,
  getAllEventGames,
  getAllOriginConnections,
  getAvailableLoserGames,
  getAvailableWinnerGames,
  getConnectedGames,
  getGameBracketId,
  getNumRequiredTeamsForBracketEvent,
  removeRoundFromBracket,
  removeWinnerConnection,
  setGamesForBracket, getGamesWithOrigins,
  updateGames,
  updateLoserConnection,
  gamesWithReadableIds,
} = useBracket();

const gamesWithOrigins = computed(() => getGamesWithOrigins(gamesWithReadableIds.value))

function scrollTo(elementSelector: string) {
  const el = document.querySelector(elementSelector)
  if (!el) return;
  el.scrollIntoView({ behavior: 'smooth', block: 'center', });
}

function scrollToGame(gameId: string) {
  if (!gameId) return;
  const gameBracketId = getGameBracketId(gameId)
  const elementid = getGameElementId(gameId, gameBracketId)
  scrollTo('#' + elementid)
}

function scrollToBracket(bracketId: string) {
  scrollTo(`#BRACKET_${bracketId}`)
}

const allGames = computed(() => {
  return getAllEventGames()
})

function getGameById(gameId: string | null) {
  return allGames.value.find(({ id }) => id === gameId)
}

const loserGame = computed(() => {
  if (!selectedGameId.value) return;
  return getGameById(selectedGameId.value)?.connections?.loser
})

const winnerGame = computed(() => {
  if (!selectedGameId.value) return;
  return getGameById(selectedGameId.value)?.connections?.winner
})

type BracketManagerMode = 'view' | 'viewGame' | 'viewDraw' | 'setWinner' | 'setLoser'
const mode = ref<BracketManagerMode>('view')

function setBracketManagerMode(newMode: BracketManagerMode) {
  mode.value = newMode;
}

function setSelectedGameId(gameId: string | null) {
  selectedGameId.value = gameId;
}

function reset() {
  setSelectedGameId(null);
  setOriginId('');
  setConnectionId('');
  setLoserOriginId('');
  setBracketManagerMode('view')
  selectDraw(null)
}

const availableGames = computed(() => {
  let gamesArray: string[] = []
  switch (mode.value) {
    case 'view':
      gamesArray = []
      break;

    case 'setWinner':
      gamesArray = [...getAvailableWinnerGames(selectedGameId.value).map(({ id }) => id), selectedGameId.value]
      break;

    case 'setLoser':
      gamesArray = [...getAvailableLoserGames(selectedGameId.value, drawNumbers.value).map(({ id }) => id), selectedGameId.value]
      break;

    case 'viewGame':
      if (!selectedGameId.value) {
        gamesArray = [];
        break;
      }
      gamesArray = [...[...getConnectedGames(selectedGameId.value), ...getAllOriginConnections(getGameById(selectedGameId.value))].map(({ id }) => id), selectedGameId.value]
      break;

    case 'viewDraw':
      gamesArray = [...allGames.value.filter((game) => {
        return drawNumbers.value[game.id] === `${selectedDraw.value}`
      }).map(({ id }) => id)]
      break;

    default:
      gamesArray = []
  }
  return gamesArray;
})

async function viewGame(game: BracketGame) {
  const gameId = game?.id || null
  const bracketId = getGameBracketId(gameId)
  reset()
  await nextTick();
  setSelectedGameId(gameId)
  setBracketManagerMode('viewGame')
  setOriginBracketId(bracketId)
}
async function onGameSelect(game: BracketGame) {
  const gameId = game?.id || null;
  const bracketId = getGameBracketId(gameId)

  switch (mode.value) {
    case 'view':
      await viewGame(game)
      break;

    case 'setWinner':
      addWinnerConnection(originId.value.split('_')[3], gameId, bracketId)
      setBracketManagerMode('viewGame')
      setOriginId('')
      break;

    case 'setLoser':
      updateLoserConnection(loserOriginId.value, gameId, originBracketId.value)
      setBracketManagerMode('viewGame')
      setOriginBracketId(bracketId)
      break;

    case 'viewDraw':
      reset()
      await nextTick();
      setSelectedGameId(gameId)
      setBracketManagerMode('viewGame')
      break;

    case 'viewGame':
      await viewGame(game)
      break;
  }
}

function getGameElementId(gameId: string, bracketId: string) {
  return `${bracketId}_CONNECTABLE_GAME_${gameId}`
}

function beginConnect(gameId: string) {
  const bracketId = getGameBracketId(gameId)
  setBracketManagerMode('setWinner')
  setOriginId(getGameElementId(gameId, bracketId));
  setConnectionId('MOUSE_SHADOW_' + bracketId);
  setOriginBracketId(bracketId)
  setSelectedGameId(gameId)
}

function beginLoserConnect() {
  const bracketId = getGameBracketId(selectedGameId.value)
  setBracketManagerMode('setLoser')
  setLoserOriginId(selectedGameId.value);
  setOriginBracketId(bracketId)
  setSelectedGameId(selectedGameId.value)
}

function removeLoserConnection() {
  updateLoserConnection(selectedGameId.value, '')
}

const selectedGame = computed(() => getGameById(selectedGameId.value))

function deleteGame(gameId, bracketId) {
  deleteGameFromBracket(gameId, bracketId)
  reset()
}


watch(games, (val) => {
  localStorage.setItem('games', JSON.stringify(val))
}, { deep: true })

onMounted(() => {
  const savedGames = localStorage.getItem('games');
  if (savedGames) {
    updateGames(JSON.parse(savedGames))
  }
})

const requiredNumTeams = computed(() => {
  return getNumRequiredTeamsForBracketEvent(allGames.value)
})

const numEndTeams = computed(() => {
  return allGames.value.filter(({ connections }) => !connections?.winner).length
})

const numSheets = ref(6)

const { getDrawNumbersForBracketGames, getNumberOfDrawsForBracketEvent } = useSchedule();

const drawNumbers = computed(() => {
  return getDrawNumbersForBracketGames(allGames.value, numSheets.value)
})

const gamesPerDraw = computed(() => {
  return Object.entries(drawNumbers.value).reduce((all, [gameId, drawNum]) => {
    if (!all[drawNum]) {
      return {
        ...all,
        [drawNum]: [gameId]
      }
    }
    return {
      ...all,
      [drawNum]: [...all[drawNum], gameId]
    }
  }, {})
})

const numDraws = computed(() => {
  return getNumberOfDrawsForBracketEvent(drawNumbers.value)
})


const drawsViewing = ref([])
const currentlyViewingDraw = ref(null)



function sortDrawsByPositionY(drawNum: number) {
  const drawGames = gamesPerDraw.value[drawNum] || [];
  if (!drawGames?.length) return;

  drawsViewing.value = [...drawGames].sort((a, b) => {
    const { top: topA = 0 } = document.querySelector(`[data-gameid="${a}"]`)?.getBoundingClientRect()
    const { top: topB = 0 } = document.querySelector(`[data-gameid="${b}"]`)?.getBoundingClientRect()
    return topA - topB;

  })
}

function scrollToNextDraw() {
  if (!drawsViewing.value?.length) return;
  let draw;
  if (!currentlyViewingDraw.value) {
    draw = drawsViewing.value[0]

  } else {
    const index = Object.values(drawsViewing.value).indexOf(currentlyViewingDraw.value)
    if (index === Object.keys(drawsViewing.value).length - 1) {

      draw = drawsViewing.value[0]
    } else {
      draw = drawsViewing.value[index + 1]
    }

  }
  currentlyViewingDraw.value = draw
  scrollToGame(draw)
}


const selectedDraw = ref<number | null>(null)
async function selectDraw(drawNum: number | null) {
  if (drawNum === null) {
    selectedDraw.value = null;
    setBracketManagerMode('view')
    drawsViewing.value = [];
    currentlyViewingDraw.value = null;
  } else if (selectedDraw.value === drawNum) {
    scrollToNextDraw()
  } else {
    sortDrawsByPositionY(drawNum)
    scrollToNextDraw()
    selectedDraw.value = drawNum;
    setBracketManagerMode('viewDraw')
  }
}

async function onDrawButtonClick(drawNum: number) {
  setSelectedGameId(null);
  setOriginId('');
  setConnectionId('');
  setLoserOriginId('');
  setBracketManagerMode('viewDraw')
  await nextTick()
  selectDraw(drawNum)
}

const onViewTeamConnection = (e) => {
  const { gameId: originGameId, teamId: team } = e;
  if (originGameId !== selectedGameId.value) return;
  const gameId = team.split(' ')[1];
  if (!gameId) return;
  scrollToGame(gameId)
}




</script>
