<template>
<div
  class="bg-white border-2 p-8 w-[100px] h-[100px] aspect-square rounded-lg text-3xl text-center cursor-pointer select-none leading-[1]"
  :class="{
    animated
  }" @click="onClick">
  <slot />
</div>
</template>
<style lang="scss" scoped>
.animated {
  animation-name: pulse;
  animation-duration: v-bind(ANIMATION_DURATION_REF);

}

@keyframes pulse {
  0% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.1);
  }

  100% {
    transform: scale(1);
  }
}
</style>
<script setup lang="ts">
import { ref } from 'vue'
import { useDebounceFn } from '@vueuse/core';
const props = defineProps<{
  disabled?: Boolean;
}>()
const emit = defineEmits(['click'])
const ANIMATION_DURATION = 200
const ANIMATION_DURATION_REF = ref(`${ANIMATION_DURATION}ms`);
const animated = ref(false)


const animate = useDebounceFn(() => {
  animated.value = true;
  setTimeout(() => {
    animated.value = false
  }, ANIMATION_DURATION)
}, { leading: true })

async function onClick() {
  if (props.disabled) return;

  emit('click')
  animate();
}


</script>
