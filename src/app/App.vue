<script setup lang="ts">
import { RouterView } from 'vue-router'
import Layout from './Layout.vue'
</script>

<template>
<Layout class="fixed inset-0 bg-pebble overflow-auto">
  <RouterView />
</Layout>
</template>
