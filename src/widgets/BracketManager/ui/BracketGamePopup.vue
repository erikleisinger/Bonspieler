<template>
<div class="fixed inset-0 pointer-events-none rounded-xl   z-50 " style="transition: border 0.2s">
  <div class="absolute top-8 left-0 right-0 m-auto w-fit z-50 transition-transform w-[325px] max-w-[90vw]" :class="{
    'scale-0': !selectedGame,
    'scale-100': !!selectedGame,
  }">
    <div class="p-4 bg-white font-semibold  rounded-xl shadow-md " style="pointer-events: all">
      <div class="text-blue-500 text-lg" v-if="mode === 'viewGame'">Editing Game {{ selectedGame?.readableId || '' }}
      </div>
      <div class="text-red-500 text-lg" v-else-if="mode === 'setLoser'">Select losing game</div>
      <div class="text-blue-500 text-lg" v-else-if="mode === 'setWinner'">Select winning game</div>
      <div class="font-normal text-sm flex gap-2 items-center" v-if="selectedGame?.drawNumber">
        <DrawColorIcon class="w-[12px] h-[12px] " :drawNumber="selectedGame.drawNumber" />
        <span>Draw {{ selectedGame.drawNumber
          }}</span>
      </div>
      <div class="min-w-[200px]">
        <div v-if="selectedGame && mode === 'viewGame'" class="flex gap-2 items-center mt-2">
          <div class="bg-gray-100 rounded-md hover:bg-gray-200 cursor-pointer grow">

            <div class="flex items-center gap-4 font-normal py-1 px-2      " @click="scrollToSelectedGameWinner">
              <WinnerIconBubble />
              <div>
                <div class="text-xs text-gray-800">Winner to</div>
                <div class="flex items-center gap-2">
                  <DrawColorIcon class="w-[12px] h-[12px] " v-if="winnerConnectionDrawNumber"
                    :drawNumber="winnerConnectionDrawNumber" />
                  <div>{{ winnerConnection?.readableId || 'No game set' }}</div>
                </div>
              </div>
            </div>
          </div>
          <RemoveButton @click="removeWinnerConnection(selectedGameId)" v-if="connections.winner" />
          <AddButton v-else @click="beginConnect(selectedGameId)"></AddButton>

        </div>
        <div v-if="selectedGameId && mode === 'viewGame'" class="flex gap-2 items-center mt-2">
          <div class="bg-gray-100 rounded-md hover:bg-gray-200 cursor-pointer grow">
            <div class="flex items-center gap-4 font-normal py-1 px-2      " @click="scrollToSelectedGameLoser">
              <LoserIconBubble />
              <div>
                <div class="text-xs text-gray-800">Loser {{ loserConnectionDrawNumber ? 'to' : '' }}</div>
                <div class="flex items-center gap-2">
                  <DrawColorIcon class="w-[12px] h-[12px] " v-if="loserConnectionDrawNumber"
                    :drawNumber="loserConnectionDrawNumber" />
                  <div>{{ loserConnection?.readableId || 'Out' }}</div>
                </div>
              </div>
            </div>
          </div>
          <RemoveButton @click="removeLoserConnection" v-if="connections.loser" />
          <AddButton v-else @click="beginLoserConnect" />
        </div>

        <div v-if="mode === 'setLoser'"
          class="bg-gray-100 rounded-md font-normal p-2 text-sm italic mt-2 text-gray-800">
          Where should the loser of this game go? Click on a highlighted game to select it.


        </div>

        <div v-if="mode === 'setWinner'"
          class="bg-gray-100 rounded-md font-normal p-2 text-sm italic mt-2 text-gray-800">
          Where should the winner of this game go? Click on a highlighted game to select it.


        </div>

      </div>
      <div class="flex justify-center rounded-lg gap-1 mt-2">


        <div v-if="mode === 'viewGame'"
          class="w-full max-w-[150px] text-center bg-red-50 text-red-500 rounded-md px-2 py-1 hover:bg-red-500 hover:text-white cursor-pointer"
          @click="deleteGame(selectedGameId, originBracketId)">
          Delete game
        </div>
      </div>
    </div>
  </div>

</div>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { useBracket } from '../lib/useBracket';
import { useEditableBracket } from '../lib/useEditableBracket';
import { useBracketElement } from '../lib/useBracketElement';
import { storeToRefs } from 'pinia'
import { scrollToElement } from '@/shared/utils/scrollToElement';
import { useConnectionStore } from '../lib/useConnection';
import DrawColorIcon from '@/shared/ui/DrawColorIcon.vue';
import RemoveButton from './RemoveButton.vue';
import AddButton from './AddButton.vue';
import WinnerIconBubble from './WinnerIconBubble.vue';
import LoserIconBubble from './LoserIconBubble.vue';
const props = defineProps<{
  bracketId: string
}>()

const emit = defineEmits(['delete'])

const editableBracketStore = useEditableBracket(props.bracketId)()
const { mode } = storeToRefs(editableBracketStore)
const { beginConnect, beginLoserConnect } = editableBracketStore;

const bracketStore = useBracket(props.bracketId)
const { selectedGameId, } = storeToRefs(bracketStore)
const { deleteGameFromBracket, getFullGame, getGameBracketId, updateLoserConnection, removeWinnerConnection } = bracketStore;

const { getConnectableGameElementId } = useBracketElement()

const { originBracketId } = storeToRefs(useConnectionStore());


const selectedGame = computed(() => getFullGame(selectedGameId.value))


function scrollToGame(gameId: string) {
  if (!gameId) return;
  const gameBracketId = getGameBracketId(gameId)
  const elementid = getConnectableGameElementId(gameBracketId, gameId)
  scrollToElement('#' + elementid)
}

const connections = computed(() => selectedGame.value?.game?.connections || {
  winner: '',
  loser: '',
})

const winnerConnection = computed(() => {
  if (!connections.value.winner) return null;
  return getFullGame(connections.value.winner)
})

const loserConnection = computed(() => {
  if (!connections.value.loser) return null;
  return getFullGame(connections.value.loser)
})

const winnerConnectionDrawNumber = computed(() => winnerConnection.value?.drawNumber)
const loserConnectionDrawNumber = computed(() => loserConnection.value?.drawNumber)

function scrollToSelectedGameWinner() {
  const { winner } = connections.value || {}
  if (!winner) return;
  scrollToGame(winner)
}
function scrollToSelectedGameLoser() {
  const { loser } = connections.value || {}
  if (!loser) return;
  scrollToGame(loser)
}


function removeLoserConnection() {
  updateLoserConnection(selectedGameId.value, '')
}

function deleteGame(gameId: string, bracketId: string) {
  deleteGameFromBracket(gameId, bracketId)
  emit('delete')
}
</script>
