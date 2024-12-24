<template>
<div>
  <BonspielCard v-for="bonspiel in bonspiels" :key="bonspiel.id" :bonspiel="bonspiel"
    @click="emit('select', bonspiel.id)" />
</div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useBonspielList } from '../lib/useBonspielList'
import { BonspielCard } from '@/entities/Bonspiel';
const { getMyBonspiels } = useBonspielList()

const { data: bonspiels, error } = getMyBonspiels()

const emit = defineEmits(['select'])

</script>
