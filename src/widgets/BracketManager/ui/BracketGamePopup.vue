<template>
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
            @click="scrollToSelectedGameWinner">
            <WinnerIconBubble />
            <DrawColorIcon class="w-[12px] h-[12px] " v-if="selectedGame?.connections?.winner"
              :drawNumber="drawNumbers[selectedGame.connections.winner]" />
            <div>{{ selectedGame?.connections?.winner || 'No winning game set' }}</div>
          </div>
          <RemoveButton @click="removeWinnerConnection(selectedGameId)"
            v-if="selectedGame && selectedGame.connections?.winner" />
          <AddButton v-else @click="beginConnect(selectedGameId)"></AddButton>

        </div>
        <div v-if="selectedGameId && mode === 'viewGame'" class="flex gap-2 items-center mt-2">
          <div
            class="flex items-center gap-2 font-normal py-1 px-2 bg-gray-100 hover:bg-gray-200 rounded-md  cursor-pointer grow"
            @click="scrollToSelectedGameLoser">
            <LoserIconBubble />
            <DrawColorIcon class="w-[12px] h-[12px] " v-if="selectedGame?.connections?.loser"
              :drawNumber="drawNumbers[selectedGame.connections.loser]" />
            <div>{{ selectedGame?.connections?.loser || 'No losing game set' }}</div>
          </div>
          <RemoveButton @click="removeLoserConnection(selectedGameId)"
            v-if="selectedGame && selectedGame.connections?.loser" />
          <AddButton v-else @click="beginLoserConnect" />
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
const { selectedGameId, drawNumbers } = storeToRefs(bracketStore)
const { deleteGameFromBracket, getGameById, getGameBracketId, updateLoserConnection } = bracketStore;

const { getConnectableGameElementId } = useBracketElement()

const { originBracketId } = storeToRefs(useConnectionStore());


const selectedGame = computed(() => getGameById(selectedGameId.value))


function scrollToGame(gameId: string) {
  if (!gameId) return;
  const gameBracketId = getGameBracketId(gameId)
  const elementid = getConnectableGameElementId(gameBracketId, gameId)
  scrollToElement('#' + elementid)
}

function scrollToSelectedGameWinner() {
  const { winner } = selectedGame.value?.connections || {}
  if (!winner) return;
  scrollToGame(winner)
}
function scrollToSelectedGameLoser() {
  const { loser } = selectedGame.value?.connections || {}
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
