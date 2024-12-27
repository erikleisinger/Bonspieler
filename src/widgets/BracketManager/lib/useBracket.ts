import type { BracketGame, BracketGameWithOrigins, BracketGameConnections } from './types'
import { ref, computed, watch } from 'vue'
import { useUniqueId } from '@/shared/composables/useUniqueId';
import { defineStore } from 'pinia'
import { useSchedule } from './useSchedule';
const defaultInitialGames = {
  [useUniqueId()]: [],
}

function numberToLetter(n: number) {
  let result = '';
  while (n > 0) {
    n--;
    result = String.fromCharCode(65 + (n % 26)) + result;
    n = Math.floor(n / 26);
  }
  return result;
}

export const useBracket = (id: string = useUniqueId()) => {
  const useBracketStore = defineStore('bracket' + id, () => {

    const gamesIndex = ref<Map<string, {
      game: BracketGame,
      bracketId: string,
      origins: {
        winner: BracketGameConnections,
        loser: BracketGameConnections
      },
      readableId?: string,
      drawNumber: number
    }>>(new Map([]));

    const gamesBracketIndex = ref<Map<string, BracketGame[]>>(new Map([]));

    const allGames = computed(() => {
      return Array.from(gamesIndex.value.values()).map(({ game }) => game)
    })

    const drawNumbers = ref({})

    function reset() {
      gamesIndex.value = new Map([]);
      gamesBracketIndex.value = new Map([]);
    }


    function initGames(initialGames = defaultInitialGames) {
      reset();
      Object.keys(initialGames).forEach((bracket: string) => setGamesForBracket(initialGames[bracket], bracket, Object.values(initialGames).flat()))
    }

    function addBracket() {
      const id = useUniqueId();
      setGamesForBracket([], id);
    }

    const deletedBracketIds = ref<string[]>([])
    function deleteBracket(bracketIdToDelete: string) {
      const bracketGames = gamesBracketIndex.value.get(bracketIdToDelete) || [];
      gamesBracketIndex.value.forEach((_, bracketId) => {
        const newGames = (gamesBracketIndex.value.get(bracketId) || []).map((g) => ({
          ...g,
          connections: {
            winner: bracketGames.find(({ id }) => id === g.connections.winner) ? '' : g.connections.winner,
            loser: bracketGames.find(({ id }) => id === g.connections.loser) ? '' : g.connections.loser,
          }
        }))
        setGamesForBracket(newGames, bracketId)
      })
      gamesBracketIndex.value.delete(bracketIdToDelete)
      deletedBracketIds.value.push(bracketIdToDelete)
    }





    function getGameById(gameId: string): BracketGame | null {
      const { game } = gamesIndex.value.get(gameId) || {}
      if (!game) {
        console.warn('could not find game by id ', gameId);
        return null;
      };
      return game
    }

    function getGamesForBracket(bracketId: string) {
      const g = gamesBracketIndex.value.get(bracketId)
      if (!g) {
        console.warn('No bracket found with ID ', bracketId);
        return []
      }
      return g
    }

    function updateDrawNumbers() {
      getDrawNumbers()
      allGames.value.forEach(({ id }) => {
        gamesIndex.value.set(id, {
          ...gamesIndex.value.get(id),
          drawNumber: drawNumbers.value[id]
        })
      })
    }

    function setGamesForBracket(newGames: BracketGame[], bracketId: string, games?: BracketGame[]) {
      gamesBracketIndex.value.set(bracketId, newGames)
      const bracketIndex = Array.from(gamesBracketIndex.value.keys()).indexOf(bracketId)
      newGames.forEach((game, index) => {
        gamesIndex.value.set(game.id, {
          game,
          bracketId,
          origins: {
            winner: getOriginWinnerConnections(game, games),
            loser: getOriginLoserConnections(game, games),
          },
          readableId: game.readableId || `${numberToLetter(bracketIndex + 1)}${index + 1}`
        })
      })
      newGames.forEach((game, index) => {
        gamesIndex.value.set(game.id, {
          game,
          bracketId,
          origins: {
            winner: getOriginWinnerConnections(game, games),
            loser: getOriginLoserConnections(game, games),
          },
          readableId: game.readableId || `${numberToLetter(bracketIndex + 1)}${index + 1}`
        })
      })
      updateDrawNumbers()
    }

    function getNumRequiredTeamsForBracketEvent() {
      let num = allGames.value.length * 2;
      allGames.value.forEach(({ id }) => {
        const numConnections = allGames.value.filter(({ connections }) => connections.winner === id || connections.loser === id)?.length
        num -= numConnections;
      })
      return num;
    }

    function getNumEndTeamsForBracketEvent() {
      return allGames.value.filter(({ connections }) => !connections?.winner).length
    }

    function getGameIndexById(gameId: string, bracketId: string) {
      const index = getGamesForBracket(bracketId).findIndex(({ id }) => id === gameId)
      if (index < 0) {
        console.warn('Could not find game with ID ', gameId, ' in bracket ', bracketId)
      }
      return index
    };

    function updateGame(updatedGame: BracketGame) {
      const { id } = updatedGame;
      const bracketId = gamesIndex.value.get(id)?.bracketId;
      if (!bracketId) {
        console.warn('Could not find game with ID ', id, ' in any bracket')
        return;
      }
      const index = getGameIndexById(id, bracketId)
      if (index < 0) return;
      const gamesClone = [...(gamesBracketIndex.value.get(bracketId) || [])];
      gamesClone.splice(index, 1, updatedGame)
      setGamesForBracket(gamesClone, bracketId)
    }

    function updateGameConnections(gameId: string, connections: Partial<BracketGameConnections>, bracketId: string): BracketGame | null {
      const { winner, loser } = connections;
      const gameClone = getGameById(gameId)
      if (!gameClone) return null;
      const updatedGame = {
        ...gameClone,
        connections: {
          winner: winner !== undefined ? winner : gameClone?.connections?.winner,
          loser: loser !== undefined ? loser : gameClone?.connections?.loser
        }
      }

      return updatedGame;
    }

    function removeWinnerConnection(gameId: string) {
      const { bracketId } = gamesIndex.value.get(gameId) || {};
      if (!bracketId) {
        console.warn('Could not remove winner connection for game ', gameId, ': bracket not found')
        return;
      }
      const updatedGame = updateGameConnections(gameId, {
        winner: ''
      }, bracketId)
      if (!updatedGame) return;
      updateGame(updatedGame)
    }

    function addWinnerConnection(originGameId: string, winnerGameId: string, bracketId: string) {
      const updatedGame = updateGameConnections(originGameId, {
        winner: winnerGameId,
      }, bracketId)
      if (!updatedGame) return;
      updateGame(updatedGame)
    }

    function updateLoserConnection(originGameId: string, loserGameId: string) {
      const bracketId = getGameBracketId(originGameId)
      const updatedGame = updateGameConnections(originGameId, {
        loser: loserGameId,
      }, bracketId)
      if (!updatedGame) return;
      updateGame(updatedGame)
      gamesBracketIndex.value.forEach((_, bracketId) => {
        const gamesCopy = Array.from(gamesIndex.value.values()).filter((g) => g.bracketId === bracketId).map(({ game }) => game)
        setGamesForBracket(gamesCopy, bracketId)
      })
    }

    function removeConnectionsToGame(gameId: string) {
      gamesBracketIndex.value.forEach((gamesList, bracketId) => {
        const gamesCopy = [...gamesList].map((g) => updateGameConnections(g.id, {
          ...g.connections,
          winner: g.connections.winner === gameId ? '' : g.connections.winner,
          loser: g.connections.loser === gameId ? '' : g.connections.loser,
        }, bracketId)).filter(Boolean) as BracketGame[]
        setGamesForBracket(gamesCopy, bracketId)
      })
    }

    function removeRoundFromBracket(roundNumber: number, bracketId: string) {
      const roundGames = gamesBracketIndex.value.get(bracketId)
      if (!roundGames) return;
      const filtered = roundGames.filter(({ roundNumber: rn }) => rn === roundNumber);
      const newGamesForBracket = roundGames.filter(({ roundNumber: rn }) => rn !== roundNumber);
      setGamesForBracket(newGamesForBracket, bracketId)
      filtered.forEach(({ id }) => {
        removeConnectionsToGame(id)
        deletedGameIds.value.push(id)
      })

    }

    const deletedGameIds = ref<string[]>([])
    function deleteGameFromBracket(gameId: string, bracketId: string) {
      const gameIndex = getGameIndexById(gameId, bracketId);
      const gamesClone = gamesBracketIndex.value.get(bracketId) || [];
      gamesClone.splice(gameIndex, 1);
      setGamesForBracket(gamesClone, bracketId)
      gamesIndex.value.delete(gameId)
      removeConnectionsToGame(gameId)
      deletedGameIds.value.push(gameId)
    }

    function getOriginWinnerConnections(game: BracketGame, games: BracketGame[] = allGames.value) {
      return games.filter(({ connections }) => connections.winner === game.id)
    }

    function getOriginLoserConnections(game: BracketGame, games: BracketGame[] = allGames.value) {
      return games.filter(({ connections }) => connections.loser === game.id)
    }

    function getAllOriginConnections(game: BracketGame) {
      return [...getOriginWinnerConnections(game), ...getOriginLoserConnections(game)]
    }

    function hasLessThanTwoOriginWinnerConnections(game: BracketGame) {
      return getOriginWinnerConnections(game).length < 2;
    }

    function hasLessThanTwoOriginConnections(game: BracketGame) {
      return getAllOriginConnections(game)?.length < 2
    }

    function getConnectedGames(gameId: string) {
      const game = getGameById(gameId);
      const { winner, loser } = game?.connections
      return allGames.value.filter(({ id }) => [winner, loser].includes(id))
    }

    function getAvailableLoserGames(gameId: string) {
      const game = getGameById(gameId);
      const thisBracket = getGameBracketId(gameId)
      const { roundNumber: thisRoundNumber } = game;
      return allGames.value.filter((game: BracketGame) => {
        if (getAllOriginConnections(game)?.length > 1) return false;
        const { roundNumber } = game;
        if (roundNumber > thisRoundNumber) return true;
        return (getGameBracketId(game.id) !== thisBracket)
      })
    }

    function getAvailableWinnerGames(gameId: string) {
      const bracketId = getGameBracketId(gameId)
      return getGamesForBracket(bracketId).filter((game: BracketGame) => hasLessThanTwoOriginWinnerConnections(game))
    }

    function getGameBracketId(gameId: string) {
      const g = gamesIndex.value.get(gameId)
      if (!g) {
        console.warn('could not find bracket for game ', gameId, ' : game not found.')
        return ''
      }
      return g.bracketId
    }

    function addGame(newGame: BracketGame, bracketId: string,) {
      const bracketGames = getGamesForBracket(bracketId) || []
      const gamesClone = [...bracketGames, newGame]
      setGamesForBracket(gamesClone, bracketId)
    }

    function getRoundsForBracket(bracketId: string) {
      const games = getGamesForBracket(bracketId)
      const maxRound = games.map(({ roundNumber }) => roundNumber).sort((a, b) => a - b).pop();
      if (maxRound) {
        return Array.from(Array(maxRound).keys()).map(i => i + 1);
      }
      return []
    }

    const selectedGameId = ref('');

    function setSelectedGameId(id: string) {
      selectedGameId.value = id
    }

    const loserGame = computed(() => {
      if (!selectedGameId.value) return;
      return getGameById(selectedGameId.value)?.connections?.loser
    })

    const winnerGame = computed(() => {
      if (!selectedGameId.value) return;
      return getGameById(selectedGameId.value)?.connections?.winner
    })


    /** Sheets & Draws */

    const { getDrawNumbersForBracketGames, getNumberOfDrawsForBracketEvent } = useSchedule()


    const numSheets = ref(6)

    function setNumSheets(n: number) {
      numSheets.value = n
      updateDrawNumbers()

    }
    function getDrawNumbers() {
      const sheets = numSheets.value <= 0 ? 1 : numSheets.value;
      drawNumbers.value = getDrawNumbersForBracketGames(allGames.value, sheets)
    }


    const drawCount = computed(() => {
      return getNumberOfDrawsForBracketEvent(drawNumbers.value)
    })

    function getFullGame(gameId: string) {
      return gamesIndex.value.get(gameId)
    }


    return {
      allGames,
      deletedGameIds,
      deletedBracketIds,
      drawCount,
      gamesBracketIndex,
      gamesIndex,

      loserGame,
      numSheets,
      selectedGameId,
      winnerGame,
      addBracket,
      addGame,
      addWinnerConnection,
      deleteGameFromBracket,
      deleteBracket,
      getAllOriginConnections,
      getAvailableLoserGames,
      getAvailableWinnerGames,
      getConnectedGames,
      getFullGame,
      getGameBracketId,
      getGameById,
      getGamesForBracket,
      getNumEndTeamsForBracketEvent,
      getNumRequiredTeamsForBracketEvent,
      getRoundsForBracket,
      hasLessThanTwoOriginConnections,
      initGames,
      removeConnectionsToGame,
      removeRoundFromBracket,
      removeWinnerConnection,
      reset,
      setGamesForBracket,
      setNumSheets,
      setSelectedGameId,
      updateGame,
      updateGameConnections,
      updateLoserConnection,
    }
  })

  return useBracketStore()
}


