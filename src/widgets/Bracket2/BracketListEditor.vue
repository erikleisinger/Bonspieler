<template>
<div class="flex gap-2 ">
  <div v-for="bracket, index in Object.keys(editedGames)" :key="bracket">
    <div v-if="!editMode" @click="onClick(bracket)"
      class="w-[150px] py-2 px-4 bg-white rounded-lg text-center hover:bg-blue-500 hover:text-white cursor-pointer">
      Bracket {{ index + 1 }}
    </div>
    <div v-else
      class="w-[150px] py-2 px-4 bg-black/50 rounded-lg text-center hover:bg-red-500 hover:text-white cursor-pointer"
      @click="deleteBracket(bracket)">
      - Bracket {{ index + 1 }}
    </div>
  </div>
  <div class="flex justify-center gap-2">
    <NumberBubble class="bg-blue-500 text-white cursor-pointer w-[40px] h-[40px] text-2xl" @click="addBracket"
      v-if="!editMode">+
    </NumberBubble>
    <NumberBubble class="bg-green-500 text-white cursor-pointer w-[40px] h-[40px] text-2xl" @click="editMode = false"
      v-if="editMode">
      <Checkmark class=" h-[20px] w-[20px] mb-[-3px] fill-white" />

    </NumberBubble>
    <NumberBubble class="bg-white-500 text-white cursor-pointer w-[40px] h-[40px] text-2xl" @click="editMode = true"
      v-else>

      <Pencil class=" h-[20px] w-[20px] mb-[-3px] fill-blue-500" />
    </NumberBubble>
  </div>

</div>
</template>
<script setup>
import { useUniqueId } from '@/shared/composables/useUniqueId';
import { ref, computed } from 'vue'
import NumberBubble from '@/shared/ui/NumberBubble.vue';
import Pencil from '@/shared/icons/Pencil.vue'
import Checkmark from '@/shared/icons/Checkmark.vue'
const props = defineProps({
  games: Object
})

const emit = defineEmits(['update:games', 'click'])

const editedGames = computed({
  get() {
    return props.games;
  },
  set(newGames) {
    emit('update:games', newGames);
  }
})

function addBracket() {
  const id = useUniqueId();
  editedGames.value[id] = []
}

const editMode = ref(false)

function onClick(bracket) {
  if (!editMode.value) {
    emit('click', bracket)
  }
}

function deleteBracket(bracket) {
  const gamesClone = { ...editedGames.value };
  const bracketGames = gamesClone[bracket];
  Object.keys(gamesClone).forEach((bracketId) => {
    const newGames = [...gamesClone[bracketId]].map((g) => ({
      ...g,
      connections: {
        winner: bracketGames.find(({ id }) => id === g.connections.winner) ? '' : g.connections.winner,
        loser: bracketGames.find(({ id }) => id === g.connections.loser) ? '' : g.connections.loser,
      }
    }))
    gamesClone[bracketId] = newGames;
  })
  delete gamesClone[bracket];
  editedGames.value = gamesClone;
}
</script>
