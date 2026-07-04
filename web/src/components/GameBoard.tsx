import { useState } from 'react';
import {
  Card,
  GamePhase,
  GameState,
  PLAYER_LABELS_CS,
  PlayerId,
  SUIT_LABELS_CS,
  buildScoreBreakdown,
} from '@shared/index';
import { getActivePlayer, getMeldOptions, getPlayableCards } from '@shared/gameEngine';
import { PlayingCard } from './PlayingCard';

interface Props {
  state: GameState;
  viewingPlayer: PlayerId;
  onPlayCard: (card: Card, declareMeld?: boolean) => void;
  onSwapSeven: () => void;
  onSkipSwap: () => void;
}

function phaseLabel(phase: GamePhase): string {
  switch (phase) {
    case 'setup':
      return 'Příprava';
    case 'phase1_trick':
    case 'phase1_draw':
      return 'Fáze 1 – Lízání z talónu';
    case 'phase2_trick':
      return 'Fáze 2 – Uzavřená hra';
    case 'game_over':
      return 'Konec hry';
    default:
      return phase;
  }
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
  const meldSuits =
    isMyTurn && state.trickStep === 'lead' ? getMeldOptions(state, viewingPlayer) : [];
  const opponent: PlayerId = viewingPlayer === 'player1' ? 'player2' : 'player1';

  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const canMeld =
    selectedCard &&
    (selectedCard.rank === 'K' || selectedCard.rank === 'Q') &&
    meldSuits.includes(selectedCard.suit);

  const handleConfirm = (declareMeld = false) => {
    if (!selectedCard) return;
    onPlayCard(selectedCard, declareMeld);
    setSelectedCard(null);
  };

  const breakdown = state.phase === 'game_over' ? buildScoreBreakdown(state) : null;

  return (
    <div className="board">
      <header className="board-header">
        <h1>Lízaný Mariáš</h1>
        <p className="phase">{phaseLabel(state.phase)}</p>
        {state.trumpSuit && (
          <p className="trump">
            Trumf: {SUIT_LABELS_CS[state.trumpSuit]}
            {state.trumpCard ? ` (${state.trumpCard.rank})` : ''}
          </p>
        )}
        <p className="message">{state.lastActionMessage}</p>
      </header>

      <section className="opponent-area">
        <p className="player-label">
          {PLAYER_LABELS_CS[opponent]} • {state.players[opponent].hand.length} karet
        </p>
        <div className="opponent-cards">
          {state.players[opponent].hand.map((_, i) => (
            <div key={`opp-${i}`} className="opponent-card" style={{ marginLeft: i > 0 ? -36 : 0 }}>
              <PlayingCard card={{ id: `hidden-${i}`, suit: 'hearts', rank: '7' }} faceDown width={52} height={78} />
            </div>
          ))}
        </div>
      </section>

      <section className="table">
        <div className="talon-area">
          <p className="talon-label">Talón: {state.talon.length}</p>
          {state.trumpCard && (
            <div className="trump-stack">
              {state.talon.length > 0 && (
                <div className="talon-stack">
                  <PlayingCard card={state.talon[0]} width={52} height={78} faceDown />
                </div>
              )}
              <div className="trump-visible">
                <PlayingCard card={state.trumpCard} width={52} height={78} />
                <span className="trump-note">Viditelný trumf</span>
              </div>
            </div>
          )}
        </div>

        <div className="trick-area">
          {state.currentTrick.lead && (
            <div className="trick-card">
              <span className="trick-label">{PLAYER_LABELS_CS[state.currentTrick.lead.player]}</span>
              <PlayingCard card={state.currentTrick.lead.card} width={58} height={86} />
              {state.currentTrick.pendingMeld && (
                <span className="meld-announce">
                  {state.currentTrick.pendingMeld.points === 40 ? 'Čtyřicet!' : 'Dvacet!'}
                </span>
              )}
            </div>
          )}
          {state.currentTrick.follow && (
            <div className="trick-card">
              <span className="trick-label">{PLAYER_LABELS_CS[state.currentTrick.follow.player]}</span>
              <PlayingCard card={state.currentTrick.follow.card} width={58} height={86} />
            </div>
          )}
        </div>

        <aside className="score-panel">
          <p>Hlášky P1: {state.players.player1.meldPoints} | P2: {state.players.player2.meldPoints}</p>
          <p>Štych {state.trickNumber} / 16</p>
          {active && state.phase !== 'game_over' && (
            <p className="turn-text">Na tahu: {PLAYER_LABELS_CS[active]}</p>
          )}
        </aside>
      </section>

      {state.sevenSwapAvailable === viewingPlayer && (
        <div className="swap-bar">
          <p>Máte sedmu trumfu – vyměnit s talónem?</p>
          <div className="swap-buttons">
            <button type="button" className="btn btn-primary" onClick={onSwapSeven}>
              Vyměnit 7
            </button>
            <button type="button" className="btn btn-secondary" onClick={onSkipSwap}>
              Ne
            </button>
          </div>
        </div>
      )}

      {isMyTurn && selectedCard && (
        <div className="action-bar">
          <button type="button" className="btn btn-primary" onClick={() => handleConfirm(false)}>
            Hrát {selectedCard.rank}
          </button>
          {canMeld && (
            <button type="button" className="btn btn-meld" onClick={() => handleConfirm(true)}>
              Hlásit {selectedCard.suit === state.trumpSuit ? '40' : '20'}
            </button>
          )}
        </div>
      )}

      <section className="hand-area">
        <p className="player-label">{PLAYER_LABELS_CS[viewingPlayer]} – vaše karty</p>
        <div className="hand">
          {state.players[viewingPlayer].hand.map((card) => {
            const canPlay = playableIds.has(card.id);
            const isSelected = selectedCard?.id === card.id;
            return (
              <button
                key={card.id}
                type="button"
                className={`hand-card${isSelected ? ' selected' : ''}`}
                disabled={!canPlay}
                onClick={() => {
                  if (canPlay) setSelectedCard(isSelected ? null : card);
                }}
              >
                <PlayingCard card={card} width={58} height={86} selected={isSelected} disabled={!canPlay} />
              </button>
            );
          })}
        </div>
      </section>

      {breakdown && (
        <div className="game-over">
          <h2>
            {breakdown.winner === 'draw'
              ? 'Remíza!'
              : `Vítěz: ${PLAYER_LABELS_CS[breakdown.winner as PlayerId]}`}
          </h2>
          <p>
            Hráč 1: {breakdown.breakdown.player1.total} bodů
            <br />
            (štychy {breakdown.breakdown.player1.trickPoints} + poslední{' '}
            {breakdown.breakdown.player1.lastTrickBonus} + hlášky{' '}
            {breakdown.breakdown.player1.meldPoints})
          </p>
          <p>
            Hráč 2: {breakdown.breakdown.player2.total} bodů
            <br />
            (štychy {breakdown.breakdown.player2.trickPoints} + poslední{' '}
            {breakdown.breakdown.player2.lastTrickBonus} + hlášky{' '}
            {breakdown.breakdown.player2.meldPoints})
          </p>
        </div>
      )}

      <p className="attribution">
        Karty:{' '}
        <a href={`${import.meta.env.BASE_URL}cards/ATTRIBUTION.md`} target="_blank" rel="noreferrer">
          Wikimedia Commons (CC BY-SA)
        </a>
      </p>
    </div>
  );
}
