
import { useApi } from "@/shared/composables/useApi"
import { useMutation, useQueryClient } from "@tanstack/vue-query"
export const useEditableBracketGame = () => {
  const queryClient = useQueryClient()
  async function fn({ teamId, gameId }: { teamId: string, gameId: string }) {
    await useApi().from('bracket_game_team_junction').insert({
      bracket_game_id: gameId,
      team_id: teamId
    })
  }

  const { mutate, } = useMutation({
    mutationFn: fn,
    mutationKey: ['addTeamToGame']
  })
  async function addTeamToGame(teamId: string, gameId: string, eventId: string) {
    if (!teamId || !gameId) {
      console.warn('could not add team to game: team id or game id not provided.')
      return;
    }
    await mutate({
      teamId,
      gameId
    }, {
      onSuccess: () => {
        console.log('on success')
        console.log(eventId)
        queryClient.invalidateQueries({
          queryKey: ['bracketTeams', eventId]
        })
      }
    });

  }

  return {
    addTeamToGame
  }
}
