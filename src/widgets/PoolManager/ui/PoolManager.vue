<template>
<div class="grid grid-cols-[auto,_1fr] gap-4 p-2">
  <div class="flex flex-col gap-2 bg-white p-2 rounded-lg shadow-md w-[226px] h-max">
    <h3 class="py-2 pl-1 text-lg font-semibold  text-slate-800">
      Options
    </h3>
    <div class="bg-gray-100 p-2  rounded-lg">

      <div class="text-sm text-gray-600 mb-2">Number of teams</div>
      <Input v-model="numTeams" placeholder="Number of teams" type="number" class="w-full" :min="MIN_TEAMS"
        :max="MAX_TEAMS" />
    </div>

    <div class="bg-gray-100 p-2  rounded-lg">
      <div class="text-sm text-gray-600 ">Number of pools</div>
      <div class="bg-white rounded-md p-1">
        <NumberOfPoolsOptions :numTeams="numTeams" v-model="numPools" class="flex-wrap" />
      </div>

    </div>
    <div class="bg-gray-100 p-2  rounded-lg">

      <div class="text-sm text-gray-600 ">Format</div>
      <div class="bg-white rounded-md p-1">
        <Button v-for="option in formatOptions" :key="option" :variant="selectedFormat === option ? 'primary' : 'tonal'"
          @click="selectedFormat = option">Round
          Robin</Button>
      </div>


    </div>
    <div class="bg-gray-100 p-2  rounded-lg">
      <div class="text-sm text-gray-600 mb-2 ">Winners per pool</div>
      <Input v-model="winners" type="number" class="w-full" :max="numPossibleWinners" :min="1" />

    </div>
    <div>
      <Button variant="primary" color="emerald" @click="setNumPools(numPools, numTeams)"
        :disabled="!numPools || !numTeams">Generate</Button>
    </div>

  </div>
  <div class="relative grid grid-rows-[auto,_1fr] gap-4 ">
    <div class="flex gap-2 bg-white p-2 rounded-lg shadow-md">
      <Button :variant="selectedTab === tab ? 'primary' : 'tonal'" v-for="tab in tabs" :key="tab"
        @click="selectedTab = tab">{{ tab }}</Button>

    </div>
    <div class="relative grid grid-cols-[repeat(auto-fit,_500px)] gap-2" v-if="selectedTab === 'Pools'">
      <div v-for="pool in pools" :key="pool[0]">
        <PoolTable :pool="pool[1]" />
      </div>

    </div>
    <div v-else-if="selectedTab === 'Tiebreakers'">
      <TiebreakerOptions :numWinners="winners" :numTeams="maxPossibleTeamsPerPool" />
    </div>
  </div>

</div>
</template>
<script setup lang="ts">
import { ref, computed } from 'vue'
import Button from '@/shared/ui/Button.vue'
import Input from '@/shared/ui/Input.vue'
import TiebreakerOptions from './TiebreakerOptions.vue'
import NumberOfPoolsOptions from './NumberOfPoolsOptions.vue'
import { PoolTable } from '@/entities/Pool'
import { usePoolManager } from '../lib/usePoolManager';

const { pools, addPool, setNumPools } = usePoolManager()

let numTeams = ref(3)

const MIN_TEAMS = 3
const MAX_TEAMS = 256

let numPools = ref(0)

const formatOptions = [
  'Round Robin'
]

const selectedFormat = ref('Round Robin')

const numPossibleWinners = computed(() => {
  const teamsPerPool = Array.from(pools.value.entries()).map(([_, pool]) => {
    return pool.teams.length
  })
  const maxNumWinners = Math.min(...teamsPerPool)
  if (maxNumWinners === Infinity) {
    return 1
  }
  return maxNumWinners
})

const maxPossibleTeamsPerPool = computed(() => {
  const teamsPerPool = Array.from(pools.value.entries()).map(([_, pool]) => {
    return pool.teams.length
  })
  const maxNumWinners = Math.max(...teamsPerPool)
  if (maxNumWinners === Infinity) {
    return 1
  }
  return maxNumWinners
})

const hasPools = computed(() => {
  return !!Array.from(pools.value.entries())?.length
})

const winners = ref(1)

type Tab = 'Pools' | 'Tiebreakers'
const selectedTab = ref<Tab>('Pools')

const tabs = computed(() => {
  if (hasPools.value) {
    return ['Pools', 'Tiebreakers'] as Tab[]
  }
  return ['Pools'] as Tab[]
})

</script>
