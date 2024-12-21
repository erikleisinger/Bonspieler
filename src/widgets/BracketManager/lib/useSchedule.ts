import type { BracketGame } from './types'
import { chunkArray } from './chunkArray';

function findOriginGames(gameId: string, games: BracketGame[]) {
  return games.filter(({ connections }) => connections.winner === gameId || connections.loser === gameId).map(({ id }) => id)
}

function recursiveFindOrigins(gameId: string, games: BracketGame[]): number {
  const originIds = findOriginGames(gameId, games);
  if (!originIds?.length) return 0;
  const num = originIds.length;
  return originIds.reduce((acc, id) => {
    return acc + recursiveFindOrigins(id, games)
  }, num)
}


export const useSchedule = () => {
  function getDrawNumbersForBracketGames(games: BracketGame[], sheets: number = 8): {
    [key: string]: number;
  } {
    let nums: number[] = []
    let g = games.reduce((all, { id }) => {
      const num = recursiveFindOrigins(id, games);
      if (!nums.includes(num)) nums.push(num)
      return {
        ...all,
        [id]: num
      }
    }
      , {})



    nums = nums.sort((a, b) => a - b)

    Object.keys(g).forEach((id) => {
      const num = g[id];
      const index = nums.indexOf(num);
      g[id] = index + 1;
    })

    const indexAsKey = Object.keys(g).reduce((all, id) => {
      return {
        ...all,
        [g[id]]: [...(all[g[id]] || []), id]
      }
    }, {});
    const o = Object.keys(indexAsKey).reduceRight((all, current) => {
      if (indexAsKey[current].length > sheets) {
        const chunked = chunkArray(indexAsKey[current], sheets)
        const numChunks = chunked.length;
        return {

          ...chunked.reduce((a, c, i) => {
            return {
              ...a,
              [Number(current) + Number(i)]: c
            }

          }, {}),
          ...Object.entries(all).reduce((a, [k, v]) => {
            return {
              ...a,
              [Number(k) + numChunks - 1]: v,
            }
          }, {}),
        }
      } else {
        return {
          [current]: indexAsKey[current],
          ...all,
        }
      }

    }, {})
    return Object.entries(o).reduce((all, [k, v]) => {
      return {
        ...all,
        ...v.reduce((a, c) => {
          return {
            ...a,
            [c]: k
          }
        }, {})
      }
    }, {})
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
