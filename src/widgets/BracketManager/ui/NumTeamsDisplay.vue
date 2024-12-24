<template>
<div class="bg-gray-100 rounded-lg px-4 py-1 text-sm mb-2">
  <div class="flex justify-between">Starting teams: <strong>{{ requiredNumTeams }}</strong></div>
  <div class="flex justify-between">Ending teams: <strong>{{ numEndTeams }}</strong></div>
</div>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { useBracket } from '../lib/useBracket';
const props = defineProps<{
  bracketId: string
}>()

const bracketStore = useBracket(props.bracketId)
const { getNumRequiredTeamsForBracketEvent, getNumEndTeamsForBracketEvent } = bracketStore;
const requiredNumTeams = computed(() => getNumRequiredTeamsForBracketEvent())
const numEndTeams = computed(() => getNumEndTeamsForBracketEvent())
</script>
