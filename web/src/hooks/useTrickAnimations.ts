import { useCallback, useEffect, useRef, useState } from 'react';
import { Card, CompletedTrick, GameState, PlayerId, TrickPlay } from '@shared/index';

export type FlyRole = 'lead' | 'follow';

export type TrickOverlay =
  | { phase: 'fly-in'; player: PlayerId; card: Card; role: FlyRole }
  | { phase: 'hold'; trick: CompletedTrick }
  | { phase: 'collect'; trick: CompletedTrick };

const FLY_IN_MS = 480;
const HOLD_MS = 800;
const COLLECT_MS = 550;

export function useTrickAnimations(state: GameState, viewingPlayer: PlayerId) {
  const [overlay, setOverlay] = useState<TrickOverlay | null>(null);
  const [flying, setFlying] = useState(false);

  const prevLeadId = useRef<string | undefined>(state.currentTrick.lead?.card.id);
  const prevFollowId = useRef<string | undefined>(state.currentTrick.follow?.card.id);
  const prevTrickCount = useRef(state.completedTricks.length);
  const timers = useRef<number[]>([]);

  const clearTimers = useCallback(() => {
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];
  }, []);

  const schedule = useCallback((fn: () => void, ms: number) => {
    const id = window.setTimeout(fn, ms);
    timers.current.push(id);
  }, []);

  useEffect(() => clearTimers, [clearTimers]);

  useEffect(() => {
    const lead = state.currentTrick.lead;
    const follow = state.currentTrick.follow;

    if (lead && lead.card.id !== prevLeadId.current) {
      prevLeadId.current = lead.card.id;
      setFlying(true);
      setOverlay({ phase: 'fly-in', player: lead.player, card: lead.card, role: 'lead' });
      schedule(() => {
        setFlying(false);
        setOverlay(null);
      }, FLY_IN_MS);
    }

    if (follow && follow.card.id !== prevFollowId.current) {
      prevFollowId.current = follow.card.id;
      setFlying(true);
      setOverlay({ phase: 'fly-in', player: follow.player, card: follow.card, role: 'follow' });
      schedule(() => {
        setFlying(false);
        setOverlay(null);
      }, FLY_IN_MS);
    }
  }, [state.currentTrick.lead, state.currentTrick.follow, schedule]);

  useEffect(() => {
    if (state.completedTricks.length <= prevTrickCount.current) return;

    const trick = state.completedTricks[state.completedTricks.length - 1];
    prevTrickCount.current = state.completedTricks.length;
    prevLeadId.current = undefined;
    prevFollowId.current = undefined;

    clearTimers();
    setFlying(true);
    setOverlay({ phase: 'hold', trick });

    schedule(() => {
      setOverlay({ phase: 'collect', trick });
      schedule(() => {
        setFlying(false);
        setOverlay(null);
      }, COLLECT_MS);
    }, HOLD_MS);
  }, [state.completedTricks, clearTimers, schedule]);

  const displayTrick: { lead?: TrickPlay; follow?: TrickPlay } =
    overlay?.phase === 'hold' || overlay?.phase === 'collect'
      ? { lead: overlay.trick.lead, follow: overlay.trick.follow }
      : state.currentTrick;

  const flyInClass = (player: PlayerId, role: FlyRole) => {
    if (overlay?.phase !== 'fly-in' || overlay.role !== role) return '';
    const fromSelf = player === viewingPlayer;
    return fromSelf ? 'trick-card-slot--fly-from-player' : 'trick-card-slot--fly-from-opponent';
  };

  const collecting = overlay?.phase === 'collect';
  const collectWinner =
    overlay?.phase === 'collect' ? overlay.trick.winner : null;

  return {
    overlay,
    flying,
    displayTrick,
    flyInClass,
    collecting,
    collectWinner,
    isAnimating: flying,
  };
}

export const TRICK_ANIM_TOTAL_MS = FLY_IN_MS + HOLD_MS + COLLECT_MS;
