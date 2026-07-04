import {
  createNewGame,
  dealGame,
  getActivePlayer,
  getPlayableCards,
  isValidMove,
  playFollow,
  playLead,
  swapTrumpSeven,
} from './gameEngine';
import { Card, Rank, Suit } from './types';
import { createCard, resetCardCounter } from './deck';

describe('Dealing', () => {
  it('deals 8 cards to each player and 15 card talon', () => {
    resetCardCounter();
    const { state } = dealGame('player2', () => 0.5);
    expect(state.players.player1.hand).toHaveLength(8);
    expect(state.players.player2.hand).toHaveLength(8);
    expect(state.talon).toHaveLength(15);
    expect(state.trumpSuit).toBeTruthy();
    expect(state.trumpCard).toBeTruthy();
    expect(state.currentLeader).toBe('player1');
    expect(state.phase).toBe('phase1_trick');
  });
});

describe('Phase 1', () => {
  it('allows any card in phase 1', () => {
    const state = createNewGame();
    const active = getActivePlayer(state)!;
    const card = getPlayableCards(state, active)[0];
    const afterLead = playLead(state, { player: active, card });
    const follower = getActivePlayer(afterLead)!;
    const followCard = afterLead.players[follower].hand[0];
    expect(() =>
      playFollow(afterLead, { player: follower, card: followCard }),
    ).not.toThrow();
  });
});

describe('Phase 2 validation', () => {
  const trump: Suit = 'hearts';
  const lead: Card = { id: 'l', suit: 'leaves', rank: 'A' };

  it('must follow suit when possible', () => {
    const hand: Card[] = [
      { id: '1', suit: 'leaves', rank: '7' },
      { id: '2', suit: 'bells', rank: 'K' },
    ];
    expect(isValidMove(lead, hand[0], hand, trump, true)).toBe(true);
    expect(isValidMove(lead, hand[1], hand, trump, true)).toBe(false);
  });

  it('must play trump when no suit available', () => {
    const hand: Card[] = [
      { id: '1', suit: 'hearts', rank: '7' },
      { id: '2', suit: 'bells', rank: 'K' },
    ];
    expect(isValidMove(lead, hand[0], hand, trump, true)).toBe(true);
    expect(isValidMove(lead, hand[1], hand, trump, true)).toBe(false);
  });

  it('allows underplaying in suit', () => {
    const hand: Card[] = [
      { id: '1', suit: 'leaves', rank: '7' },
      { id: '2', suit: 'leaves', rank: 'K' },
    ];
    expect(isValidMove(lead, hand[0], hand, trump, true)).toBe(true);
  });

  it('allows discard when no suit or trump', () => {
    const hand: Card[] = [
      { id: '1', suit: 'acorns', rank: '7' },
      { id: '2', suit: 'bells', rank: 'K' },
    ];
    expect(isValidMove(lead, hand[0], hand, trump, true)).toBe(true);
    expect(isValidMove(lead, hand[1], hand, trump, true)).toBe(true);
  });
});

describe('Meld', () => {
  it('adds meld points on declaration', () => {
    resetCardCounter();
    let state = createNewGame();
    const leader = getActivePlayer(state)!;
    const hand = state.players[leader].hand;

    for (const suit of ['hearts', 'leaves', 'acorns', 'bells'] as Suit[]) {
      const king = hand.find((c) => c.suit === suit && c.rank === 'K');
      const queen = hand.find((c) => c.suit === suit && c.rank === 'Q');
      if (king && queen) {
        state = playLead(state, {
          player: leader,
          card: king,
          declareMeld: true,
        });
        expect(state.players[leader].meldPoints).toBeGreaterThan(0);
        return;
      }
    }
  });
});

describe('Trump seven swap', () => {
  it('swaps trump seven with face-up trump card', () => {
    resetCardCounter();
    const deck = Array.from({ length: 32 }, (_, i) => {
      const suits: Suit[] = ['hearts', 'leaves', 'acorns', 'bells'];
      const ranks: Rank[] = ['7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
      return createCard(suits[i % 4], ranks[i % 8]);
    });

    // Controlled deal via deterministic shuffle indices
    const { state } = dealGame('player2', () => 0.1);
    if (state.sevenSwapAvailable) {
      const player = state.sevenSwapAvailable;
      const oldTrump = state.trumpCard!;
      const swapped = swapTrumpSeven(state, player);
      expect(swapped.trumpCard?.rank).toBe('7');
      expect(
        swapped.players[player].hand.some((c) => c.id === oldTrump.id),
      ).toBe(true);
    }
  });
});
