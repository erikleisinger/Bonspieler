export const useUniqueId = () => {
  function generateUniqueId() {
    return "id" + Math.random().toString(16).slice(8)
  }

  return generateUniqueId();
}
