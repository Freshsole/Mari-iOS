import {
  CompletedTrick,
  GameState,
  MeldDeclaration,
  PlayerId,
} from './types';
import { cardPointValue } from './deck';

export function calculateTrickPoints(tricks: CompletedTrick[]): number {
  let total = 0;
  for (const trick of tricks) {
    total += cardPointValue(trick.lead.card);
    total += cardPointValue(trick.follow.card);
  }
  return total;
}

export function calculateScores(state: GameState): { player1: number; player2: number } {
  const p1TrickPoints = calculateTrickPoints(state.players.player1.wonTricks);
  const p2TrickPoints = calculateTrickPoints(state.players.player2.wonTricks);

  const p1LastTrickBonus =
    state.completedTricks.length === 16 &&
    state.completedTricks[15]?.winner === 'player1'
      ? 10
      : 0;
  const p2LastTrickBonus =
    state.completedTricks.length === 16 &&
    state.completedTricks[15]?.winner === 'player2'
      ? 10
      : 0;

  return {
    player1: p1TrickPoints + p1LastTrickBonus + state.players.player1.meldPoints,
    player2: p2TrickPoints + p2LastTrickBonus + state.players.player2.meldPoints,
  };
}

export function determineWinner(scores: { player1: number; player2: number }): PlayerId | 'draw' {
  if (scores.player1 > scores.player2) return 'player1';
  if (scores.player2 > scores.player1) return 'player2';
  return 'draw';
}

export function buildScoreBreakdown(state: GameState) {
  const scores = calculateScores(state);
  const p1Tricks = calculateTrickPoints(state.players.player1.wonTricks);
  const p2Tricks = calculateTrickPoints(state.players.player2.wonTricks);
  const p1LastBonus =
    state.completedTricks[15]?.winner === 'player1' ? 10 : 0;
  const p2LastBonus =
    state.completedTricks[15]?.winner === 'player2' ? 10 : 0;

  return {
    scores,
    winner: determineWinner(scores),
    breakdown: {
      player1: {
        trickPoints: p1Tricks,
        lastTrickBonus: p1LastBonus,
        meldPoints: state.players.player1.meldPoints,
        total: scores.player1,
      },
      player2: {
        trickPoints: p2Tricks,
        lastTrickBonus: p2LastBonus,
        meldPoints: state.players.player2.meldPoints,
        total: scores.player2,
      },
    },
  };
}

export function meldAnnouncementText(meld: MeldDeclaration): string {
  return meld.points === 40 ? 'Čtyřicet!' : 'Dvacet!';
}
