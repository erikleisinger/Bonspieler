<template>
<RockColorPicker v-model:color="colors[0]" @update:color="onUpdateColor(0, $event)" :style="{
  height: rockSize,
  width: rockSize,
}"></RockColorPicker>
<RockColorPicker v-model:color="colors[1]" @update:color="onUpdateColor(1, $event)" :style="{
  height: rockSize,
  width: rockSize,
}"></RockColorPicker>
</template>
<script setup lang="ts">
import { RockColorPicker } from '@/features/RockColorPicker'
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  modelValue: ('red' | 'yellow' | 'blue')[],
  rockSize?: string
}>(),
  {
    rockSize: '100px'
  })

const emit = defineEmits(['update:modelValue'])

const colors = computed({
  get() {
    return props.modelValue;
  },
  set(newColors: ('red' | 'yellow' | 'blue')[]) {
    emit('update:modelValue', newColors)
  }
})

function onUpdateColor(index: number, color: 'red' | 'yellow' | 'blue') {
  colors.value[index] = color
};
</script>
