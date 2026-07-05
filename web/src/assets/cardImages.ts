import { Rank, Suit } from '@shared/types';

const BASE = import.meta.env.BASE_URL;

const CARD_FILES: Record<Suit, Record<Rank, string>> = {
  hearts: {
    '7': 'hearts-7.png',
    '8': 'hearts-8.png',
    '9': 'hearts-9.png',
    '10': 'hearts-10.png',
    J: 'hearts-J.png',
    Q: 'hearts-Q.png',
    K: 'hearts-K.png',
    A: 'hearts-A.png',
  },
  leaves: {
    '7': 'leaves-7.png',
    '8': 'leaves-8.png',
    '9': 'leaves-9.png',
    '10': 'leaves-10.png',
    J: 'leaves-J.png',
    Q: 'leaves-Q.png',
    K: 'leaves-K.png',
    A: 'leaves-A.png',
  },
  acorns: {
    '7': 'acorns-7.png',
    '8': 'acorns-8.png',
    '9': 'acorns-9.png',
    '10': 'acorns-10.png',
    J: 'acorns-J.png',
    Q: 'acorns-Q.png',
    K: 'acorns-K.png',
    A: 'acorns-A.png',
  },
  bells: {
    '7': 'bells-7.png',
    '8': 'bells-8.png',
    '9': 'bells-9.png',
    '10': 'bells-10.png',
    J: 'bells-J.png',
    Q: 'bells-Q.png',
    K: 'bells-K.png',
    A: 'bells-A.png',
  },
};

export function getCardImageUrl(suit: Suit, rank: Rank): string {
  return `${BASE}cards/${CARD_FILES[suit][rank]}`;
}

export function getCardBackUrl(): string {
  return `${BASE}cards/back.png`;
}

export function getCardImageForCard(card: { suit: Suit; rank: Rank }): string {
  return getCardImageUrl(card.suit, card.rank);
}
