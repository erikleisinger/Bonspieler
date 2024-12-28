import { useQuery } from "@tanstack/vue-query"
import type { Ref } from 'vue'
import { computed, unref } from 'vue'
import { useApi } from "@/shared/composables/useApi"


export const useBonspielTeams = (bonspielId?: Ref<string> | string) => {

  const bonspielIdVariable = computed(() => unref(bonspielId))

  async function fetchBonspielTeams() {
    const { data, error } = await useApi().from('team_event_junction').select(`
         team:team_id (
            id,
            name
         )
      `).eq('event_id', bonspielIdVariable.value)
    if (error) throw new Error('Error fetching bonspiel teams')
    return data.map(({ team }) => team)
  }

  const queryEnabled = computed(() => !!bonspielIdVariable.value)

  const { data: teams } = useQuery({
    queryFn: fetchBonspielTeams,
    queryKey: ['bonspiel_teams', bonspielIdVariable.value],
    enabled: queryEnabled
  })

  return {
    teams
  }
}
