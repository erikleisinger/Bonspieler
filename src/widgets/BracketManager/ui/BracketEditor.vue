<template>
<div class="fixed inset-0 grid grid-rows-[auto,_1fr]">
  <div class="cursor-pointer" @click="editable = !editable">{{ editable ? 'End edit' : 'start edit' }}</div>
  <div class="relative">
    <BracketManager :editable="editable"></BracketManager>
  </div>

</div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import BracketManager from './BracketManager.vue'
const editable = ref(false)
</script>
