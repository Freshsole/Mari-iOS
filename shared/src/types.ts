/** German-suited suits used in Czech Mariáš (Prší style deck) */
export type Suit = 'hearts' | 'leaves' | 'acorns' | 'bells';

/** Ranks from Seven to Ace in a 32-card deck */
export type Rank = '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';

export interface Card {
  id: string;
  suit: Suit;
  rank: Rank;
}

export type PlayerId = 'player1' | 'player2';

export type GamePhase =
  | 'setup'
  | 'phase1_trick'
  | 'phase1_draw'
  | 'phase2_trick'
  | 'game_over';

export type TrickStep = 'lead' | 'follow' | 'resolve';

export interface MeldDeclaration {
  player: PlayerId;
  suit: Suit;
  points: 20 | 40;
  /** Which card was played as lead */
  playedCard: Card;
  /** Partner card shown from hand */
  partnerCard: Card;
}

export interface TrickPlay {
  player: PlayerId;
  card: Card;
}

export interface CompletedTrick {
  number: number;
  lead: TrickPlay;
  follow: TrickPlay;
  winner: PlayerId;
  meld?: MeldDeclaration;
}

export interface PlayerState {
  hand: Card[];
  wonTricks: CompletedTrick[];
  meldPoints: number;
  trickPoints: number;
}

export interface GameState {
  phase: GamePhase;
  trumpSuit: Suit | null;
  trumpCard: Card | null;
  talon: Card[];
  players: Record<PlayerId, PlayerState>;
  currentLeader: PlayerId;
  dealer: PlayerId;
  trickNumber: number;
  trickStep: TrickStep;
  currentTrick: {
    lead?: TrickPlay;
    follow?: TrickPlay;
    pendingMeld?: MeldDeclaration;
  };
  completedTricks: CompletedTrick[];
  /** Player who can swap trump seven before leading */
  sevenSwapAvailable: PlayerId | null;
  winner: PlayerId | 'draw' | null;
  scores: {
    player1: number;
    player2: number;
  } | null;
  lastActionMessage: string;
}

export const SUITS: Suit[] = ['hearts', 'leaves', 'acorns', 'bells'];

export const RANKS: Rank[] = ['7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

/** Rank hierarchy: Ace highest, Seven lowest */
export const RANK_ORDER: Record<Rank, number> = {
  A: 7,
  '10': 6,
  K: 5,
  Q: 4,
  J: 3,
  '9': 2,
  '8': 1,
  '7': 0,
};

export const SUIT_LABELS_CS: Record<Suit, string> = {
  hearts: 'Červené',
  leaves: 'Zelené',
  acorns: 'Žaludy',
  bells: 'Kule',
};

export const SUIT_SYMBOLS: Record<Suit, string> = {
  hearts: '♥',
  leaves: '♣',
  acorns: '♠',
  bells: '♦',
};

export const SUIT_COLORS: Record<Suit, string> = {
  hearts: '#C62828',
  leaves: '#2E7D32',
  acorns: '#4E342E',
  bells: '#F9A825',
};

export const RANK_LABELS_CS: Record<Rank, string> = {
  '7': 'Sedma',
  '8': 'Osm',
  '9': 'Devět',
  '10': 'Deset',
  J: 'Spodek',
  Q: 'Svršek',
  K: 'Král',
  A: 'Eso',
};

export const PLAYER_LABELS_CS: Record<PlayerId, string> = {
  player1: 'Hráč 1',
  player2: 'Hráč 2',
};
