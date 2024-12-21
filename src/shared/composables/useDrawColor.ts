export const useDrawColor = () => {
  function getDrawColor(num: number) {
    return [
      null,
      'bg-blue-500',
      'bg-yellow-500',
      'bg-pink-500',
      'bg-teal-500',
      'bg-purple-500',
      'bg-red-500',
      'bg-orange-500',
      'bg-indigo-500',
      'bg-black',
    ][num % 9 + 1]
  }

  return { getDrawColor }
}
