<template>
<div ref="el" class="w-fit h-fit" :id="id" data-draggable="true" :style="{
  transform: `translate(${x}px, ${y}px)`
}">
  <slot />
</div>
</template>
<script setup lang="ts">
import { computed, ref, watch, onMounted } from 'vue'
import { useEventListener, useElementHover, useElementBounding } from '@vueuse/core'
import { useDraggableStore } from './draggable';
import { storeToRefs } from 'pinia';

const props = withDefaults(defineProps<{
  xAxis?: boolean,
  yAxis?: boolean,
  handle: string,
  x?: number,
  y?: number,
  boundaryElementSelector?: string,
}>(),
  {
    x: 0,
    y: 0
  })

const emit = defineEmits(['update'])

const { dragElementId } = storeToRefs(useDraggableStore());
const { setDragElementId } = useDraggableStore();

const dragging = computed(() => dragElementId.value === id)

function generateUniqueId() {
  return "id" + Math.random().toString(16).slice(2)
}

const boundaryBounding = useElementBounding(document.querySelector(props.boundaryElementSelector))
onMounted(() => {
  boundaryBounding.update()
})



const id = generateUniqueId();
const x = ref(props.x)
const y = ref(props.y)
watch(() => props.x, (val) => {
  x.value = val;
})
watch(() => props.y, (val) => {
  y.value = val;
})

const el = ref(null)

const offsetX = ref(0);
const offsetY = ref(0)
useEventListener(el, 'mouseover', (e) => {
  e.stopPropagation();

  hovered.value = true;
})
useEventListener(el, 'mouseleave', (e) => {
  e.stopPropagation();
  hovered.value = false;
})
useEventListener(el, 'mousedown', (e) => {
  e.stopPropagation();
  const path = e.composedPath();
  if (!path.some((e) => {
    if (!e?.classList) return false;
    return e.classList.contains(props.handle)
  })) return;
  const { left, top } = el.value.getBoundingClientRect()
  offsetX.value = e.clientX - left
  offsetY.value = e.clientY - top
  setDragElementId(id)

  document.addEventListener('mousemove', onMouseMove)
  document.addEventListener('mouseup', onMouseUp)
})

function onMouseUp() {
  setDragElementId('')
  emit('update', { x: x.value, y: y.value })
  document.removeEventListener('mousemove', onMouseMove)
  document.removeEventListener('mouseup', onMouseUp)
}
function setYValue(val: number) {
  if (!props.yAxis) return;
  const { top } = el.value.getBoundingClientRect()
  const newY = top + val
  if (newY < 0) return;
  if (newY < boundaryBounding.top.value) return;
  y.value = val
}
function onMouseMove(e) {
  if (!dragging.value) return;
  const { movementX, movementY } = e;
  if (props.xAxis) x.value += movementX + ((1 - window.devicePixelRatio) * (movementY < 0 ? -1 : 1))
  if (props.yAxis) setYValue(y.value + movementY + ((1 - window.devicePixelRatio) * (movementY < 0 ? -1 : 1)))
}
const hovered = useElementHover(el)
</script>
