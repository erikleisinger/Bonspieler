import type { BracketGame } from './types'

function getGameConnections(gameId: string, games: BracketGame[]): BracketGame[] {
  const g = games.find(({ id }) => id === gameId)
  if (!g) return [];
  const { winner, loser } = g.connections || {};
  return [winner, loser].filter(Boolean).map((id) => games.find(({ id: gameId }) => gameId === id)).filter(Boolean) as BracketGame[]
}

function recursiveFindOrigins(gameId: string, games: BracketGame[]): BracketGame[] {
  const origins = getGameConnections(gameId, games);
  if (!origins?.length) return [];
  return origins.reduce((acc, game) => {
    return [...acc, ...recursiveFindOrigins(game.id, games)]
  }, origins)
}

export const useSchedule = () => {
  function getDrawNumbersForBracketGames(games: BracketGame[], sheets: number = 8): {
    [key: string]: number;
  } {
    let g = games.reduce((all, { id }) => {
      const num = recursiveFindOrigins(id, games);
      return {
        ...all,
        [id]: num
      }
    }
      , {}) as {
        [gameId: string]: BracketGame[]
      }

    const h = {};

    Object.entries(g).sort((a, b) => (b[1]?.length || 0) - (a[1]?.length || 0)).reduce((acc, [id, gamesArr]) => {
      const avaib = acc.findIndex((arr, i) => {
        if (!arr) return false;
        if (arr.length >= sheets) return false
        if (arr.some((ob) => ob.games.some(({ id: gameId }) => gameId === id))) return false;
        return true;
      })
      if (avaib < 0) {
        return [...acc, [{
          id,
          games: gamesArr
        }]]
      } else {
        const accClone = [...acc];
        accClone[avaib].push({
          id,
          games: gamesArr
        })
        return accClone;

      }
    }, []).forEach((arr, index) => {
      arr.forEach(({ id: gameId }) => {
        h[gameId] = index + 1;
      })
    })
    return h;
  }

  function getNumberOfDrawsForBracketEvent(drawNumbers: { [key: string]: number }) {
    const num = Math.max(...Object.values(drawNumbers))
    if (Math.abs(num) === Infinity) return 1;
    return num
  }

  return {
    getDrawNumbersForBracketGames,
    getNumberOfDrawsForBracketEvent
  }
}
