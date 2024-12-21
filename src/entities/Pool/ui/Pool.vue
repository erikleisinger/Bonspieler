<template>
<div class="rounded-lg bg-white max-w-[600px] overflow-hidden grid grid-rows-[auto,_1fr] shadow-md">
  <div class="p-2 bg-blue-500 text-white font-semibold">Pool {{ pool.id }}</div>
  <div class="bg-white ">
    <div v-for="team in pool.teams" :key="team.id" class="flex gap-2 items-center odd:bg-gray-100 p-2">
      {{ team.name }}
    </div>
  </div>
</div>
</template>
<script setup lang="ts">

import type { Pool } from '../lib/types'

const props = defineProps<{
  pool: Pool
}>()


</script>
