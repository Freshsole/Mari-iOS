import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  Card,
  GamePhase,
  GameState,
  PLAYER_LABELS_CS,
  PlayerId,
  SUIT_LABELS_CS,
  buildScoreBreakdown,
} from '../../../shared/src';
import { getActivePlayer, getMeldOptions, getPlayableCards } from '../../../shared/src/gameEngine';
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
  const meldSuits = isMyTurn && state.trickStep === 'lead'
    ? getMeldOptions(state, viewingPlayer)
    : [];
  const opponent: PlayerId = viewingPlayer === 'player1' ? 'player2' : 'player1';

  const [selectedCard, setSelectedCard] = React.useState<Card | null>(null);
  const canMeld =
    selectedCard &&
    (selectedCard.rank === 'K' || selectedCard.rank === 'Q') &&
    meldSuits.includes(selectedCard.suit);

  const handleConfirm = (declareMeld = false) => {
    if (!selectedCard) return;
    onPlayCard(selectedCard, declareMeld);
    setSelectedCard(null);
  };

  const breakdown =
    state.phase === 'game_over' ? buildScoreBreakdown(state) : null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Lízaný Mariáš</Text>
        <Text style={styles.phase}>{phaseLabel(state.phase)}</Text>
        {state.trumpSuit && (
          <Text style={styles.trump}>
            Trumf: {SUIT_LABELS_CS[state.trumpSuit]}
            {state.trumpCard ? ` (${state.trumpCard.rank})` : ''}
          </Text>
        )}
        <Text style={styles.message}>{state.lastActionMessage}</Text>
      </View>

      <View style={styles.opponentArea}>
        <Text style={styles.playerLabel}>
          {PLAYER_LABELS_CS[opponent]} • {state.players[opponent].hand.length} karet
        </Text>
        <View style={styles.opponentCards}>
          {state.players[opponent].hand.map((_, i) => (
            <View key={`opp-${i}`} style={{ marginLeft: i > 0 ? -40 : 0 }}>
              <PlayingCard
                card={{ id: `hidden-${i}`, suit: 'hearts', rank: '7' }}
                faceDown
                width={52}
                height={78}
              />
            </View>
          ))}
        </View>
      </View>

      <View style={styles.table}>
        <View style={styles.talonArea}>
          <Text style={styles.talonLabel}>Talón: {state.talon.length}</Text>
          {state.trumpCard && (
            <View style={styles.trumpStack}>
              {state.talon.length > 0 && (
                <View style={styles.talonStack}>
                  <PlayingCard card={state.talon[0]} width={52} height={78} faceDown />
                </View>
              )}
              <View style={styles.trumpVisible}>
                <PlayingCard card={state.trumpCard} width={52} height={78} />
                <Text style={styles.trumpNote}>Viditelný trumf</Text>
              </View>
            </View>
          )}
        </View>

        <View style={styles.trickArea}>
          {state.currentTrick.lead && (
            <View style={styles.trickCard}>
              <Text style={styles.trickLabel}>{PLAYER_LABELS_CS[state.currentTrick.lead.player]}</Text>
              <PlayingCard card={state.currentTrick.lead.card} width={58} height={86} />
              {state.currentTrick.pendingMeld && (
                <Text style={styles.meldAnnounce}>
                  {state.currentTrick.pendingMeld.points === 40 ? 'Čtyřicet!' : 'Dvacet!'}
                </Text>
              )}
            </View>
          )}
          {state.currentTrick.follow && (
            <View style={styles.trickCard}>
              <Text style={styles.trickLabel}>{PLAYER_LABELS_CS[state.currentTrick.follow.player]}</Text>
              <PlayingCard card={state.currentTrick.follow.card} width={58} height={86} />
            </View>
          )}
        </View>

        <View style={styles.scorePanel}>
          <Text style={styles.scoreText}>
            Hlášky P1: {state.players.player1.meldPoints} | P2: {state.players.player2.meldPoints}
          </Text>
          <Text style={styles.scoreText}>Štych {state.trickNumber} / 16</Text>
          {active && state.phase !== 'game_over' && (
            <Text style={styles.turnText}>Na tahu: {PLAYER_LABELS_CS[active]}</Text>
          )}
        </View>
      </View>

      {state.sevenSwapAvailable === viewingPlayer && (
        <View style={styles.swapBar}>
          <Text style={styles.swapText}>Máte sedmu trumfu – vyměnit s talónem?</Text>
          <View style={styles.swapButtons}>
            <Pressable style={styles.btnPrimary} onPress={onSwapSeven}>
              <Text style={styles.btnText}>Vyměnit 7</Text>
            </Pressable>
            <Pressable style={styles.btnSecondary} onPress={onSkipSwap}>
              <Text style={styles.btnTextDark}>Ne</Text>
            </Pressable>
          </View>
        </View>
      )}

      {isMyTurn && selectedCard && (
        <View style={styles.actionBar}>
          <Pressable style={styles.btnPrimary} onPress={() => handleConfirm(false)}>
            <Text style={styles.btnText}>Hrát {selectedCard.rank}</Text>
          </Pressable>
          {canMeld && (
            <Pressable style={styles.btnMeld} onPress={() => handleConfirm(true)}>
              <Text style={styles.btnText}>
                Hlásit {selectedCard.suit === state.trumpSuit ? '40' : '20'}
              </Text>
            </Pressable>
          )}
        </View>
      )}

      <View style={styles.handArea}>
        <Text style={styles.playerLabel}>{PLAYER_LABELS_CS[viewingPlayer]} – vaše karty</Text>
        <View style={styles.hand}>
          {state.players[viewingPlayer].hand.map((card) => {
            const canPlay = playableIds.has(card.id);
            const isSelected = selectedCard?.id === card.id;
            return (
              <Pressable
                key={card.id}
                onPress={() => {
                  if (canPlay) setSelectedCard(isSelected ? null : card);
                }}
                style={[styles.handCard, isSelected && styles.handCardSelected]}
              >
                <PlayingCard
                  card={card}
                  width={58}
                  height={86}
                  selected={isSelected}
                  disabled={!canPlay}
                />
              </Pressable>
            );
          })}
        </View>
      </View>

      {breakdown && (
        <View style={styles.gameOver}>
          <Text style={styles.gameOverTitle}>
            {breakdown.winner === 'draw'
              ? 'Remíza!'
              : `Vítěz: ${PLAYER_LABELS_CS[breakdown.winner as PlayerId]}`}
          </Text>
          <Text style={styles.gameOverScore}>
            Hráč 1: {breakdown.breakdown.player1.total} bodů
            {'\n'}(štychy {breakdown.breakdown.player1.trickPoints} + poslední{' '}
            {breakdown.breakdown.player1.lastTrickBonus} + hlášky{' '}
            {breakdown.breakdown.player1.meldPoints})
          </Text>
          <Text style={styles.gameOverScore}>
            Hráč 2: {breakdown.breakdown.player2.total} bodů
            {'\n'}(štychy {breakdown.breakdown.player2.trickPoints} + poslední{' '}
            {breakdown.breakdown.player2.lastTrickBonus} + hlášky{' '}
            {breakdown.breakdown.player2.meldPoints})
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2E7D32',
    padding: 12,
  },
  header: {
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderRadius: 12,
    padding: 10,
    marginBottom: 8,
  },
  title: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
  },
  phase: {
    color: '#C8E6C9',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 4,
  },
  trump: {
    color: '#FFEB3B',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 2,
  },
  message: {
    color: '#E8F5E9',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
  },
  opponentArea: {
    alignItems: 'center',
    marginBottom: 8,
  },
  opponentCards: {
    flexDirection: 'row',
    marginTop: 4,
  },
  table: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    minHeight: 120,
    marginBottom: 8,
  },
  talonArea: {
    alignItems: 'center',
    width: 90,
  },
  talonLabel: {
    color: '#FFF',
    fontSize: 11,
    marginBottom: 4,
  },
  talonStack: {
    position: 'absolute',
    top: 0,
    left: 8,
  },
  trumpStack: {
    height: 100,
    width: 80,
  },
  trumpVisible: {
    marginTop: 20,
    alignItems: 'center',
  },
  trumpNote: {
    color: '#FFEB3B',
    fontSize: 9,
    marginTop: 2,
  },
  trickArea: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    alignItems: 'center',
  },
  trickCard: {
    alignItems: 'center',
  },
  trickLabel: {
    color: '#FFF',
    fontSize: 10,
    marginBottom: 4,
  },
  meldAnnounce: {
    color: '#FFEB3B',
    fontWeight: '700',
    fontSize: 14,
    marginTop: 4,
  },
  scorePanel: {
    width: 110,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 8,
    padding: 6,
  },
  scoreText: {
    color: '#E8F5E9',
    fontSize: 10,
    marginBottom: 2,
  },
  turnText: {
    color: '#FFEB3B',
    fontWeight: '700',
    fontSize: 11,
    marginTop: 4,
  },
  swapBar: {
    backgroundColor: '#1565C0',
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
  },
  swapText: {
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  swapButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  actionBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 8,
  },
  btnPrimary: {
    backgroundColor: '#FF8F00',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  btnMeld: {
    backgroundColor: '#6A1B9A',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  btnSecondary: {
    backgroundColor: '#ECEFF1',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  btnText: {
    color: '#FFF',
    fontWeight: '700',
  },
  btnTextDark: {
    color: '#37474F',
    fontWeight: '700',
  },
  handArea: {
    flex: 1,
  },
  playerLabel: {
    color: '#FFF',
    fontSize: 13,
    marginBottom: 6,
    textAlign: 'center',
  },
  hand: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 6,
  },
  handCard: {
    borderRadius: 8,
  },
  handCardSelected: {
    transform: [{ translateY: -8 }],
  },
  gameOver: {
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: 12,
    padding: 14,
    marginTop: 8,
  },
  gameOverTitle: {
    color: '#FFEB3B',
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  gameOverScore: {
    color: '#FFF',
    fontSize: 13,
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
});
