import { useEffect, useRef, useState } from 'react';
import {
  Card,
  GameState,
  PLAYER_LABELS_CS,
  PlayerId,
  SUIT_LABELS_CS,
  buildScoreBreakdown,
  calculateScores,
} from '@shared/index';
import { getActivePlayer, getMeldOptions, getPlayableCards } from '@shared/gameEngine';
import { getHandSizing } from '../utils/handLayout';
import { useViewportWidth } from '../hooks/useViewportWidth';
import { useTrickAnimations } from '../hooks/useTrickAnimations';
import { PlayingCard } from './PlayingCard';

interface Props {
  state: GameState;
  viewingPlayer: PlayerId;
  onPlayCard: (card: Card, declareMeld?: boolean) => void;
  onSwapSeven: () => void;
  onSkipSwap: () => void;
}

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

  const {
    overlay,
    flying,
    displayTrick,
    flyInClass,
    collecting,
    collectWinner,
  } = useTrickAnimations(state, viewingPlayer);

  const [busy, setBusy] = useState(false);
  const [meldPendingId, setMeldPendingId] = useState<string | null>(null);
  const meldTimerRef = useRef<number | null>(null);

  const breakdown = state.phase === 'game_over' ? buildScoreBreakdown(state) : null;
  const liveScores = calculateScores(state);
  const hand = state.players[viewingPlayer].hand;
  const handCount = hand.length;
  const opponentCount = state.players[opponent].hand.length;
  const viewportWidth = useViewportWidth();
  const handSize = getHandSizing(handCount, Math.min(viewportWidth, 480));

  const myWonCount = state.players[viewingPlayer].wonTricks.length;
  const oppWonCount = state.players[opponent].wonTricks.length;

  useEffect(() => {
    return () => {
      if (meldTimerRef.current !== null) {
        window.clearTimeout(meldTimerRef.current);
      }
    };
  }, []);

  const commitPlay = (card: Card, declareMeld = false) => {
    setMeldPendingId(null);
    setBusy(true);
    window.setTimeout(() => {
      onPlayCard(card, declareMeld);
      setBusy(false);
    }, 420);
  };

  const handleCardTap = (card: Card) => {
    if (!playableIds.has(card.id) || busy || flying) return;

    const canMeld =
      (card.rank === 'K' || card.rank === 'Q') && meldSuits.includes(card.suit);

    if (canMeld) {
      if (meldPendingId === card.id) {
        if (meldTimerRef.current !== null) {
          window.clearTimeout(meldTimerRef.current);
          meldTimerRef.current = null;
        }
        commitPlay(card, true);
        return;
      }

      if (meldTimerRef.current !== null) {
        window.clearTimeout(meldTimerRef.current);
      }

      setMeldPendingId(card.id);
      meldTimerRef.current = window.setTimeout(() => {
        meldTimerRef.current = null;
        setMeldPendingId(null);
        commitPlay(card, false);
      }, 480);
      return;
    }

    if (meldTimerRef.current !== null) {
      window.clearTimeout(meldTimerRef.current);
      meldTimerRef.current = null;
    }
    setMeldPendingId(null);
    commitPlay(card, false);
  };

  const renderTrickCard = (
    play: NonNullable<typeof displayTrick.lead>,
    role: 'lead' | 'follow',
    meldPoints?: 20 | 40,
  ) => {
    const winnerSide =
      collecting && collectWinner
        ? collectWinner === viewingPlayer
          ? 'player'
          : 'opponent'
        : null;

    return (
      <div
        key={play.card.id}
        className={[
          'trick-card-slot',
          `trick-card-slot--${role}`,
          !collecting ? flyInClass(play.player, role) : '',
          collecting ? 'trick-card-slot--collecting' : '',
          collecting && winnerSide ? `trick-card-slot--to-${winnerSide}-pile` : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <span className="trick-player">{PLAYER_LABELS_CS[play.player]}</span>
        <PlayingCard card={play.card} width={62} height={87} />
        {role === 'lead' && meldPoints && !collecting && (
          <span className="meld-burst">{meldPoints === 40 ? '40!' : '20!'}</span>
        )}
      </div>
    );
  };

  const overlayMeld =
    overlay?.phase === 'hold' || overlay?.phase === 'collect'
      ? overlay.trick.meld?.points
      : state.currentTrick.pendingMeld?.points;

  return (
    <div className="game-board">
      <header className="game-topbar">
        <div className="phase-pill">{phaseShort(state)}</div>
        <div className="topbar-center">
          <span className="trick-counter">Štych {Math.min(state.trickNumber, 16)}/16</span>
        </div>
        <div className="score-pill" title="Body ze štychů + hlášky">
          {liveScores.player1}:{liveScores.player2}
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
          <div className="opponent-stack opponent-stack--source">
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
          <div
            className={`won-pile won-pile--opponent${collecting && collectWinner === opponent ? ' won-pile--receiving' : ''}`}
          >
            <div className="won-pile-stack">
              {oppWonCount > 0 && (
                <PlayingCard
                  card={state.players[opponent].wonTricks[oppWonCount - 1].lead.card}
                  faceDown
                  width={36}
                  height={50}
                />
              )}
            </div>
            <span className="won-pile-count">{oppWonCount}</span>
            <span className="won-pile-label">Štychy</span>
          </div>

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

          <div className={`trick-zone${collecting ? ' trick-zone--collecting' : ''}`}>
            {displayTrick.lead && renderTrickCard(displayTrick.lead, 'lead', overlayMeld)}
            {displayTrick.follow && renderTrickCard(displayTrick.follow, 'follow')}
            {!displayTrick.lead && !displayTrick.follow && (
              <p className="table-hint">
                {active ? `${PLAYER_LABELS_CS[active]} hraje…` : state.lastActionMessage}
              </p>
            )}
          </div>

          <div
            className={`won-pile won-pile--player${collecting && collectWinner === viewingPlayer ? ' won-pile--receiving' : ''}`}
          >
            <div className="won-pile-stack">
              {myWonCount > 0 && (
                <PlayingCard
                  card={state.players[viewingPlayer].wonTricks[myWonCount - 1].lead.card}
                  faceDown
                  width={36}
                  height={50}
                />
              )}
            </div>
            <span className="won-pile-count">{myWonCount}</span>
            <span className="won-pile-label">Štychy</span>
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

      <section className="player-zone player-zone--source">
        <div className="status-bar">
          <div className="player-chip">
            <div className={`avatar ${isMyTurn ? 'avatar--active' : ''}`}>Vy</div>
            <span className="player-name">{PLAYER_LABELS_CS[viewingPlayer]}</span>
          </div>
          <p className="status-message">{state.lastActionMessage}</p>
          {meldSuits.length > 0 && isMyTurn && state.trickStep === 'lead' && (
            <p className="meld-hint">
              {meldPendingId ? 'Ještě jednou = hláška' : 'Dvojtap K/Svršek = hláška'}
            </p>
          )}
        </div>

        <div className="player-hand" style={{ gap: `${handSize.gap}px` }}>
          {hand.map((card) => {
            const canPlay = playableIds.has(card.id);
            const canMeld =
              (card.rank === 'K' || card.rank === 'Q') && meldSuits.includes(card.suit);
            return (
              <button
                key={card.id}
                type="button"
                className={[
                  'hand-slot',
                  canPlay ? 'hand-slot--playable' : '',
                  canMeld && meldPendingId === card.id ? 'hand-slot--meld-pending' : '',
                  busy || flying ? 'hand-slot--busy' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                disabled={!canPlay || busy || flying}
                onClick={() => handleCardTap(card)}
              >
                <PlayingCard
                  card={card}
                  width={handSize.cardWidth}
                  height={handSize.cardHeight}
                  disabled={!canPlay}
                />
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
