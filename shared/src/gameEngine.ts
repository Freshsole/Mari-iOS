import {
  Card,
  CompletedTrick,
  GamePhase,
  GameState,
  MeldDeclaration,
  PlayerId,
  PlayerState,
  Suit,
} from './types';
import {
  createDeck,
  determineTrickWinner,
  findMeldPartner,
  handContains,
  meldPointsForSuit,
  removeCardFromHand,
  resetCardCounter,
  shuffleDeck,
} from './deck';
import {
  buildScoreBreakdown,
  meldAnnouncementText,
} from './scoring';
import {
  canDeclareMeld,
  getValidResponseCards,
  isValidMove,
  otherPlayer,
} from './validation';

function emptyPlayerState(): PlayerState {
  return {
    hand: [],
    wonTricks: [],
    meldPoints: 0,
    trickPoints: 0,
  };
}

function createInitialState(dealer: PlayerId = 'player2'): GameState {
  return {
    phase: 'setup',
    trumpSuit: null,
    trumpCard: null,
    talon: [],
    players: {
      player1: emptyPlayerState(),
      player2: emptyPlayerState(),
    },
    currentLeader: 'player1',
    dealer,
    trickNumber: 0,
    trickStep: 'lead',
    currentTrick: {},
    completedTricks: [],
    sevenSwapAvailable: null,
    winner: null,
    scores: null,
    lastActionMessage: 'Připravuji hru…',
  };
}

export interface DealResult {
  state: GameState;
  trumpRevealIndex: number;
}

/**
 * Execute the exact dealing sequence from the rules.
 */
export function dealGame(
  dealer: PlayerId = 'player2',
  random: () => number = Math.random,
): DealResult {
  resetCardCounter();
  const deck = shuffleDeck(createDeck(), random);
  let index = 0;

  const state = createInitialState(dealer);
  const p1 = state.players.player1;
  const p2 = state.players.player2;

  // 1. Player 1 receives 4 cards
  p1.hand.push(...deck.slice(index, index + 4));
  index += 4;

  // 2. Player 2 receives 4 cards
  p2.hand.push(...deck.slice(index, index + 4));
  index += 4;

  // 3. Card #9 (index 8) is trump reveal
  const trumpRevealIndex = index;
  const trumpCard = deck[index];
  index += 1;

  // 4. Player 1 receives another 4 cards
  p1.hand.push(...deck.slice(index, index + 4));
  index += 4;

  // 5. Player 2 receives another 4 cards
  p2.hand.push(...deck.slice(index, index + 4));
  index += 4;

  // 6. Remaining 15 cards form talon (cross pile on trump card)
  const talon = deck.slice(index);

  state.trumpCard = trumpCard;
  state.trumpSuit = trumpCard.suit;
  state.talon = talon;
  state.phase = 'phase1_trick';
  state.trickNumber = 1;
  state.trickStep = 'lead';
  state.currentLeader = 'player1';
  state.lastActionMessage = `Trumf: ${trumpCard.rank} ${trumpCard.suit}. Hra začíná!`;

  updateSevenSwapAvailability(state);

  return { state, trumpRevealIndex };
}

function updateSevenSwapAvailability(state: GameState): void {
  if (state.phase !== 'phase1_trick' && state.phase !== 'phase2_trick') {
    state.sevenSwapAvailable = null;
    return;
  }
  if (state.trickStep !== 'lead' || !state.trumpSuit) {
    state.sevenSwapAvailable = null;
    return;
  }

  const leader = state.currentLeader;
  const leaderHand = state.players[leader].hand;
  const hasTrumpSeven = leaderHand.some(
    (c) => c.suit === state.trumpSuit && c.rank === '7',
  );

  state.sevenSwapAvailable = hasTrumpSeven && (state.talon.length > 0 || state.trumpCard !== null) ? leader : null;
}

export function canSwapTrumpSeven(state: GameState, player: PlayerId): boolean {
  return state.sevenSwapAvailable === player && state.trickStep === 'lead';
}

export function swapTrumpSeven(state: GameState, player: PlayerId): GameState {
  if (!canSwapTrumpSeven(state, player)) {
    throw new Error('Výměna sedmy trumfu není povolena.');
  }
  if (!state.trumpSuit || !state.trumpCard) {
    throw new Error('Trumf není nastaven.');
  }

  const next = cloneState(state);
  const hand = next.players[player].hand;
  const trumpSevenIndex = hand.findIndex(
    (c) => c.suit === next.trumpSuit && c.rank === '7',
  );
  if (trumpSevenIndex === -1) {
    throw new Error('Hráč nemá sedmu trumfu.');
  }

  const trumpSeven = hand[trumpSevenIndex];
  const oldTrumpCard = next.trumpCard as Card;

  hand[trumpSevenIndex] = oldTrumpCard;
  next.trumpCard = trumpSeven;
  next.lastActionMessage = `${player === 'player1' ? 'Hráč 1' : 'Hráč 2'} vyměnil sedmu trumfu.`;
  updateSevenSwapAvailability(next);

  return next;
}

