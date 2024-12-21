<template>
<div role="button" class="py-2 px-4 rounded font-semibold text-center" :class="[getClassNames(), {
  'cursor-pointer': !disabled,
  'cursor-not-allowed': disabled,
}]" :aria-disabled="disabled">
  <slot />
</div>
</template>
<script setup lang="ts">
type ButtonVariant = 'primary' | 'secondary' | 'tonal'
const props = withDefaults(defineProps<{
  variant?: ButtonVariant,
  color?: 'blue' | 'red' | 'green',
  disabled?: boolean,
}>(),
  {
    color: 'blue',
    disabled: false,
    variant: 'primary'
  })

function getClassNames() {
  if (props.disabled) {
    return 'bg-gray-200 text-gray-500'
  }
  switch (props.variant) {
    case 'primary':
      return `bg-${props.color}-500 hover:bg-${props.color}-600 text-white`
    case 'secondary':
      return 'bg-gray-100 hover:bg-gray-200 text-slate-800 '
    case 'tonal':
      return `bg-${props.color}-50 hover:bg-${props.color}-100 text-${props.color}-500 `
  }
}
</script>
