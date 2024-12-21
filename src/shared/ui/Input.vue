<template><input v-bind="$attrs" v-model="value" :type="type" :class="classNames" @change="checkInput"
  class="placeholder:text-gray-500 placeholder:text-sm" /></template>
<script setup lang="ts">
import { computed, nextTick, useAttrs } from 'vue';

type InputVariant = 'primary' | 'secondary'

const props = withDefaults(defineProps<{
  modelValue: string | number,
  variant?: InputVariant,
  type?: string,
}>(),
  {
    variant: 'primary'
  })

const emit = defineEmits(['update:modelValue'])
const value = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const classNames = computed(() => {
  switch (props.variant) {
    case 'primary':
      return 'border border-gray-300 rounded-lg px-2 py-1 outline-blue-500 outline-[1px] transition-all '
    case 'secondary':
      return 'border border-gray-300 rounded-lg px-2 py-1'
  }
})

const attrs = useAttrs()
function checkInput() {
  if (props.type !== 'number') return
  const newVal = value.value;
  nextTick(() => {
    const toNumber = Number(newVal)
    const { min, max } = attrs as { min: number, max: number }
    if (isNaN(toNumber)) {
      if (min) {
        value.value = min
      } else {
        value.value = 0
      }
    } else if (min && toNumber < min) {
      console.log('less than min')
      value.value = Number(min)
    } else if (max && toNumber > max) {
      value.value = Number(max)
    }
  })

}
</script>
