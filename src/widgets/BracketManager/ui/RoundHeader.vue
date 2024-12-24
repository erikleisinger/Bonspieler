<template>
<header class="bg-white shadow-lg p-2 rounded-xl">
  <div class="bg-blue-100 rounded-md text-blue-500 text-center round-handle py-2 font-semibold ">
    Round {{ round }}
  </div>
  <slot />
</header>
</template>
<script setup>
const props = defineProps({
  round: Number
})
</script>
