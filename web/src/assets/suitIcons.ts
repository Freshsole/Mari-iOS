import { Suit } from '@shared/types';

const BASE = import.meta.env.BASE_URL;

const SUIT_ICON_FILES: Record<Suit, string> = {
  acorns: 'acorns.png',
  hearts: 'hearts.png',
  leaves: 'leaves.png',
  bells: 'bells.png',
};

export function getSuitIconUrl(suit: Suit): string {
  return `${BASE}suits/${SUIT_ICON_FILES[suit]}`;
}
