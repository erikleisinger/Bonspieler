<template>
<div>
  <DraggableTeam v-for="team in availableTeams" :key="team.id" @dragStart="onDragStart(team.id)"
    @dragEnd="emit('dragEnd')">
    {{ team.name }}
  </DraggableTeam>
</div>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { useBonspielTeams } from '@/entities/Bonspiel';
import { DraggableTeam } from '@/features/DraggableTeamList';
import { useBracket } from '../lib/useBracket';
import { storeToRefs } from 'pinia';
import { useBracketTeams } from '../lib/useBracketTeams';
const props = defineProps<{
  bonspielId: string,
  uniqueId: string,
}>()


const { teams: assignedTeams } = useBracketTeams(props.bonspielId);

const { teams } = useBonspielTeams(props.bonspielId)

const availableTeams = computed(() => teams.value?.filter(({ id }) => !assignedTeams.value?.some(({ team }) => team?.id === id)))

const emit = defineEmits(['dragStart', 'dragEnd'])

function onDragStart(id: string) {
  emit('dragStart', id)
}
</script>
