import { defineStore } from "pinia"
import { ref } from 'vue'
export const useDraggableStore = defineStore('draggable', () => {
  const dragElementId = ref('')

  function setDragElementId(id: string) {
    dragElementId.value = id
  }
  return {
    dragElementId,
    setDragElementId
  }
})
