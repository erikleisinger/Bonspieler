import { ref } from "vue"
import { useBracket } from "./useBracket"
import { useConnectionStore } from "./useConnection"
import { useBracketElement } from "./useBracketElement"

import { defineStore, storeToRefs } from 'pinia'


type BracketManagerMode = 'view' | 'viewGame' | 'viewDraw' | 'setWinner' | 'setLoser' | 'assignTeam'

export const useEditableBracket = (id: string) => {

  return defineStore('editableBracket' + id, () => {
    const bracketStore = useBracket(id)
    const { setOriginId, setConnectionId, setOriginBracketId, setLoserOriginId } = useConnectionStore()
    const { setSelectedGameId, getGameBracketId } = bracketStore
    const { selectedGameId } = storeToRefs(bracketStore)

    const mode = ref<BracketManagerMode>('view')
    function setBracketManagerMode(newMode: BracketManagerMode) {
      mode.value = newMode;
    }



    const { getConnectableGameElementId } = useBracketElement()
    function beginConnect(gameId: string) {
      const bracketId = getGameBracketId(gameId)
      setBracketManagerMode('setWinner')
      setOriginId(getConnectableGameElementId(bracketId, gameId));
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

    const teamToAssignId = ref<string | null>(null)

    function beginTeamAssign(teamId: string) {
      teamToAssignId.value = teamId
      setBracketManagerMode('assignTeam')
    }

    function setTeamToAssign(teamId: string | null) {
      teamToAssignId.value = teamId
    }


    return {
      beginConnect,
      beginLoserConnect,
      beginTeamAssign,
      setBracketManagerMode,
      setTeamToAssign,
      mode,
      teamToAssignId,
    }
  })
}
