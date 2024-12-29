import { ref } from 'vue'
import { useQuery } from "@tanstack/vue-query"
import { useApi } from "@/shared/composables/useApi"
export const useBracketTeams = (bonspielId: string, {
  onData
}: {
  onData: (data: any) => void;
} = {
    onData: () => { }
  }) => {
  async function getBracketTeams() {
    const { data, error } = await useApi().from('bracket_game_team_junction').select(`
          team:team_id (
            id,
            name
          ),
          bracket_game:bracket_game_id (
             id,
             bracket_id (
                bracket_group_id (
                event_id
                )
             )
          )
      `).eq('bracket_game.bracket_id.bracket_group_id.event_id', bonspielId)
    if (error) throw new Error('Error getting bracket teams')
    return data;
  }



  const { data: teams } = useQuery({
    queryFn: getBracketTeams,
    queryKey: ['bracketTeams', bonspielId],
    select: (data) => {
      console.log('refetch teams')
      const cleanedData = data.map(({ bracket_game, team }) => ({
        gameId: bracket_game?.id,
        team,
      }))
      if (onData) onData(cleanedData);
      return cleanedData;
    }
  })

  return {
    teams,
  }
}
