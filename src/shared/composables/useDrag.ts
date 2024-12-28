import { ref } from 'vue'
import type { Ref } from 'vue'
import { useEventListener, useElementBounding } from '@vueuse/core';
export const useDrag = (el: Ref<HTMLElement | null>, {
  boundaries,
  handle,
  initialX,
  initialY,
  onDragEnd,
  onMouseDown,
  onMove,
  xAxis,
  yAxis,
}: {
  boundaries: {
    top?: Ref<number>,
  },
  handle?: string,
  initialX?: number,
  initialY?: number,
  onDragEnd: () => void;
  onMouseDown: (event: MouseEvent) => void;
  onMove: (event: MouseEvent) => void;

  xAxis?: boolean,
  yAxis?: boolean,
} = {
    boundaries: {},
    handle: undefined,
    initialX: 0,
    initialY: 0,
    onDragEnd: () => { },
    onMouseDown: () => { },
    onMove: () => { },
    xAxis: true,
    yAxis: true
  }) => {
  const offsetX = ref(0);
  const offsetY = ref(0);
  const dragging = ref(false)

  const x = ref(initialX || 0);
  const y = ref(initialY || 0)


  function onMouseUp() {
    if (onDragEnd) onDragEnd();
    document.removeEventListener('mousemove', onMouseMove)
    document.removeEventListener('mouseup', onMouseUp)
    dragging.value = false;
  }

  function onMouseMove(e) {
    e.preventDefault()
    const { movementX, movementY } = e;
    if (!xAxis && !yAxis) return;
    if (xAxis) x.value += movementX + ((1 - window.devicePixelRatio) * (movementY < 0 ? -1 : 1))
    if (yAxis) updateYValue(y.value + movementY + ((1 - window.devicePixelRatio) * (movementY < 0 ? -1 : 1)))
    if (onMove) onMove(e);
  }

  useEventListener(el, 'mousedown', (e) => {
    e.stopPropagation();
    e.preventDefault()
    const path = e.composedPath();
    if (!!handle && !path.some((e) => {
      if (!e?.classList) return false;
      return e.classList.contains(handle)
    })) return;
    dragging.value = true;
    const { left, top } = el.value.getBoundingClientRect()
    offsetX.value = e.clientX - left
    offsetY.value = e.clientY - top

    if (onMouseDown) onMouseDown(e)

    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
  })

  function updateYValue(val: number) {
    if (!yAxis) return;
    const { top } = el.value.getBoundingClientRect()
    const newY = top + val
    if (newY < 0) return;
    if (boundaries?.top !== undefined && newY < boundaries?.top?.value) return;
    y.value = val
  }

  function setYValue(val: number) {
    if (!yAxis) return;
    y.value = val;

  }
  function setXValue(val: number) {
    if (!xAxis) return;
    x.value = val;
  }

  return {
    dragging,
    setYValue,
    setXValue,
    x,
    y
  }
}
