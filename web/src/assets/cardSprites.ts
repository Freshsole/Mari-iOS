import { Rank, Suit } from '@shared/types';

const BASE = import.meta.env.BASE_URL;

/** One PNG sprite sheet per suit (4×2 grid: A K Q J / 10 9 8 7). */
const SUIT_SHEETS: Record<Suit, string> = {
  acorns: `${BASE}cards/sprites/acorns.png`,
  hearts: `${BASE}cards/sprites/hearts.png`,
  leaves: `${BASE}cards/sprites/leaves.png`,
  bells: `${BASE}cards/sprites/bells.png`,
};

/** Column index in the sprite sheet (left → right). */
const RANK_COL: Record<Rank, number> = {
  A: 0,
  K: 1,
  Q: 2,
  J: 3,
  '10': 0,
  '9': 1,
  '8': 2,
  '7': 3,
};

/** Row index in the sprite sheet (top → bottom). */
const RANK_ROW: Record<Rank, number> = {
  A: 0,
  K: 0,
  Q: 0,
  J: 0,
  '10': 1,
  '9': 1,
  '8': 1,
  '7': 1,
};

const COLS = 4;
const ROWS = 2;

function axisPercent(index: number, total: number): string {
  if (total <= 1) return '0%';
  return `${(index / (total - 1)) * 100}%`;
}

export function getCardSpriteSheetUrl(suit: Suit): string {
  return SUIT_SHEETS[suit];
}

export function getCardSpriteStyle(suit: Suit, rank: Rank): {
  backgroundImage: string;
  backgroundSize: string;
  backgroundPosition: string;
} {
  const col = RANK_COL[rank];
  const row = RANK_ROW[rank];
  return {
    backgroundImage: `url(${SUIT_SHEETS[suit]})`,
    backgroundSize: `${COLS * 100}% ${ROWS * 100}%`,
    backgroundPosition: `${axisPercent(col, COLS)} ${axisPercent(row, ROWS)}`,
  };
}

export function getCardBackUrl(): string {
  return `${BASE}cards/back.svg`;
}
