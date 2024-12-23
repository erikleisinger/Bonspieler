import type { BracketEvent, BracketGame, BracketGameWithOrigins, BracketGameConnections } from './types'
import { ref, computed, watch } from 'vue'
import { useUniqueId } from '@/shared/composables/useUniqueId';
import { defineStore } from 'pinia'
import { useRefHistory } from '@vueuse/core';
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
    }>>(new Map([]));

    const gamesBracketIndex = ref<Map<string, BracketGame[]>>(new Map([]));
    const games = ref<BracketEvent>({});

    const allGames = computed(() => {
      return Object.values(games.value).flat()
    })

    function reset() {
      games.value = {};
      gamesIndex.value = new Map([]);
      gamesBracketIndex.value = new Map([]);
    }


    function initGames(initialGames = defaultInitialGames) {
      Object.keys(initialGames).forEach((bracket: string) => {
        const gamesForBracket = initialGames[bracket];
        games.value[bracket] = [];
        setGamesForBracket(gamesForBracket, bracket)

        gamesForBracket.forEach((game) => {
          gamesIndex.value.set(game.id, {
            game,
            bracketId: bracket,
          })
          gamesBracketIndex.value.set(bracket, gamesForBracket)
        })
      })
    }

    function addBracket() {
      const id = useUniqueId();
      games.value[id] = [];
    }

    const deletedBracketIds = ref<string[]>([])
    function deleteBracket(bracketIdToDelete: string) {
      const gamesClone = { ...games.value };
      const bracketGames = gamesClone[bracketIdToDelete];
      Object.keys(gamesClone).forEach((bracketId) => {
        const newGames = [...gamesClone[bracketId]].map((g) => ({
          ...g,
          connections: {
            winner: bracketGames.find(({ id }) => id === g.connections.winner) ? '' : g.connections.winner,
            loser: bracketGames.find(({ id }) => id === g.connections.loser) ? '' : g.connections.loser,
          }
        }))
        setGamesForBracket(newGames, bracketId)
      })
      delete games.value[bracketIdToDelete];
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

    function setGamesForBracket(newGames: BracketGame[], bracketId: string) {
      if (!games.value[bracketId]) {
        console.warn('No games found for bracket ', bracketId);
        return;
      }
      games.value[bracketId] = newGames;
      gamesBracketIndex.value.set(bracketId, newGames)
      newGames.forEach((game) => {
        gamesIndex.value.set(game.id, {
          game,
          bracketId
        })
      })
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


    function getEditableGames(gamesArr: BracketGame[]): BracketGameWithOrigins[] {
      const getBracketIndex = (id: string) => {
        return Array.from(gamesBracketIndex.value.keys()).indexOf(id)
      }
      return [...gamesArr].map((game, index) => {
        const bracketId = getGameBracketId(game.id)
        const bracketIndex = getBracketIndex(bracketId)
        return {
          ...game,
          origins: {
            winner: getOriginWinnerConnections(game),
            loser: getOriginLoserConnections(game),
          },
          readableId: game.readableId || `${numberToLetter(bracketIndex + 1)}${index + 1}`
        }
      })

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

    function updateGames(newGames: BracketEvent) {
      games.value = newGames;
      Object.keys(newGames).forEach((bracketId) => {
        setGamesForBracket(newGames[bracketId], bracketId)
      })
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
    }

    function removeConnectionsToGame(gameId: string) {
      const eventClone = { ...games.value }
      Object.keys(games.value).forEach((bracketId) => {
        const gamesCopy = [...eventClone[bracketId]].map((g) => updateGameConnections(g.id, {
          ...g.connections,
          winner: g.connections.winner === gameId ? '' : g.connections.winner,
          loser: g.connections.loser === gameId ? '' : g.connections.loser,
        }, bracketId)).filter(Boolean) as BracketGame[]
        setGamesForBracket(gamesCopy, bracketId)
      })
    }

    function removeRoundFromBracket(roundNumber: number, bracketId: string) {

      const eventClone = { ...games.value };

      const roundGames = eventClone[bracketId].filter(({ roundNumber: rn }) => rn === roundNumber);
      const newGamesForBracket = eventClone[bracketId].filter(({ roundNumber: rn }) => rn !== roundNumber);
      setGamesForBracket(newGamesForBracket, bracketId)
      roundGames.forEach(({ id }) => removeConnectionsToGame(id))

    }

    const deletedGameIds = ref<string[]>([])
    function deleteGameFromBracket(gameId: string, bracketId: string) {
      const gameIndex = getGameIndexById(gameId, bracketId);
      const gamesClone = [...games.value[bracketId]];
      gamesClone.splice(gameIndex, 1);
      setGamesForBracket(gamesClone, bracketId)
      gamesIndex.value.delete(gameId)
      removeConnectionsToGame(gameId)
      deletedGameIds.value.push(gameId)
    }

    function getOriginWinnerConnections(game: BracketGame) {
      return allGames.value.filter(({ connections }) => connections.winner === game.id)
    }

    function getOriginLoserConnections(game: BracketGame) {
      return allGames.value.filter(({ connections }) => connections.loser === game.id)
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
      const gamesClone = [...games.value[bracketId], newGame]
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
    }

    const drawNumbers = computed(() => {
      const sheets = numSheets.value <= 0 ? 1 : numSheets.value;
      return getDrawNumbersForBracketGames(allGames.value, sheets)
    })

    const drawCount = computed(() => {
      return getNumberOfDrawsForBracketEvent(drawNumbers.value)
    })


    return {
      allGames,
      deletedGameIds,
      deletedBracketIds,
      drawCount,
      drawNumbers,
      games,
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
      getEditableGames,
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
      updateGames,
      updateLoserConnection,

    }
  })

  return useBracketStore()
}


