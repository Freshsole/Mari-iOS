import React from 'react';
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
} from '../../../shared/src';
import { findMeldPartner } from '../../../shared/src/deck';

export type GameMode = 'hotseat' | 'vsAi';

export interface GameController {
  state: GameState;
  mode: GameMode;
  humanPlayer: PlayerId;
  newGame: () => void;
  playCard: (card: Card, declareMeld?: boolean) => void;
  swapSeven: () => void;
  skipSwap: () => void;
}

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

export function createGameActions(
  setState: React.Dispatch<React.SetStateAction<GameState>>,
  mode: GameMode,
  humanPlayer: PlayerId,
) {
  const runAiTurn = (state: GameState) => {
    if (mode !== 'vsAi') return;
    let current = state;
    let active = getActivePlayer(current);
    while (active && active !== humanPlayer && current.phase !== 'game_over') {
      const { card, declareMeld } = pickAiCard(current, active);
      if (current.trickStep === 'lead') {
        current = playLead(current, { player: active, card, declareMeld });
      } else {
        current = playFollow(current, { player: active, card });
      }
      active = getActivePlayer(current);
    }
    setState(current);
  };

  return {
    newGame: () => {
      const fresh = createNewGame('player2');
      setState(fresh);
      if (mode === 'vsAi') {
        setTimeout(() => runAiTurn(fresh), 300);
      }
    },
    playCard: (card: Card, declareMeld = false) => {
      setState((prev) => {
        const active = getActivePlayer(prev);
        if (!active) return prev;
        try {
          let next =
            prev.trickStep === 'lead'
              ? playLead(prev, { player: active, card, declareMeld })
              : playFollow(prev, { player: active, card });
          setTimeout(() => runAiTurn(next), 300);
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
          setTimeout(() => runAiTurn(next), 300);
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

export { findMeldPartner };
