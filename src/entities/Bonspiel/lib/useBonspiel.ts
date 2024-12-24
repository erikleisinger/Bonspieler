import { useApi } from '@/shared/composables/useApi'
import { useQuery } from '@tanstack/vue-query'
export const useBonspiel = () => {
  function getBonspielStages(eventId: string) {
    async function getPools() {
      const { data, error } = await useApi().from('pools').select(`
         id,
         created_at,
         name,
         team_count
         stage:event_stage_id (
            id,
            event_id,
            name,
            start_team_count,
            end_team_count,
            stage_num
         )
        `).eq('event_stage_id.event_id', eventId)
      if (error) throw new Error(error.message)
      return data.map((p) => ({
        ...p,
        type: 'pool'
      }))
    }

    async function getBrackets() {
      const { data, error } = await useApi().from('bracket_groups').select(`
         id,
         created_at,
         name,
         event_id,
         stage_num,
         start_team_count,
         end_team_count
        `).eq('event_id', eventId)
      if (error) throw new Error(error.message)
      return data.map((b) => ({
        ...b,
        type: 'bracket'
      }))
    }
    async function fn() {
      const pools = await getPools();
      const brackets = await getBrackets()
      return [...brackets].sort((a, b) => a.stage_num - b.stage_num)
    }
    return useQuery({
      queryKey: ['bonspiel_stage', eventId],
      queryFn: fn,
      initialData: []
    })
  }

  return {
    getBonspielStages
  }
}
