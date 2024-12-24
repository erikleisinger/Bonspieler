export function scrollToElement(elementSelector: string) {
  const el = document.querySelector(elementSelector)
  if (!el) return;
  el.scrollIntoView({ behavior: 'smooth', block: 'center', });
}
