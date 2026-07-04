import { useEffect, useMemo, useState } from 'react';
import { createNewGame, GameState, PlayerId } from '@shared/index';
import { getActivePlayer } from '@shared/gameEngine';
import { GameBoard } from './components/GameBoard';
import { createGameActions, GameMode } from './hooks/gameActions';

export default function App() {
  const [state, setState] = useState<GameState>(() => createNewGame('player2'));
  const [mode, setMode] = useState<GameMode>('hotseat');
  const [viewingPlayer, setViewingPlayer] = useState<PlayerId>('player1');

  const actions = useMemo(() => createGameActions(setState, mode, 'player1'), [mode]);

  const active = getActivePlayer(state);

  useEffect(() => {
    if (mode === 'hotseat' && active && active !== viewingPlayer && state.phase !== 'game_over') {
      setViewingPlayer(active);
    }
  }, [active, mode, state.phase, viewingPlayer]);

  return (
    <div className="app">
      <nav className="menu-bar">
        <button
          type="button"
          className={`menu-btn${mode === 'hotseat' ? ' active' : ''}`}
          onClick={() => setMode('hotseat')}
        >
          Na přeskáčku
        </button>
        <button
          type="button"
          className={`menu-btn${mode === 'vsAi' ? ' active' : ''}`}
          onClick={() => {
            setMode('vsAi');
            setViewingPlayer('player1');
          }}
        >
          Proti AI
        </button>
        <button type="button" className="menu-btn-new" onClick={actions.newGame}>
          Nová hra
        </button>
      </nav>

      {mode === 'hotseat' && (
        <div className="switch-bar">
          <span>Zobrazení:</span>
          <button
            type="button"
            className={`switch-btn${viewingPlayer === 'player1' ? ' active' : ''}`}
            onClick={() => setViewingPlayer('player1')}
          >
            Hráč 1
          </button>
          <button
            type="button"
            className={`switch-btn${viewingPlayer === 'player2' ? ' active' : ''}`}
            onClick={() => setViewingPlayer('player2')}
          >
            Hráč 2
          </button>
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
