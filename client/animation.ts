type MoveToOptions = {
  timeMs: number;
  x: number;
  y: number;
  scale?: number;
};
export function createMoveToStyles(elem: HTMLElement, options: MoveToOptions, play: boolean) {
  const { timeMs, x, y } = options;
  if (!elem) return {};
  if (!play) return { transform: 'translateY(0px) translateX(0px)', transition: `transform ${timeMs / 1000}s` };
  const elemRect = elem.getBoundingClientRect();
  const verticalDiff = y - elemRect.top;
  const horizontalDiff = x - elemRect.left;
  const styles = {
    transform: `translateY(${verticalDiff}px) translateX(${horizontalDiff}px)`,
    transition: `transform ${timeMs / 1000}s`,
  };
  return styles;
}
