import { ref, computed } from 'vue';
import type { EndScore } from './types'
export const useScoreboard = ({
  ends = 8,
  onUpdateScore = () => { },
  onUpdateTotal = () => { },
}: {
  ends: number;
  onUpdateScore?: (score: EndScore[]) => void;
  onUpdateTotal?: (total: [number, number]) => void;
} = {
    ends: 8,
    onUpdateScore: () => { },
    onUpdateTotal: () => { }
  }) => {

  const score = ref<EndScore[]>(Array.from(Array(ends).keys()).map(() => ([0, 0])));

  const total = ref<[number, number]>([0, 0])

  function updateTotal() {
    total.value = score.value.reduce((acc, cur) => {
      const [top, bottom] = cur;
      if (top === 'X' || bottom === 'X') return acc;
      return [acc[0] as number + top, acc[1] as number + bottom]
    }, [0, 0]) as [number, number]
    onUpdateTotal(total.value)
  }


  function xFollowingEnds(index: number) {
    score.value.forEach((_, colIndex) => {
      if (colIndex <= index) {
        if (score.value[colIndex][0] === 'X') {
          updateScore(colIndex, [0, 0])
        }
        return
      }
      updateScore(colIndex, ['X', 'X'])
    })
  }


  let handshakes = ref(false);
  let bellRung = ref(false);

  let gameEnded = computed(() => handshakes.value || bellRung.value);
  function bell(index: number) {
    xFollowingEnds(index)
    bellRung.value = true;
    handshakes.value = false;
  }

  function shake(index: number) {
    xFollowingEnds(index)
    handshakes.value = true;
    bellRung.value = false;
  }

  /**
 * Ensure that there are no X's before an actually scored end
 */

  function cleanScore(index: number) {
    if (!gameEnded.value) return;
    const thisEnd = score.value[index]
    if (thisEnd.includes('X')) return;
    score.value.forEach((endScore, endIndex) => {
      if (endIndex >= index) return;
      if (endScore.includes('X')) score.value[endIndex] = [0, 0]
    })
  }


  function updateScore(index: number, newScore: EndScore) {
    score.value[index] = newScore
    cleanScore(index)
    onUpdateScore(score.value)
    updateTotal()
  }

  return {
    handshakes,
    bellRung,
    score,
    total,
    updateScore,
    shake,
    bell,
  }
}
