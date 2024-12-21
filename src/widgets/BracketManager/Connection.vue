<template>
<div class="relative flex" :class="{
  'border-gray-200': opaque,
  'border-gray-500': !opaque
}">

  <div class="h-[3px]  border-[inherit]" :class="{
    'bg-gray-500': !opaque,
    'bg-gray-200': opaque
  }" :style="{
    width: `${widthStart}px`
  }" v-if="connectionId" ref="thisEl" />
  <div class="  border-l-[3px]  relative border-[inherit]" v-if="connectionId" :style="{
    height: `${height + 3}px`,
    width: `${width}px`,
    transform: connectionAbove ? `translateY(calc(-1 * (100% - 3px)))` : '',

  }" :class="{
    'border-b-[3px]': !connectionAbove,
    'border-t-[3px]': connectionAbove,
  }">
    <div class="absolute  top-0 bottom-0 w-[3px] hover:bg-blue-500 left-[-3px] cursor-ew-resize"
      @mousedown="startEwResize" v-if="connectionId" />
  </div>
</div>
</template>
<script setup lang="ts">
import { useElementBounding } from '@vueuse/core'
import { computed, onMounted, ref, watch } from 'vue'
const props = withDefaults(defineProps<{
  connectionId?: string;
  lineWidth?: number;
  opaque?: boolean;
}>(),
  {
    lineWidth: 50,
  })
const emit = defineEmits(['updateLineWidth'])

let bounding = useElementBounding(document.getElementById(props.connectionId))

const thisEl = ref(null)

const thisBounding = useElementBounding(thisEl)

function setTargetBounding() {
  bounding = useElementBounding(document.getElementById(props.connectionId))
}

onMounted(() => {
  setTargetBounding();
})

watch(() => props.connectionId, () => {
  setTargetBounding();
})

watch(() => bounding, () => {
  setTargetBounding();
})

watch(() => thisBounding, () => {
  setTargetBounding();
})
const connectionBehind = computed(() => bounding.left.value < thisBounding.right.value)
const height = computed(() => {
  if (connectionBehind.value) return 0
  return Math.abs(thisBounding.top.value - bounding.top.value + thisBounding.height.value - (bounding.height.value / 2))
})


const width = computed(() => {
  if (connectionBehind.value) return 0
  return Math.abs(thisBounding.right.value - bounding.left.value)
})

const connectionAbove = computed(() => (bounding.top.value + bounding.height.value / 2) < thisBounding.top.value)

const widthStart = ref(props.lineWidth)

watch(() => props.lineWidth, (val) => {
  widthStart.value = val
})

function ewMouseMove(e) {
  const { movementX } = e;
  const newWidth = widthStart.value + movementX
  if (newWidth < 50) return;
  widthStart.value = newWidth;
}

function ewMouseUp() {
  emit('updateLineWidth', widthStart.value)
  document.removeEventListener('mousemove', ewMouseMove)
  document.removeEventListener('mouseup', ewMouseUp)
}
function startEwResize() {
  document.addEventListener('mousemove', ewMouseMove)
  document.addEventListener('mouseup', ewMouseUp)
}

</script>
