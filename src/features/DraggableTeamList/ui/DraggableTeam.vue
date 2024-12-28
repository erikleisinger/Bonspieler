<template>
<div class="relative">
  <Teleport to="body" :disabled="!dragging">
    <Team ref="el" class="absolute z-10" :class="{
      'w-full': !dragging,
      'pointer-events-none': !!dragging
    }" :style="{
      transform: `translate(${x}px, ${y}px)`,
      top: `${fixedY}px`,
      left: `${fixedX}px`,

    }">
      <slot />
    </Team>
  </Teleport>
  <div ref="staticEl" :style="{
    display: dragging ? 'none' : 'block'
  }">
    <Team ref="staticEl" class="pointer-events-none">
      <slot />
    </Team>
  </div>


</div>
</template>
<script setup lang="ts">
import { computed, ref, useTemplateRef, onMounted } from 'vue';
import { useDrag, } from '@/shared/composables/useDrag';
import Team from './Team.vue'

const emit = defineEmits(['dragStart', 'dragEnd'])

const el = useTemplateRef('el');
const htmlEl = computed(() => el.value?.el)

const staticEl = useTemplateRef('staticEl');

const fixedX = ref(0);
const fixedY = ref(0);

function resetPos() {
  const { top, left } = staticEl.value.getBoundingClientRect()
  fixedX.value = left;
  fixedY.value = top;
  setXValue(0);
  setYValue(0);
}

function onMouseDown() {
  emit('dragStart')
  resetPos();
}
function onDragEnd() {
  emit('dragEnd');
  resetPos();
}
const { dragging, setXValue, setYValue, x, y } = useDrag(htmlEl, {
  onMouseDown,
  onDragEnd,
  xAxis: true,
  yAxis: true,
})

</script>
