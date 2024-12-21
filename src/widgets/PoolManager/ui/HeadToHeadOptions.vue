<template>
<div class="bg-white p-2 shadow-md">
  <div class="flex gap-2 ">
    <Button v-for="option in options" :key="option.key" :variant="selectedOption === option.key ? 'primary' : 'tonal'"
      @click="selectedOption = option.key">
      {{ option.title }}

    </Button>

  </div>
  <div v-if="selectedDescription" class="text-sm text-gray-700 mt-2 bg-amber-100 p-2 rounded-md w-fit ">
    {{ selectedDescription }}
  </div>
</div>
</template>
<script setup lang="ts">
import { ref, computed } from 'vue'
import Button from '@/shared/ui/Button.vue'

type OptionType = 'points_differential' | 'tournament_points' | 'draw_to_button' | 'H2H' | 'game' | 'flip_coin'
type Option = {
  key: OptionType,
  title: string,
  description: string,
}
const selectedOption = ref<OptionType | null>(null)
const options = ref<Option[]>([
  {
    key: 'H2H',
    title: 'Head-to-head',
    description: 'Defer to the game played between two teams during pool play. Whichever team won the game advances.'
  },
  {
    key: 'draw_to_button',
    title: 'Draw to button',
    description: 'Teams throw a draw to the button. Closest to the button advances.'
  },
  {
    key: 'points_differential',
    title: 'Points differential',
    description: 'Subtract total points conceded during pool play from total points scored during pool play. The team with the higher differential advances.'
  },
  {
    key: 'game',
    title: 'Tiebreaker game',
    description: 'Teams play a tiebreaker game. Winner advances.'
  },
  {
    key: 'flip_coin',
    title: 'Flip a coin',
    description: 'Teams flip a coin. Winner advances.'
  },


])

const selectedDescription = computed(() => {
  return Object.values(options.value).find(({ key }) => key === selectedOption.value)?.description
})
</script>
