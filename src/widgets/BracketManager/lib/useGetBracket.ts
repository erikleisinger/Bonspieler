import type { BracketEvent } from "./types"
import { useApi } from "@/shared/composables/useApi"
import { useBracket } from './useBracket'
export const useGetBracket = () => {
  async function fetchBracket(bracketGroupId: string): Promise<BracketEvent> {
    const { data: brackets } = await useApi().from('brackets').select('*').eq('bracket_group_id', bracketGroupId)
    if (!brackets?.length) {
      console.warn('could not fetch brackets')
      return {};
    }

    const { data: bracketGames } = await useApi().from('bracket_games').select('*').in('bracket_id', brackets?.map(({ id }) => id))

    return brackets.reduce((all, current) => {
      return {
        ...all,
        [current.id]: bracketGames?.filter(({ bracket_id }) => bracket_id === current.id).map((g) => {
          const { id, lineWidth, y, winner_bracket_game_id, loser_bracket_game_id, round_number, readable_id, draw_number } = g;
          return {
            id: `${id}`,
            transform: {
              x: 0,
              y,
              lineWidth
            },
            connections: {
              winner: !winner_bracket_game_id ? null : `${winner_bracket_game_id}`,
              loser: !loser_bracket_game_id ? null : `${loser_bracket_game_id}`,
            },
            roundNumber: round_number,
            readableId: readable_id,
            drawNumber: draw_number
          }
        })
      }
    }, {})
  }
  return {
    fetchBracket
  }
}
