<template>
<div class="flex gap-4">
  <StageCardPool @click="emit('select', 'pool')" />
  <StageCardBracket @click="emit('select', 'bracket')" />
</div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import StageCardPool from './StageCardPool.vue';
import StageCardBracket from './StageCardBracket.vue';

import type { StageType } from '../lib/types';

const typeOptions = ref<StageType[]>(['pool', 'bracket'])

const emit = defineEmits(['select'])
</script>
