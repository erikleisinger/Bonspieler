<template>
<Rock :color="selectedColor" class="cursor-pointer transition-transform duration-[200ms]" :class="{
  'rotate-45': rotate,
  'rotate-0': !rotate,
}" @click="onClick" v-bind="$attrs" />
</template>
<script setup lang="ts">
import Rock from '@/shared/Rock.vue'
import { computed, ref } from 'vue'
const props = defineProps<{
  color: 'red' | 'yellow' | 'blue'
}>()

const emit = defineEmits(['update:color'])

const selectedColor = computed({
  get() {
    return props.color;
  },
  set(newColor: 'red' | 'yellow' | 'blue') {
    emit('update:color', newColor)
  }
})

const rotate = ref(false)

function onClick() {
  const colors = ['red', 'yellow', 'blue'];
  const currentIndex = colors.indexOf(selectedColor.value);
  const nextIndex = (currentIndex + 1) % colors.length;
  selectedColor.value = colors[nextIndex];
  rotate.value = true;
  setTimeout(() => {
    rotate.value = false;
  }, 200);
}
</script>
