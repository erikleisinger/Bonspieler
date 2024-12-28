<template>
<div ref="el"
  class="flex gap-2 rounded-lg mb-1 py-1 px-2 border-2 bg-white hover:bg-gray-200 hover:text-slate-900 cursor-pointer min-w-[200px]">

  <slot />
</div>
</template>
<script setup lang="ts">
import { ref, defineExpose } from 'vue';

const el = ref(null);
defineExpose({
  el
})
</script>
