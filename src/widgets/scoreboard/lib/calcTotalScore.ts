import type { EndScore } from "./types";
export function calcTotalScore(score: EndScore[]) {
  return score.reduce((acc, cur) => {
    const [top, bottom] = cur;
    if (top === 'X' || bottom === 'X') return acc;
    const val = [acc[0] as number + top, acc[1] as number + bottom].map((n) => Number.isNaN(n) ? 0 : n)
    return val
  }, [0, 0]) as [number, number]
}