export interface LeadMoveInput {
  player: PlayerId;
  card: Card;
  declareMeld?: boolean;
}

export interface FollowMoveInput {
  player: PlayerId;
  card: Card;
}

function cloneState(state: GameState): GameState {
  return JSON.parse(JSON.stringify(state)) as GameState;
}

function assertLeadingPlayer(state: GameState, player: PlayerId): void {
  if (state.currentLeader !== player) {
    throw new Error('Nejste na tahu – nemůžete vést.');
  }
  if (state.trickStep !== 'lead') {
    throw new Error('Není fáze vedení štychu.');
  }
}

function assertFollowingPlayer(state: GameState, player: PlayerId): void {
  const expected = otherPlayer(state.currentLeader);
  if (player !== expected) {
    throw new Error('Nejste na tahu – nemůžete odpovídat.');
  }
  if (state.trickStep !== 'follow') {
    throw new Error('Není fáze odpovědi na štych.');
  }
}

export function playLead(state: GameState, input: LeadMoveInput): GameState {
  if (state.phase !== 'phase1_trick' && state.phase !== 'phase2_trick') {
    throw new Error('Nelze hrát mimo fázi štychu.');
  }

  assertLeadingPlayer(state, input.player);

  const next = cloneState(state);
  const hand = next.players[input.player].hand;

  if (!handContains(hand, input.card)) {
    throw new Error('Karta není v ruce.');
  }

  let pendingMeld: MeldDeclaration | undefined;
  if (input.declareMeld) {
    if (!next.trumpSuit) {
      throw new Error('Trumf není nastaven.');
    }
    if (!canDeclareMeld(hand, input.card, next.trumpSuit)) {
      throw new Error('Hlášku nelze ohlásit s touto kartou.');
    }
    const partner = findMeldPartner(hand, input.card);
    if (!partner) {
      throw new Error('Chybí pár pro hlášku.');
    }
    const points = meldPointsForSuit(input.card.suit, next.trumpSuit);
    pendingMeld = {
      player: input.player,
      suit: input.card.suit,
      points,
      playedCard: input.card,
      partnerCard: partner,
    };
    next.players[input.player].meldPoints += points;
    next.lastActionMessage = meldAnnouncementText(pendingMeld);
  }

  next.players[input.player].hand = removeCardFromHand(hand, input.card);
  next.currentTrick = {
    lead: { player: input.player, card: input.card },
    pendingMeld,
  };
  next.trickStep = 'follow';
  next.sevenSwapAvailable = null;

  if (!input.declareMeld) {
    next.lastActionMessage = `${input.player === 'player1' ? 'Hráč 1' : 'Hráč 2'} vedl ${input.card.rank}.`;
  }

  return next;
}

export function playFollow(state: GameState, input: FollowMoveInput): GameState {
  if (state.phase !== 'phase1_trick' && state.phase !== 'phase2_trick') {
    throw new Error('Nelze hrát mimo fázi štychu.');
  }

  assertFollowingPlayer(state, input.player);

  const leadPlay = state.currentTrick.lead;
  if (!leadPlay) {
    throw new Error('Chybí vedoucí karta.');
  }

  const isPhase2 = state.phase === 'phase2_trick';
  const hand = state.players[input.player].hand;

  if (!handContains(hand, input.card)) {
    throw new Error('Karta není v ruce.');
  }

  if (!state.trumpSuit) {
    throw new Error('Trumf není nastaven.');
  }

  if (!isValidMove(leadPlay.card, input.card, hand, state.trumpSuit, isPhase2)) {
    throw new Error('Neplatný tah – porušení pravidel fáze 2.');
  }

  const next = cloneState(state);
  next.players[input.player].hand = removeCardFromHand(
    next.players[input.player].hand,
    input.card,
  );
  next.currentTrick.follow = { player: input.player, card: input.card };
  next.trickStep = 'resolve';

  return resolveTrick(next);
}

