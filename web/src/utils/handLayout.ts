/** Symetrické rozložení karet na stole – jemný vějíř bez chaosu */
export function getHandLayout(index: number, total: number) {
  const mid = (total - 1) / 2;
  const offset = index - mid;

  const stepPx = total <= 4 ? 18 : total <= 6 ? 14 : total <= 8 ? 11 : 9;
  const angleDeg = total <= 4 ? 1.5 : total <= 6 ? 2 : 2.5;

  return {
    x: offset * stepPx,
    rotate: offset * angleDeg,
    zIndex: index + 1,
  };
}
