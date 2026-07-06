import { useEffect, useMemo, useState } from 'react';
import { createNewGame, GameState, PlayerId } from '@shared/index';
import { getActivePlayer } from '@shared/gameEngine';
import { GameBoard } from './components/GameBoard';
import { TrumpIndicator } from './components/TrumpIndicator';
import { createGameActions, GameMode } from './hooks/gameActions';

export default function App() {
  const [state, setState] = useState<GameState>(() => createNewGame('player2'));
  const [mode, setMode] = useState<GameMode>('vsAi');
  const [viewingPlayer, setViewingPlayer] = useState<PlayerId>('player1');
  const [menuOpen, setMenuOpen] = useState(false);

  const actions = useMemo(() => createGameActions(setState, mode, 'player1'), [mode]);

  const active = getActivePlayer(state);

  useEffect(() => {
    if (mode === 'hotseat' && active && active !== viewingPlayer && state.phase !== 'game_over') {
      setViewingPlayer(active);
    }
  }, [active, mode, state.phase, viewingPlayer]);

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header__start">
          <button type="button" className="icon-btn" onClick={() => setMenuOpen((v) => !v)} aria-label="Menu">
            ☰
          </button>
          {state.trumpSuit && <TrumpIndicator suit={state.trumpSuit} />}
        </div>
        <h1>Lízaný Mariáš</h1>
        <button type="button" className="icon-btn icon-btn--accent" onClick={actions.newGame} aria-label="Nová hra">
          ↻
        </button>
      </header>

      {menuOpen && (
        <div className="menu-sheet">
          <button
            type="button"
            className={`menu-option${mode === 'vsAi' ? ' active' : ''}`}
            onClick={() => {
              setMode('vsAi');
              setViewingPlayer('player1');
              setMenuOpen(false);
            }}
          >
            Proti AI
          </button>
          <button
            type="button"
            className={`menu-option${mode === 'hotseat' ? ' active' : ''}`}
            onClick={() => {
              setMode('hotseat');
              setMenuOpen(false);
            }}
          >
            Na přeskáčku
          </button>
          {mode === 'hotseat' && (
            <div className="menu-sub">
              <button
                type="button"
                className={`menu-option${viewingPlayer === 'player1' ? ' active' : ''}`}
                onClick={() => setViewingPlayer('player1')}
              >
                Hráč 1
              </button>
              <button
                type="button"
                className={`menu-option${viewingPlayer === 'player2' ? ' active' : ''}`}
                onClick={() => setViewingPlayer('player2')}
              >
                Hráč 2
              </button>
            </div>
          )}
        </div>
      )}

      <GameBoard
        state={state}
        viewingPlayer={mode === 'vsAi' ? 'player1' : viewingPlayer}
        onPlayCard={actions.playCard}
        onSwapSeven={actions.swapSeven}
        onSkipSwap={actions.skipSwap}
      />
    </div>
  );
}
