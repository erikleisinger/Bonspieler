<template>
<div>
  <div>Tiebreakers</div>
  <div>Number of teams: {{ numTeams }}</div>
  <div>Number of spots: {{ numWinners }}</div>
  <div>
    <div>
      <div>Max tiebreaker games</div>
      <Input v-model="tiebreakerGames" type="number" :min="0" />
    </div>
    <HeadToHeadOptions />
    <div class="relative w-[1000px] h-[1000px]">
      <BracketManagerSimple />
    </div>

  </div>

</div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import HeadToHeadOptions from './HeadToHeadOptions.vue'
import Button from '@/shared/ui/Button.vue'
import Input from '@/shared/ui/Input.vue';
import BracketManagerSimple from '@/widgets/Bracket2/BracketManagerSimple.vue'
const props = defineProps<{
  numWinners: number,
  numTeams: number,
}>()

type OptionType = 'H2H'
type Option = {
  key: OptionType,
  title: string
}

const selectedOption = ref<OptionType | null>(null)
const options = ref<Option[]>([
  {
    key: 'H2H',
    title: 'Head-to-head'
  }
])
const tiebreakerGames = ref(0)
</script>
