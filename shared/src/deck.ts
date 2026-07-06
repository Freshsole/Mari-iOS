import {
  Card,
  Rank,
  RANKS,
  RANK_ORDER,
  Suit,
  SUITS,
} from './types';

let cardCounter = 0;

export function resetCardCounter(): void {
  cardCounter = 0;
}

export function createCard(suit: Suit, rank: Rank): Card {
  cardCounter += 1;
  return {
    id: `${suit}-${rank}-${cardCounter}`,
    suit,
    rank,
  };
}

export function createDeck(): Card[] {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push(createCard(suit, rank));
    }
  }
  return deck;
}

export function shuffleDeck(deck: Card[], random: () => number = Math.random): Card[] {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function compareRanks(a: Rank, b: Rank): number {
  return RANK_ORDER[a] - RANK_ORDER[b];
}

export function isTrump(card: Card, trumpSuit: Suit): boolean {
  return card.suit === trumpSuit;
}

export function cardPointValue(card: Card): number {
  if (card.rank === 'A' || card.rank === '10') {
    return 10;
  }
  return 0;
}

export function cardsEqual(a: Card, b: Card): boolean {
  return a.id === b.id;
}

export function removeCardFromHand(hand: Card[], card: Card): Card[] {
  return hand.filter((c) => c.id !== card.id);
}

export function handContains(hand: Card[], card: Card): boolean {
  return hand.some((c) => c.id === card.id);
}

export function getCardsOfSuit(hand: Card[], suit: Suit): Card[] {
  return hand.filter((c) => c.suit === suit);
}

export function getTrumpCards(hand: Card[], trumpSuit: Suit): Card[] {
  return hand.filter((c) => c.suit === trumpSuit);
}

export function findMeldPartner(hand: Card[], card: Card): Card | null {
  if (card.rank === 'K') {
    return hand.find((c) => c.suit === card.suit && c.rank === 'Q') ?? null;
  }
  if (card.rank === 'Q') {
    return hand.find((c) => c.suit === card.suit && c.rank === 'K') ?? null;
  }
  return null;
}

export function getAvailableMelds(hand: Card[], trumpSuit: Suit): Suit[] {
  const meldSuits: Suit[] = [];
  for (const suit of SUITS) {
    const hasKing = hand.some((c) => c.suit === suit && c.rank === 'K');
    const hasQueen = hand.some((c) => c.suit === suit && c.rank === 'Q');
    if (hasKing && hasQueen) {
      meldSuits.push(suit);
    }
  }
  return meldSuits;
}

export function meldPointsForSuit(suit: Suit, trumpSuit: Suit): 20 | 40 {
  return suit === trumpSuit ? 40 : 20;
}

export function determineTrickWinner(
  lead: Card,
  follow: Card,
  trumpSuit: Suit,
): 'lead' | 'follow' {
  const leadIsTrump = isTrump(lead, trumpSuit);
  const followIsTrump = isTrump(follow, trumpSuit);

  // Same suit (including both trumps): higher rank wins.
  if (lead.suit === follow.suit) {
    return compareRanks(lead.rank, follow.rank) >= 0 ? 'lead' : 'follow';
  }

  // Trump beats any other suit, even a lower trump card.
  if (followIsTrump && !leadIsTrump) {
    return 'follow';
  }
  if (leadIsTrump && !followIsTrump) {
    return 'lead';
  }

  // Off-suit non-trump cannot win (phase 1: lead keeps the trick).
  return 'lead';
}
