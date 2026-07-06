import { Dispatch, SetStateAction } from 'react';
import {
  Card,
  GameState,
  PlayerId,
  createNewGame,
  getActivePlayer,
  getMeldOptions,
  getPlayableCards,
  playFollow,
  playLead,
  swapTrumpSeven,
} from '@shared/index';
import { TRICK_ANIM_TOTAL_MS } from './useTrickAnimations';

export type GameMode = 'hotseat' | 'vsAi';

const PLAY_DELAY_MS = 520;
const TRICK_DONE_DELAY_MS = TRICK_ANIM_TOTAL_MS + 120;

function pickAiCard(state: GameState, player: PlayerId): { card: Card; declareMeld?: boolean } {
  const playable = getPlayableCards(state, player);
  const meldSuits = getMeldOptions(state, player);

  if (state.trickStep === 'lead' && meldSuits.length > 0 && Math.random() > 0.4) {
    const suit = meldSuits[0];
    const king = state.players[player].hand.find((c) => c.suit === suit && c.rank === 'K');
    const queen = state.players[player].hand.find((c) => c.suit === suit && c.rank === 'Q');
    const card = king ?? queen!;
    return { card, declareMeld: true };
  }

  if (state.trickStep === 'follow') {
    const lead = state.currentTrick.lead!.card;
    const winning = playable.find((c) => {
      if (c.suit === lead.suit) {
        return c.rank === 'A' || c.rank === '10';
      }
      return state.trumpSuit && c.suit === state.trumpSuit;
    });
    if (winning) return { card: winning };
  }

  return { card: playable[Math.floor(Math.random() * playable.length)] };
}

function delayAfterMove(prev: GameState, next: GameState): number {
  const trickCompleted = next.completedTricks.length > prev.completedTricks.length;
  return trickCompleted ? TRICK_DONE_DELAY_MS : PLAY_DELAY_MS;
}

export function createGameActions(
  setState: Dispatch<SetStateAction<GameState>>,
  mode: GameMode,
  humanPlayer: PlayerId,
) {
  const runAiTurn = (state: GameState) => {
    if (mode !== 'vsAi') return;
    const active = getActivePlayer(state);
    if (!active || active === humanPlayer || state.phase === 'game_over') return;

    const { card, declareMeld } = pickAiCard(state, active);
    const prev = state;
    const next =
      state.trickStep === 'lead'
        ? playLead(state, { player: active, card, declareMeld })
        : playFollow(state, { player: active, card });

    setState(next);

    const stillActive = getActivePlayer(next);
    if (stillActive && stillActive !== humanPlayer && next.phase !== 'game_over') {
      setTimeout(() => runAiTurn(next), delayAfterMove(prev, next));
    }
  };

  return {
    newGame: () => {
      const fresh = createNewGame('player2');
      setState(fresh);
      if (mode === 'vsAi') {
        setTimeout(() => runAiTurn(fresh), 700);
      }
    },
    playCard: (card: Card, declareMeld = false) => {
      setState((prev) => {
        const active = getActivePlayer(prev);
        if (!active) return prev;
        try {
          const next =
            prev.trickStep === 'lead'
              ? playLead(prev, { player: active, card, declareMeld })
              : playFollow(prev, { player: active, card });
          setTimeout(() => runAiTurn(next), delayAfterMove(prev, next));
          return next;
        } catch {
          return prev;
        }
      });
    },
    swapSeven: () => {
      setState((prev) => {
        const active = getActivePlayer(prev);
        if (!active) return prev;
        try {
          const next = swapTrumpSeven(prev, active);
          setTimeout(() => runAiTurn(next), PLAY_DELAY_MS);
          return next;
        } catch {
          return prev;
        }
      });
    },
    skipSwap: () => {
      setState((prev) => ({ ...prev, sevenSwapAvailable: null }));
    },
  };
}
