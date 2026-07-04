import { createNewGame, getActivePlayer, getPlayableCards, playFollow, playLead } from './gameEngine';

describe('Full game simulation', () => {
  it('plays until game over with 16 tricks', () => {
    let state = createNewGame();
    let safety = 0;

    while (state.phase !== 'game_over' && safety < 200) {
      safety += 1;
      const active = getActivePlayer(state);
      if (!active) continue;

      const cards = getPlayableCards(state, active);
      if (cards.length === 0) break;

      const card = cards[0];
      if (state.trickStep === 'lead') {
        state = playLead(state, { player: active, card });
      } else {
        state = playFollow(state, { player: active, card });
      }
    }

    expect(state.phase).toBe('game_over');
    expect(state.completedTricks).toHaveLength(16);
    expect(state.scores).not.toBeNull();
    const total =
      (state.scores!.player1 + state.scores!.player2);
    expect(total).toBe(90);
  });
});
