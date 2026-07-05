import { useEffect, useRef, useState } from 'react';
import {
  Card,
  GameState,
  PLAYER_LABELS_CS,
  PlayerId,
  SUIT_LABELS_CS,
  buildScoreBreakdown,
} from '@shared/index';
import { getActivePlayer, getMeldOptions, getPlayableCards } from '@shared/gameEngine';
import { getHandLayout } from '../utils/handLayout';
import { PlayingCard } from './PlayingCard';

interface Props {
  state: GameState;
  viewingPlayer: PlayerId;
  onPlayCard: (card: Card, declareMeld?: boolean) => void;
  onSwapSeven: () => void;
  onSkipSwap: () => void;
}

type AnimEvent =
  | { type: 'play'; player: PlayerId; card: Card }
  | { type: 'trick-won'; winner: PlayerId };

function phaseShort(state: GameState): string {
  if (state.phase === 'phase1_trick' || state.phase === 'phase1_draw') return 'Fáze 1';
  if (state.phase === 'phase2_trick') return 'Fáze 2';
  if (state.phase === 'game_over') return 'Konec';
  return '…';
}

export function GameBoard({
  state,
  viewingPlayer,
  onPlayCard,
  onSwapSeven,
  onSkipSwap,
}: Props) {
  const active = getActivePlayer(state);
  const isMyTurn = active === viewingPlayer;
  const playable = isMyTurn ? getPlayableCards(state, viewingPlayer) : [];
  const playableIds = new Set(playable.map((c) => c.id));
  const meldSuits = isMyTurn && state.trickStep === 'lead' ? getMeldOptions(state, viewingPlayer) : [];
  const opponent: PlayerId = viewingPlayer === 'player1' ? 'player2' : 'player1';

  const [animEvent, setAnimEvent] = useState<AnimEvent | null>(null);
  const [busy, setBusy] = useState(false);
  const lastTapRef = useRef<{ cardId: string; time: number } | null>(null);
  const prevTrickCount = useRef(state.completedTricks.length);
  const prevLeadId = useRef<string | undefined>(state.currentTrick.lead?.card.id);
  const prevFollowId = useRef<string | undefined>(state.currentTrick.follow?.card.id);

  useEffect(() => {
    const lead = state.currentTrick.lead;
    const follow = state.currentTrick.follow;

    if (lead && lead.card.id !== prevLeadId.current) {
      setAnimEvent({ type: 'play', player: lead.player, card: lead.card });
      const t = setTimeout(() => setAnimEvent(null), 500);
      prevLeadId.current = lead.card.id;
      return () => clearTimeout(t);
    }

    if (follow && follow.card.id !== prevFollowId.current) {
      setAnimEvent({ type: 'play', player: follow.player, card: follow.card });
      const t = setTimeout(() => setAnimEvent(null), 500);
      prevFollowId.current = follow.card.id;
      return () => clearTimeout(t);
    }

    if (state.completedTricks.length > prevTrickCount.current) {
      const last = state.completedTricks[state.completedTricks.length - 1];
      setAnimEvent({ type: 'trick-won', winner: last.winner });
      prevTrickCount.current = state.completedTricks.length;
      prevLeadId.current = undefined;
      prevFollowId.current = undefined;
      const t = setTimeout(() => setAnimEvent(null), 700);
      return () => clearTimeout(t);
    }
  }, [state.currentTrick, state.completedTricks]);

  const handleCardTap = (card: Card) => {
    if (!playableIds.has(card.id) || busy) return;

    const canMeld =
      (card.rank === 'K' || card.rank === 'Q') && meldSuits.includes(card.suit);
    const now = Date.now();
    const last = lastTapRef.current;
    const isDoubleTap = last?.cardId === card.id && now - last.time < 450;

    lastTapRef.current = { cardId: card.id, time: now };
    setBusy(true);

    setAnimEvent({ type: 'play', player: viewingPlayer, card });

    setTimeout(() => {
      onPlayCard(card, isDoubleTap && canMeld);
      setBusy(false);
      setAnimEvent(null);
    }, 380);
  };

  const breakdown = state.phase === 'game_over' ? buildScoreBreakdown(state) : null;
  const hand = state.players[viewingPlayer].hand;
  const handCount = hand.length;
  const opponentCount = state.players[opponent].hand.length;

  return (
    <div className="game-board">
      <header className="game-topbar">
        <div className="phase-pill">{phaseShort(state)}</div>
        <div className="topbar-center">
          <span className="trick-counter">Štych {Math.min(state.trickNumber, 16)}/16</span>
          {state.trumpSuit && (
            <span className="trump-badge">Trumf: {SUIT_LABELS_CS[state.trumpSuit]}</span>
          )}
        </div>
        <div className="score-pill">
          {state.players.player1.meldPoints}:{state.players.player2.meldPoints}
        </div>
      </header>

      <section className="opponent-zone">
        <div className="player-chip opponent-chip">
          <div className={`avatar ${active === opponent ? 'avatar--active' : ''}`}>
            {opponent === 'player1' ? '1' : '2'}
          </div>
          <div className="player-meta">
            <span className="player-name">{PLAYER_LABELS_CS[opponent]}</span>
            <span className="card-count">{opponentCount} karet</span>
          </div>
        </div>
        <div className="opponent-hand">
          <div className="opponent-stack">
            <div className="opponent-stack-layer opponent-stack-layer--3" />
            <div className="opponent-stack-layer opponent-stack-layer--2" />
            <PlayingCard
              card={{ id: 'opp-stack', suit: 'hearts', rank: '7' }}
              faceDown
              width={48}
              height={67}
            />
            <span className="opponent-stack-count">{opponentCount}</span>
          </div>
        </div>
      </section>

      <section className="table-zone">
        <div className="table-felt">
          <div className="deck-zone">
            <div className="talon-pile">
              {state.talon.length > 0 && (
                <>
                  <div className="talon-stack-card talon-stack-card--back">
                    <PlayingCard card={state.talon[0]} faceDown width={54} height={76} />
                  </div>
                  <div className="talon-count">{state.talon.length}</div>
                </>
              )}
              {state.trumpCard && (
                <div className="trump-card-slot">
                  <PlayingCard card={state.trumpCard} width={54} height={76} className="trump-card-visible" />
                  <span className="trump-label">Trumf</span>
                </div>
              )}
            </div>
          </div>

          <div
            className={`trick-zone${animEvent?.type === 'trick-won' ? ' trick-zone--collecting' : ''}`}
          >
          {state.currentTrick.lead && (
            <div
              className={`trick-card-slot trick-card-slot--lead${
                animEvent?.type === 'play' && animEvent.card.id === state.currentTrick.lead.card.id
                  ? ' trick-card-slot--fly-in'
                  : ''
              }`}
            >
              <span className="trick-player">{PLAYER_LABELS_CS[state.currentTrick.lead.player]}</span>
              <PlayingCard card={state.currentTrick.lead.card} width={62} height={87} />
              {state.currentTrick.pendingMeld && (
                <span className="meld-burst">
                  {state.currentTrick.pendingMeld.points === 40 ? '40!' : '20!'}
                </span>
              )}
            </div>
          )}
          {state.currentTrick.follow && (
            <div
              className={`trick-card-slot trick-card-slot--follow${
                animEvent?.type === 'play' && animEvent.card.id === state.currentTrick.follow.card.id
                  ? ' trick-card-slot--fly-in'
                  : ''
              }`}
            >
              <span className="trick-player">{PLAYER_LABELS_CS[state.currentTrick.follow.player]}</span>
              <PlayingCard card={state.currentTrick.follow.card} width={62} height={87} />
            </div>
          )}
          {!state.currentTrick.lead && !state.currentTrick.follow && (
            <p className="table-hint">
              {active ? `${PLAYER_LABELS_CS[active]} hraje…` : state.lastActionMessage}
            </p>
          )}
          </div>
        </div>
      </section>

      {state.sevenSwapAvailable === viewingPlayer && (
        <div className="swap-sheet">
          <p>Vyměnit sedmu trumfu?</p>
          <div className="swap-actions">
            <button type="button" className="ios-btn ios-btn--primary" onClick={onSwapSeven}>
              Ano
            </button>
            <button type="button" className="ios-btn ios-btn--ghost" onClick={onSkipSwap}>
              Ne
            </button>
          </div>
        </div>
      )}

      <section className="player-zone">
        <div className="status-bar">
          <div className="player-chip">
            <div className={`avatar ${isMyTurn ? 'avatar--active' : ''}`}>Vy</div>
            <span className="player-name">{PLAYER_LABELS_CS[viewingPlayer]}</span>
          </div>
          <p className="status-message">{state.lastActionMessage}</p>
          {meldSuits.length > 0 && isMyTurn && state.trickStep === 'lead' && (
            <p className="meld-hint">Dvojtap na K/Q = hláška</p>
          )}
        </div>

        <div className="player-hand" style={{ ['--hand-count' as string]: handCount }}>
          {hand.map((card, i) => {
            const canPlay = playableIds.has(card.id);
            const layout = getHandLayout(i, handCount);
            const cardW = handCount > 7 ? 50 : handCount > 5 ? 54 : 58;
            const cardH = Math.round(cardW * 1.4);
            return (
              <button
                key={card.id}
                type="button"
                className={`hand-slot${canPlay ? ' hand-slot--playable' : ''}${busy ? ' hand-slot--busy' : ''}`}
                disabled={!canPlay || busy}
                style={{
                  left: '50%',
                  ['--hx' as string]: `${layout.x}px`,
                  ['--hr' as string]: `${layout.rotate}deg`,
                  transform: `translateX(calc(-50% + ${layout.x}px)) rotate(${layout.rotate}deg)`,
                  transformOrigin: 'bottom center',
                  zIndex: layout.zIndex,
                }}
                onClick={() => handleCardTap(card)}
              >
                <PlayingCard card={card} width={cardW} height={cardH} disabled={!canPlay} />
              </button>
            );
          })}
        </div>
      </section>

      {breakdown && (
        <div className="result-overlay">
          <div className="result-card">
            <h2>
              {breakdown.winner === 'draw'
                ? 'Remíza'
                : `Vítěz: ${PLAYER_LABELS_CS[breakdown.winner as PlayerId]}`}
            </h2>
            <p>Hráč 1: {breakdown.breakdown.player1.total} b.</p>
            <p>Hráč 2: {breakdown.breakdown.player2.total} b.</p>
          </div>
        </div>
      )}
    </div>
  );
}
