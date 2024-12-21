<template>
<div class="flex gap-2 ">
  <Button v-for="i in numPools" :key="i" class="flex items-center gap-2"
    :variant="selectedNum === i ? 'primary' : 'tonal'" @click="setNumPools(i)">
    {{ i }}
  </Button>
</div>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import Button from '@/shared/ui/Button.vue'
const props = defineProps<{
  numTeams: number,
  modelValue: number,
}>()

const numPools = computed(() => {
  const possiblePools = []
  // Start from 1 pool up to numTeams/3 (minimum 3 teams per pool)
  const maxPools = Math.floor(props.numTeams / 3)

  for (let i = 1; i <= maxPools; i++) {
    const teamsPerPool = Math.floor(props.numTeams / i)
    const remainder = props.numTeams % i

    // Check if difference between pools is at most 1
    // Some pools will have teamsPerPool + 1 teams (remainder number of pools)
    // Rest will have teamsPerPool teams
    if (teamsPerPool >= 3 && (teamsPerPool + 1 - teamsPerPool) <= 1) {
      possiblePools.push(i)
    }
  }

  return possiblePools
})

const emit = defineEmits(['update:modelValue'])
const selectedNum = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

function setNumPools(num: number) {
  selectedNum.value = num
}
</script>
