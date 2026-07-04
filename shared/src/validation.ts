import {
  Card,
  GamePhase,
  PlayerId,
  Suit,
} from './types';
import {
  getCardsOfSuit,
  getTrumpCards,
  handContains,
  isTrump,
} from './deck';

/**
 * Phase 2 move validation.
 * Validates the response card against lead card and player's hand.
 */
export function isValidMove(
  leadCard: Card,
  responseCard: Card,
  hand: Card[],
  trumpSuit: Suit,
  isPhase2: boolean,
): boolean {
  if (!handContains(hand, responseCard)) {
    return false;
  }

  if (!isPhase2) {
    return true;
  }

  const suitedCards = getCardsOfSuit(hand, leadCard.suit);
  if (suitedCards.length > 0) {
    return responseCard.suit === leadCard.suit;
  }

  const trumpCards = getTrumpCards(hand, trumpSuit);
  if (trumpCards.length > 0) {
    return isTrump(responseCard, trumpSuit);
  }

  return true;
}

export function getValidResponseCards(
  leadCard: Card,
  hand: Card[],
  trumpSuit: Suit,
  isPhase2: boolean,
): Card[] {
  if (!isPhase2) {
    return [...hand];
  }

  const suitedCards = getCardsOfSuit(hand, leadCard.suit);
  if (suitedCards.length > 0) {
    return suitedCards;
  }

  const trumpCards = getTrumpCards(hand, trumpSuit);
  if (trumpCards.length > 0) {
    return trumpCards;
  }

  return [...hand];
}

export function getValidLeadCards(
  hand: Card[],
  _trumpSuit: Suit,
  _isPhase2: boolean,
): Card[] {
  return [...hand];
}

export function canDeclareMeld(
  hand: Card[],
  leadCard: Card,
  trumpSuit: Suit,
): boolean {
  if (leadCard.rank !== 'K' && leadCard.rank !== 'Q') {
    return false;
  }
  const partnerRank = leadCard.rank === 'K' ? 'Q' : 'K';
  return hand.some((c) => c.suit === leadCard.suit && c.rank === partnerRank);
}

export function getPhaseFromTalon(talonLength: number, currentPhase: GamePhase): GamePhase {
  if (talonLength === 0 && (currentPhase === 'phase1_trick' || currentPhase === 'phase1_draw')) {
    return 'phase2_trick';
  }
  if (talonLength > 0) {
    return currentPhase === 'phase1_draw' ? 'phase1_trick' : currentPhase;
  }
  return currentPhase;
}

export function otherPlayer(player: PlayerId): PlayerId {
  return player === 'player1' ? 'player2' : 'player1';
}
