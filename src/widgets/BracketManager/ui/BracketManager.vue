<template>
<div class="absolute inset-0 pa-8 bg-black/10 overflow-hidden">
  <div class="absolute inset-2 grid grid-cols-[275px,_1fr] gap-4  ">
    <div class="relative">
      <div class="absolute inset-0 overflow-auto">
        <div class="bg-white p-4 rounded-xl ">
          <NumTeamsDisplay :bracketId="uniqueId" v-if="editable" />
          <div class="bg-gray-100 p-2 px-4 rounded-xl">
            <div class="font-semibold mb-2">
              <div>Draws ({{ drawCount }})</div>
            </div>
            <div class="bg-blue-500 p-2 rounded-lg mb-2  relative" v-if="editable">
              <div class="flex mb-2 gap-2 items-center">
                <div class="text-xs">🔧</div>
                <div class="font-semibold text-white">
                  Options
                </div>
              </div>
              <div class="flex flex-col bg-white rounded-lg  px-2 py-1">
                <label for="sheetsinput" class="text-sm text-slate-700">Sheets</label>
                <Input class=" rounded-md focus:outline-blue-500 bg-gray-100" placeholder="Sheets" type="number"
                  v-model="numSheets" :min="1" :max="24">
                </Input>
              </div>
            </div>
            <DrawList :bracketId="uniqueId" :modelValue="selectedDraw" @update:modelValue="selectDraw" />
          </div>
        </div>
      </div>
    </div>
    <div class="relative">
      <div class="grid grid-rows-[auto,_1fr,_auto]  overflow-auto gap-4 absolute inset-0">
        <div class="flex gap-2 p-2 bg-gray-100  rounded-xl sticky top-0 z-30 shadow-md ">
          <BracketListEditor :editable="editable" :storeId="uniqueId">
          </BracketListEditor>
        </div>
        <div class="relative">
          <div class="relative rounded-xl mb-8" v-for="bracket in gamesBracketIndex.keys()" :key="bracket"
            :class="mode === 'viewGame' ? 'bg-blue-100' : 'bg-white'">
            <BracketEditable v-if="editable && !loading" class="rounded-xl min-h-[600px]"
              :availableGames="availableGames" @selectGame="onGameSelect($event, bracket)" :bracketId="uniqueId"
              :uniqueId="bracket" @clear="reset" />

            <Bracket v-else-if="!loading" class="rounded-xl min-h-[600px]" :rounds="getRoundsForBracket(bracket)"
              @click="reset" :games="getGamesForBracket(bracket)" :availableGames="availableGames"
              @selectGame="onGameSelect($event, bracket)" :bracketId="uniqueId" :uniqueId="bracket" @clear="reset" />
          </div>
        </div>
        <div v-if="editable" class="sticky bottom-0 bg-white p-4 rounded-lg shadow-md z-50 flex gap-2">
          {{ deletedGameIds }} {{ deletedBracketIds }}
          <Button class="w-fit" @click="saveBracket(uniqueId, bracketGroupId)">
            {{ saving ? 'Saving...' : 'Save' }}
          </Button>
        </div>
        <div v-else />
      </div>
    </div>
    <BracketGamePopup v-if="editable" :bracketId="uniqueId" @delete="reset" />
  </div>
</div>
</template>
<script setup lang="ts">
import { ref, computed, nextTick, onMounted } from 'vue'
import Bracket from './Bracket.vue'
import BracketEditable from './BracketEditable.vue'
import BracketGamePopup from './BracketGamePopup.vue';
import DrawList from './DrawList.vue';
import NumTeamsDisplay from './NumTeamsDisplay.vue';
import Input from '@/shared/ui/Input.vue';
import { useConnectionStore } from '../lib/useConnection';
import { storeToRefs } from 'pinia';
import BracketListEditor from './BracketListEditor.vue'
import { useBracket } from '../lib/useBracket';
import type { BracketGame } from './lib/types'
import { useEditableBracket } from '../lib/useEditableBracket';
import { useSaveBracket } from '../lib/useSaveBracket';
import { useGetBracket } from '../lib/useGetBracket';
import Button from '@/shared/ui/Button.vue';
const props = defineProps<{
  bracketGroupId?: string,
  editable: boolean,
  uniqueId: string,
}>()

const { saveBracket, saving } = useSaveBracket()


const { originId, loserOriginId, originBracketId } = storeToRefs(useConnectionStore());
const { setOriginId, setLoserOriginId, setConnectionId, setOriginBracketId } = useConnectionStore();

const bracketStore = useBracket(props.uniqueId);

const {
  addWinnerConnection,
  getAllOriginConnections,
  getAvailableLoserGames,
  getAvailableWinnerGames,
  getConnectedGames,
  getEditableGames,
  getGameBracketId,
  getGameById,
  getGamesForBracket,
  getRoundsForBracket,
  hasLessThanTwoOriginConnections,
  initGames,
  setSelectedGameId,
  updateLoserConnection,
} = bracketStore

const {
  drawCount,
  numSheets,
  gamesBracketIndex,
  gamesIndex,
  selectedGameId,
  deletedBracketIds,
  deletedGameIds,
} = storeToRefs(bracketStore);

const editableBracketStore = useEditableBracket(props.uniqueId)()

const { mode } = storeToRefs(editableBracketStore)
const { setBracketManagerMode, beginConnect, beginLoserConnect } = editableBracketStore

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
      gamesArray = [...getAvailableLoserGames(selectedGameId.value).map(({ id }) => id), selectedGameId.value]
      break;

    case 'viewGame':
      if (!selectedGameId.value) {
        gamesArray = [];
        break;
      }
      gamesArray = [...[...getConnectedGames(selectedGameId.value), ...getAllOriginConnections(getGameById(selectedGameId.value))].map(({ id }) => id), selectedGameId.value]
      break;

    case 'viewDraw':
      gamesArray = [...Array.from(gamesIndex.value.values()).filter(({ drawNumber }) => {
        return `${drawNumber}` === `${selectedDraw.value}`
      }).map(({ game }) => game.id)]
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
      if (!hasLessThanTwoOriginConnections(game)) break;
      addWinnerConnection(originId.value.split('_')[3], gameId, bracketId)
      setBracketManagerMode('viewGame')
      setOriginId('')
      break;

    case 'setLoser':
      if (!hasLessThanTwoOriginConnections(game)) break;
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

const selectedDraw = ref<number | null>(null)
async function selectDraw(drawNum: number | null) {
  if (drawNum === null) {
    selectedDraw.value = null;
    setBracketManagerMode('view')
  } else if (selectedDraw.value === drawNum) {
    return;
  } else {
    selectedDraw.value = drawNum;
    setBracketManagerMode('viewDraw')
  }
}
const loading = ref(true)
const { fetchBracket } = useGetBracket()
onMounted(async () => {
  if (props.bracketGroupId) {
    const g = await fetchBracket(props.bracketGroupId)
    initGames(g)
  }
  nextTick(() => {
    loading.value = false;
  })
})



</script>
