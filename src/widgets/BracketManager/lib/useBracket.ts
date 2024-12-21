import type { BracketEvent, BracketGame, BracketGameWithOrigins, BracketGameConnections } from './types'
import { ref, computed, onMounted } from 'vue'
import { useUniqueId } from '@/shared/composables/useUniqueId';
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

export const useBracket = ({
  initialGames = defaultInitialGames
}: {
  initialGames?: BracketEvent
} = {
    initialGames: defaultInitialGames
  }) => {

  const gamesIndex = ref<Map<string, BracketGame[]>>(new Map([]));
  const gamesBracketIndex = ref<Map<string, string>>(new Map([]));

  const games = ref<BracketEvent>(initialGames);


  function initGames() {
    Object.keys(initialGames).forEach((bracket: string) => {
      gamesIndex.value.set(bracket, initialGames[bracket])
      const gamesForBracket = initialGames[bracket];
      gamesForBracket.forEach((game) => {
        gamesBracketIndex.value.set(game.id, bracket)
      })
    })
  }
  onMounted(() => {
    initGames()
  })



  const gamesWithReadableIds = computed(() => {
    return Object.keys(games.value).reduce((all, bracketId, index) => {
      const letter = numberToLetter(index + 1);
      return {
        ...all,
        [bracketId]: games.value[bracketId].map((game, index) => ({
          ...game,
          readableId: `${letter}${index + 1}`,

        }))
      }
    }, {})
  })

  function getAllEventGames() {
    return Object.values(games.value).flat()
  }

  function getGameById(gameId: string): BracketGame | null {
    const game = [...getAllEventGames()].find(({ id }) => id === gameId)
    if (!game) {
      console.warn('could not find game by id ', gameId);
      return null;
    };
    return game;
  }

  function getGamesForBracket(bracketId: string) {
    if (!games.value[bracketId]) {
      console.warn('No bracket found with ID ', bracketId);
      return []
    }
    return games.value[bracketId]
  }

  function setGamesForBracket(newGames: BracketGame[], bracketId: string) {
    if (!games.value[bracketId]) {
      console.warn('No games found for bracket ', bracketId);
      return;
    }
    games.value[bracketId] = newGames;
    gamesIndex.value.set(bracketId, newGames)
    newGames.forEach((game) => {
      gamesBracketIndex.value.set(game.id, bracketId)
    })
  }

  function getNumRequiredTeamsForBracketEvent(games: BracketGame[]) {
    let num = games.length * 2;
    games.forEach(({ id }) => {
      const numConnections = games.filter(({ connections }) => connections.winner === id || connections.loser === id)?.length
      num -= numConnections;
    })
    return num;
  }


  function getGamesWithOrigins(event: BracketEvent): {
    [key: string]: BracketGameWithOrigins[]
  } {
    return Object.keys(event).reduce((acc, bracketId) => {
      const bracketGames = event[bracketId]
      return {
        ...acc,
        [bracketId]: [
          ...bracketGames.map((game) => ({
            ...game,
            origins: {
              winner: getOriginWinnerConnections(game),
              loser: getOriginLoserConnections(game),
            }
          }))
        ]
      }
    }, {})
  }

  function getGameIndexById(gameId: string, bracketId: string) {
    const index = getGamesForBracket(bracketId).findIndex(({ id }) => id === gameId)
    if (index < 0) {
      console.warn('Could not find game with ID ', gameId, ' in bracket ', bracketId)
    }
    return index
  };

  function updateGame(updatedGame: BracketGame, bracketId: string) {
    const { id } = updatedGame;
    const index = getGameIndexById(id, bracketId)
    if (index < 0) return;
    games.value[bracketId].splice(index, 1, updatedGame)
  }

  function updateGames(newGames: BracketEvent) {
    games.value = newGames;
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
    const bracketId = getGameBracketId(gameId)
    const updatedGame = updateGameConnections(gameId, {
      winner: ''
    }, bracketId)
    if (!updatedGame) return;
    updateGame(updatedGame, bracketId)
  }

  function addWinnerConnection(originGameId: string, winnerGameId: string, bracketId: string) {
    const updatedGame = updateGameConnections(originGameId, {
      winner: winnerGameId,
    }, bracketId)
    if (!updatedGame) return;
    updateGame(updatedGame, bracketId)
  }

  function updateLoserConnection(originGameId: string, loserGameId: string) {
    const bracketId = getGameBracketId(originGameId)
    const updatedGame = updateGameConnections(originGameId, {
      loser: loserGameId,
    }, bracketId)
    if (!updatedGame) return;
    updateGame(updatedGame, bracketId)
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

  function deleteGameFromBracket(gameId: string, bracketId: string) {
    const gameIndex = getGameIndexById(gameId, bracketId);
    const gamesClone = [...games.value[bracketId]];
    gamesClone.splice(gameIndex, 1);
    setGamesForBracket(gamesClone, bracketId)
    gamesBracketIndex.value.delete(gameId)
    removeConnectionsToGame(gameId)
  }

  function getOriginWinnerConnections(game: BracketGame) {
    return getAllEventGames().filter(({ connections }) => connections.winner === game.id)
  }

  function getOriginLoserConnections(game: BracketGame) {
    return getAllEventGames().filter(({ connections }) => connections.loser === game.id)
  }

  function getAllOriginConnections(game: BracketGame) {
    return [...getOriginWinnerConnections(game), ...getOriginLoserConnections(game)]
  }

  function hasLessThanTwoOriginWinnerConnections(game: BracketGame) {
    return getOriginWinnerConnections(game).length < 2;
  }

  function hasLessThanTwoOriginLoserConnections(game: BracketGame) {
    return getOriginLoserConnections(game).length < 2;
  }

  function getConnectedGames(gameId: string) {
    const game = getGameById(gameId);
    const { winner, loser } = game?.connections
    return getAllEventGames().filter(({ id }) => [winner, loser].includes(id))
  }

  function getAvailableLoserGames(gameId: string) {
    const game = getGameById(gameId);
    const thisBracket = getGameBracketId(gameId)
    const { roundNumber: thisRoundNumber } = game;
    return getAllEventGames().filter((game: BracketGame) => {
      if (!hasLessThanTwoOriginLoserConnections(game)) return false;
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
    return gamesBracketIndex.value.get(gameId)
  }

  function addGame(newGame: BracketGame, bracketId: string,) {
    const gamesClone = [...games.value[bracketId], newGame]
    setGamesForBracket(gamesClone, bracketId)
  }



  return {
    games,
    gamesIndex,
    gamesBracketIndex,
    addGame,
    deleteGameFromBracket,
    getAllEventGames,
    getAllOriginConnections,
    getAvailableLoserGames,
    getAvailableWinnerGames,
    getConnectedGames,
    getGameBracketId,
    getGamesForBracket,
    setGamesForBracket,
    getNumRequiredTeamsForBracketEvent,
    getGamesWithOrigins,
    removeConnectionsToGame,
    removeRoundFromBracket,
    updateGames,
    updateGameConnections,
    removeWinnerConnection,
    addWinnerConnection,
    updateLoserConnection,
    gamesWithReadableIds,
  }
}
