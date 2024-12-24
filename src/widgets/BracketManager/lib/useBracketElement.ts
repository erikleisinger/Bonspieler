export const useBracketElement = () => {
  function getBracketRoundElementId(uniqueId: string, round: number) {
    return `BRACKET_ROUND_${uniqueId}_${round}`
  }

  function getConnectableGameElementId(bracketId: string, gameId: string) {
    return `CONNECTABLE_GAME_${bracketId}_${gameId}`
  }

  function getBracketGameElementId(uniqueId: string, gameId: string) {
    return `BRACKET_GAME_${uniqueId}_${gameId}`
  }

  function getBracketElementId(bracketId: string) {
    return `BRACKET_${bracketId}`
  }

  return {
    getBracketRoundElementId,
    getConnectableGameElementId,
    getBracketGameElementId,
    getBracketElementId,
  }
}
