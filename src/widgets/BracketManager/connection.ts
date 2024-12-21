import { defineStore } from "pinia";
import { ref } from 'vue'

const originId = ref('');
const connectionId = ref('');
const loserOriginId = ref('')
const originBracketId = ref('')

export const useConnectionStore = defineStore('connection', () => {

  function setOriginId(id: string) {
    originId.value = id
  }

  function setConnectionId(id: string) {
    connectionId.value = id
  }

  function setLoserOriginId(id: string) {
    loserOriginId.value = id
  }
  function setOriginBracketId(id: string) {
    originBracketId.value = id
  }

  return {
    originId,
    setOriginId,
    connectionId,
    loserOriginId,
    setConnectionId,
    setLoserOriginId,
    setOriginBracketId,
    originBracketId,
  }
})
