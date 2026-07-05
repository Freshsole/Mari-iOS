import { Rank, Suit } from '@shared/types';

const BASE = import.meta.env.BASE_URL;

const CARD_FILES: Record<Suit, Record<Rank, string>> = {
  hearts: {
    '7': 'hearts-7.svg',
    '8': 'hearts-8.svg',
    '9': 'hearts-9.svg',
    '10': 'hearts-10.svg',
    J: 'hearts-J.svg',
    Q: 'hearts-Q.svg',
    K: 'hearts-K.svg',
    A: 'hearts-A.svg',
  },
  leaves: {
    '7': 'leaves-7.svg',
    '8': 'leaves-8.svg',
    '9': 'leaves-9.svg',
    '10': 'leaves-10.svg',
    J: 'leaves-J.svg',
    Q: 'leaves-Q.svg',
    K: 'leaves-K.svg',
    A: 'leaves-A.svg',
  },
  acorns: {
    '7': 'acorns-7.svg',
    '8': 'acorns-8.svg',
    '9': 'acorns-9.svg',
    '10': 'acorns-10.svg',
    J: 'acorns-J.svg',
    Q: 'acorns-Q.svg',
    K: 'acorns-K.svg',
    A: 'acorns-A.svg',
  },
  bells: {
    '7': 'bells-7.svg',
    '8': 'bells-8.svg',
    '9': 'bells-9.svg',
    '10': 'bells-10.svg',
    J: 'bells-J.svg',
    Q: 'bells-Q.svg',
    K: 'bells-K.svg',
    A: 'bells-A.svg',
  },
};

export function getCardImageUrl(suit: Suit, rank: Rank): string {
  return `${BASE}cards/${CARD_FILES[suit][rank]}`;
}

export function getCardBackUrl(): string {
  return `${BASE}cards/back.svg`;
}

export function getCardImageForCard(card: { suit: Suit; rank: Rank }): string {
  return getCardImageUrl(card.suit, card.rank);
}
