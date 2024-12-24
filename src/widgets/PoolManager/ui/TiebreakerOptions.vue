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
      <Bracket :games="generateBracket" :rounds="rounds" :bracketId="uniqueId" :uniqueId="uniqueId" />
    </div>

  </div>

</div>
</template>
<script setup lang="ts">
import { ref, computed } from 'vue'
import type { BracketGame } from '@/widgets/BracketManager/lib/types';
import HeadToHeadOptions from './HeadToHeadOptions.vue'
import Input from '@/shared/ui/Input.vue';
import { Bracket } from '@/widgets/BracketManager'
import { useUniqueId } from '@/shared/composables/useUniqueId';
const props = defineProps<{
  numWinners: number,
  numTeams: number,
}>()

type OptionType = 'H2H'
type Option = {
  key: OptionType,
  title: string
}
const uniqueId = useUniqueId()
const selectedOption = ref<OptionType | null>(null)
const options = ref<Option[]>([
  {
    key: 'H2H',
    title: 'Head-to-head'
  }
])

const generateBracket = computed(() => {
  const games: BracketGame[] = [];
  let currentRound = 1;
  let gamesInRound = Math.ceil(props.numTeams / 2);
  let gameId = 1;

  while (gamesInRound > props.numWinners) {
    for (let i = 0; i < gamesInRound; i++) {
      games.push({
        id: `game${gameId}`,
        roundNumber: currentRound,
        connections: {
          winner: `game${gameId + gamesInRound}`,
          loser: null
        },
        transform: {
          x: 0,
          y: i * 100
        }
      });
      gameId++;
    }

    currentRound++;
    gamesInRound = Math.ceil(gamesInRound / 2);
  }

  for (let i = 0; i < props.numWinners; i++) {
    games.push({
      id: `game${gameId + i}`,
      roundNumber: currentRound,
      connections: {
        winner: null,
        loser: null
      },
      transform: {
        x: 0,
        y: i * 100
      }
    });
  }

  return games;
})

const rounds = computed(() => {
  return Array.from(Array(Math.max(...generateBracket.value.map(({ roundNumber }) => roundNumber))).keys()).map((_, i) => i + 1)
})
const tiebreakerGames = ref(0)
</script>
