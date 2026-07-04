import { Card, Rank, Suit } from '@shared/types';

const BASE = import.meta.env.BASE_URL;

export function getCardImageUrl(suit: Suit, rank: Rank): string {
  return `${BASE}cards/${suit}-${rank}.svg`;
}

export function getCardBackUrl(): string {
  return `${BASE}cards/back.svg`;
}

export function getCardImageForCard(card: Card): string {
  return getCardImageUrl(card.suit, card.rank);
}
