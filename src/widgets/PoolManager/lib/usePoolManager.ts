import { type Pool, type PoolTeam } from '@/entities/Pool'
import { onMounted, ref } from 'vue'
import { useUniqueId } from '@/shared/composables/useUniqueId'
export const usePoolManager = (initialPools: Pool[] = []) => {
  const pools = ref<Map<string, Pool>>(new Map([]))

  function setInitialPools(poolsToSet: Pool[]) {
    pools.value = new Map([]);
    poolsToSet.forEach((pool) => {
      pools.value.set(pool.id, pool)
    })
  }

  function divideTeamsIntoPools(totalTeams: number, numberOfPools: number) {
    const minTeamsPerPool = Math.floor(totalTeams / numberOfPools);
    const extraTeams = totalTeams % numberOfPools;
    const newPools = [];

    let teamCounter = 0;
    for (let i = 0; i < numberOfPools; i++) {
      const pool = [];
      const currentPoolSize = i < extraTeams ? minTeamsPerPool + 1 : minTeamsPerPool;

      for (let j = 0; j < currentPoolSize; j++) {
        pool.push(teamCounter + 1);
        teamCounter++;
      }

      newPools.push(pool);
    }

    return newPools;
  }

  function setNumPools(numPools: number, numTeams: number = 8) {
    const teamsForPool = divideTeamsIntoPools(numTeams, numPools);
    pools.value = new Map([]);
    for (let i = 0; i < numPools; i++) {
      pools.value.set(useUniqueId(), {
        id: useUniqueId(),
        name: `Pool ${i + 1}`,
        teams: teamsForPool[i].map((t) => ({
          id: t.toString(),
          name: `Team ${t}`,
        })),
      })
    }
  }

  onMounted(() => {
    setInitialPools(initialPools)
  })

  function generatePoolTeams(numTeams: number) {
    return Array.from(Array(numTeams).keys()).map((i) => ({
      id: (i + 1).toString(),
      name: `Team ${i + 1}`,
    }))
  }

  function addPool(numTeams: number = 8) {
    const id = useUniqueId()
    pools.value.set(id, {
      id,
      name: `Pool ${pools.value.size + 1}`,
      teams: generatePoolTeams(numTeams),
    })
  }




  return {
    pools,
    addPool,
    setNumPools,
  }
}
