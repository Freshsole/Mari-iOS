import { createCard, determineTrickWinner, resetCardCounter } from './deck';

describe('determineTrickWinner (phase 1 open play)', () => {
  beforeEach(() => resetCardCounter());

  const trump = 'hearts' as const;

  it('higher card wins within the led suit', () => {
    const lead = createCard('leaves', '10');
    const follow = createCard('leaves', 'K');
    expect(determineTrickWinner(lead, follow, trump)).toBe('lead');
  });

  it('lower card loses within the led suit', () => {
    const lead = createCard('leaves', '7');
    const follow = createCard('leaves', 'A');
    expect(determineTrickWinner(lead, follow, trump)).toBe('follow');
  });

  it('any trump beats a non-trump off-suit card', () => {
    const lead = createCard('leaves', '10');
    const follow = createCard('hearts', '7');
    expect(determineTrickWinner(lead, follow, trump)).toBe('follow');
  });

  it('non-trump off-suit does not beat the lead', () => {
    const lead = createCard('leaves', '10');
    const follow = createCard('bells', 'A');
    expect(determineTrickWinner(lead, follow, trump)).toBe('lead');
  });

  it('higher trump beats lower trump', () => {
    const lead = createCard('hearts', '10');
    const follow = createCard('hearts', '7');
    expect(determineTrickWinner(lead, follow, trump)).toBe('lead');
  });

  it('lower trump loses to higher trump', () => {
    const lead = createCard('hearts', '7');
    const follow = createCard('hearts', 'A');
    expect(determineTrickWinner(lead, follow, trump)).toBe('follow');
  });
});
