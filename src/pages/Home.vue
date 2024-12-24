<template>
<div class="grid grid-rows-[auto,1fr] gap-4 absolute inset-0">
  <div class="flex justify-center items-center ">
    <div @click="createTeam">Create team</div>
    <div class="p-6 bg-gray-100 rounded-2xl  backdrop-blur-lg">
      <div class="grid grid-cols-2 gap-4">

        <div class="flex items-center gap-4">

          <RockColorPicker v-model:color="homeColor" class="h-[100px] w-[100px]" />
          <div>
            <h2 class="font-bold text-3xl">{{ totalScore[0] }} </h2>
          </div>
        </div>
        <div class="flex items-center gap-4">
          <div>
            <h2 class="font-bold text-right text-3xl">{{ totalScore[1] }} </h2>
          </div>
          <RockColorPicker v-model:color="awayColor" class="h-[100px] w-[100px]" />
        </div>
      </div>
    </div>
  </div>
  <div class="relative max-w-[100%] w-full">
    <div class="absolute inset-0 left-2 right-2 lg:w-fit mx-auto bg-gray-200 p-4 rounded-3xl h-fit shadow-md">
      <div class="bg-white rounded-xl p-4">
        <Scoreboard class="m-auto " v-model="score" :homeColor="homeColor" :awayColor="awayColor" />
      </div>
    </div>
  </div>

</div>
</template>
<script setup lang="ts">
import { Scoreboard } from '@/widgets/scoreboard';
import { RockColorPicker } from '@/features/RockColorPicker';
import { calcTotalScore } from '@/widgets/scoreboard';
import { ref, computed } from 'vue';
import { useApi } from '@/shared/composables/useApi'



let score = ref([[]])
let totalScore = computed(() => calcTotalScore(score.value))

const homeColor = ref('red')
const awayColor = ref('yellow')

async function createTeam() {
  const { error } = await useApi()
    .from('Teams')
    .insert({ name: 'Denmark' })
  console.log('error: ', error)
}
</script>
