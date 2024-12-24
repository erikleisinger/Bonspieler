<template>
<div class="flex gap-2 ">
  <div v-for="bracket, index in Array.from(gamesBracketIndex.keys())" :key="bracket">
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
  <div class="flex justify-center gap-2" v-if="editable">
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
<script setup lang="ts">
import { useUniqueId } from '@/shared/composables/useUniqueId';
import { ref, computed } from 'vue'
import NumberBubble from '@/shared/ui/NumberBubble.vue';
import Pencil from '@/shared/icons/Pencil.vue'
import Checkmark from '@/shared/icons/Checkmark.vue'
import { useBracket } from '../lib/useBracket';
import { useBracketElement } from '../lib/useBracketElement';
import { scrollToElement } from '@/shared/utils/scrollToElement';
import { storeToRefs } from 'pinia';
const props = defineProps({
  editable: Boolean,
  storeId: String
})

const store = useBracket(props.storeId)
const { gamesBracketIndex } = storeToRefs(store)
const { addBracket, deleteBracket } = store;

const emit = defineEmits(['update:games',])

const { getBracketElementId } = useBracketElement();


const editMode = ref(false)

function onClick(bracketId: string) {
  if (editMode.value) return;
  scrollToElement('#' + getBracketElementId(bracketId))

}

</script>
