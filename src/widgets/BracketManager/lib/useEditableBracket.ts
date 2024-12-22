import { ref } from "vue"
import { useBracket } from "./useBracket"
import { useConnectionStore } from "./useConnection"
import { defineStore, storeToRefs } from 'pinia'

type BracketManagerMode = 'view' | 'viewGame' | 'viewDraw' | 'setWinner' | 'setLoser'

export const useEditableBracket = (id: string) => {

  return defineStore('editableBracket' + id, () => {
    const { useBracketStore } = useBracket(id)
    const bracketStore = useBracketStore();
    const { setOriginId, setConnectionId, setOriginBracketId, setLoserOriginId } = useConnectionStore()
    const { setSelectedGameId, getGameBracketId } = bracketStore
    const { selectedGameId } = storeToRefs(bracketStore)

    const mode = ref<BracketManagerMode>('view')
    function setBracketManagerMode(newMode: BracketManagerMode) {
      mode.value = newMode;
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

    return {
      beginConnect,
      beginLoserConnect,
      setBracketManagerMode,
      mode
    }
  })
}