function resolveTrick(state: GameState): GameState {
  const lead = state.currentTrick.lead!;
  const follow = state.currentTrick.follow!;
  if (!state.trumpSuit) {
    throw new Error('Trumf není nastaven.');
  }

  const winnerSide = determineTrickWinner(lead.card, follow.card, state.trumpSuit);
  const winner: PlayerId = winnerSide === 'lead' ? lead.player : follow.player;

  const completed: CompletedTrick = {
    number: state.trickNumber,
    lead,
    follow,
    winner,
    meld: state.currentTrick.pendingMeld,
  };

  const next = cloneState(state);
  next.completedTricks.push(completed);
  next.players[winner].wonTricks.push(completed);
  next.currentTrick = {};
  next.lastActionMessage = `Štych ${state.trickNumber} vyhrál ${winner === 'player1' ? 'Hráč 1' : 'Hráč 2'}.`;

  const canDraw = next.talon.length > 0 || next.trumpCard !== null;

  if (canDraw) {
    next.phase = 'phase1_draw';
    next.trickStep = 'lead';
    next.currentLeader = winner;
    return performDrawStep(next, winner);
  }

  if (state.phase === 'phase1_trick') {
    next.phase = 'phase2_trick';
    next.trickNumber += 1;
    next.trickStep = 'lead';
    next.currentLeader = winner;
    updateSevenSwapAvailability(next);
    next.lastActionMessage += ' Talón vyčerpán – začíná uzavřená hra!';
    return next;
  }

  if (next.trickNumber >= 16) {
    return finalizeGame(next);
  }

  next.phase = 'phase2_trick';
  next.trickNumber += 1;
  next.trickStep = 'lead';
  next.currentLeader = winner;
  updateSevenSwapAvailability(next);
  return next;
}

function performDrawStep(state: GameState, trickWinner: PlayerId): GameState {
  const next = cloneState(state);
  const loser = otherPlayer(trickWinner);

  // Winner draws first from talon top
  if (next.talon.length > 0) {
    const winnerCard = next.talon.shift()!;
    next.players[trickWinner].hand.push(winnerCard);
  } else if (next.trumpCard) {
    next.players[trickWinner].hand.push(next.trumpCard);
    next.trumpCard = null;
  }

  // Loser draws second – last draw may be the face-up trump at talon bottom
  if (next.talon.length > 0) {
    const loserCard = next.talon.shift()!;
    next.players[loser].hand.push(loserCard);
  } else if (next.trumpCard) {
    next.players[loser].hand.push(next.trumpCard);
    next.trumpCard = null;
  }

  const talonExhausted = next.talon.length === 0 && !next.trumpCard;

  if (talonExhausted) {
    next.phase = 'phase2_trick';
    next.trickNumber += 1;
    next.trickStep = 'lead';
    next.currentLeader = trickWinner;
    next.lastActionMessage = 'Talón vyčerpán – poslední karta byl trumf. Uzavřená hra!';
    updateSevenSwapAvailability(next);
    return next;
  }

  next.phase = 'phase1_trick';
  next.trickNumber += 1;
  next.trickStep = 'lead';
  next.currentLeader = trickWinner;
  updateSevenSwapAvailability(next);

  return next;
}

function finalizeGame(state: GameState): GameState {
  const next = cloneState(state);
  const result = buildScoreBreakdown(next);
  next.scores = result.scores;
  next.winner = result.winner;
  next.phase = 'game_over';
  next.trickStep = 'lead';

  if (result.winner === 'draw') {
    next.lastActionMessage = `Konec hry – remíza ${result.scores.player1}:${result.scores.player2}!`;
  } else {
    const name = result.winner === 'player1' ? 'Hráč 1' : 'Hráč 2';
    next.lastActionMessage = `Konec hry – vítěz ${name} (${result.scores[result.winner]} bodů)!`;
  }

  return next;
}

export function getActivePlayer(state: GameState): PlayerId | null {
  if (state.phase === 'game_over' || state.phase === 'setup' || state.phase === 'phase1_draw') {
    return null;
  }
  if (state.trickStep === 'lead') {
    return state.currentLeader;
  }
  if (state.trickStep === 'follow') {
    return otherPlayer(state.currentLeader);
  }
  return null;
}

export function getPlayableCards(state: GameState, player: PlayerId): Card[] {
  if (getActivePlayer(state) !== player) {
    return [];
  }

  const hand = state.players[player].hand;

  if (state.trickStep === 'lead') {
    return [...hand];
  }

  const lead = state.currentTrick.lead;
  if (!lead || !state.trumpSuit) {
    return [];
  }

  const isPhase2 = state.phase === 'phase2_trick';
  return getValidResponseCards(lead.card, hand, state.trumpSuit, isPhase2);
}

export function getMeldOptions(state: GameState, player: PlayerId): Suit[] {
  if (getActivePlayer(state) !== player || state.trickStep !== 'lead') {
    return [];
  }
  if (!state.trumpSuit) return [];

  const hand = state.players[player].hand;
  const suits: Suit[] = [];
  for (const suit of ['hearts', 'leaves', 'acorns', 'bells'] as Suit[]) {
    const hasKing = hand.some((c) => c.suit === suit && c.rank === 'K');
    const hasQueen = hand.some((c) => c.suit === suit && c.rank === 'Q');
    if (hasKing && hasQueen) {
      suits.push(suit);
    }
  }
  return suits;
}

export function createNewGame(dealer: PlayerId = 'player2'): GameState {
  return dealGame(dealer).state;
}

export {
  isValidMove,
  getValidResponseCards,
  canDeclareMeld,
  buildScoreBreakdown,
};
