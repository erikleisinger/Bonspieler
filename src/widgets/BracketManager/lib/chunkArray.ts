/**
 * @param array Array to split into chunks
 * @param chunkSize size of the return arrays
 * @returns provided array split into separate arrays of length N
 */

export function chunkArray(array: string[], chunkSize: number): string[][] {
  const chunks: string[][] = [];

  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }

  return chunks;
}
