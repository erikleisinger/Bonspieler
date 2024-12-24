<template>
<div class="rounded-xl shadow-sm bg-white p-4 w-[300px] hover:bg-gray-100 cursor-pointer">
  <header>
    {{ bonspiel.name }}
  </header>
</div>
</template>
<script setup lang="ts">
import type { Tables } from '@/shared/types/database.types'
import { useCurrentUser } from '@/shared/composables/useCurrentUser';
const props = defineProps<{
  bonspiel: Tables<'events'>
}>()

const { isCurrentUser } = useCurrentUser()
</script>
