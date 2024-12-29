<script setup lang="ts">
import { RouterView } from 'vue-router'
import { VueQueryDevtools } from '@tanstack/vue-query-devtools'
import Layout from './Layout.vue'
</script>

<template>
<Layout class="fixed inset-0 bg-pebble overflow-auto">
  <RouterView />
  <VueQueryDevtools />
</Layout>
</template>
