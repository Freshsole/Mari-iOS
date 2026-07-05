/** Šířka karty a mezera – všechny karty viditelné v jedné řadě */
export function getHandSizing(cardCount: number, viewportWidth: number) {
  const sidePadding = 16;
  const gap = cardCount > 6 ? 2 : 4;
  const available = viewportWidth - sidePadding;

  let cardWidth = Math.floor((available - gap * Math.max(0, cardCount - 1)) / cardCount);
  cardWidth = Math.min(56, Math.max(34, cardWidth));

  const cardHeight = Math.round(cardWidth * 1.42);

  return { cardWidth, cardHeight, gap };
}
