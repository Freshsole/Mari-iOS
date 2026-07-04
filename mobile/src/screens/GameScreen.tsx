import React, { useMemo, useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { createNewGame, GameState, PlayerId } from '../../../shared/src';
import { getActivePlayer } from '../../../shared/src/gameEngine';
import { GameBoard } from '../components/GameBoard';
import { createGameActions, GameMode } from '../hooks/gameActions';

export function GameScreen() {
  const [state, setState] = useState<GameState>(() => createNewGame('player2'));
  const [mode, setMode] = useState<GameMode>('hotseat');
  const [viewingPlayer, setViewingPlayer] = useState<PlayerId>('player1');

  const actions = useMemo(
    () => createGameActions(setState, mode, 'player1'),
    [mode],
  );

  const active = getActivePlayer(state);

  React.useEffect(() => {
    if (mode === 'hotseat' && active && active !== viewingPlayer && state.phase !== 'game_over') {
      setViewingPlayer(active);
    }
  }, [active, mode, state.phase, viewingPlayer]);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.menuBar}>
          <Pressable
            style={[styles.menuBtn, mode === 'hotseat' && styles.menuBtnActive]}
            onPress={() => setMode('hotseat')}
          >
            <Text style={styles.menuText}>Na přeskáčku</Text>
          </Pressable>
          <Pressable
            style={[styles.menuBtn, mode === 'vsAi' && styles.menuBtnActive]}
            onPress={() => {
              setMode('vsAi');
              setViewingPlayer('player1');
            }}
          >
            <Text style={styles.menuText}>Proti AI</Text>
          </Pressable>
          <Pressable style={styles.menuBtnNew} onPress={actions.newGame}>
            <Text style={styles.menuText}>Nová hra</Text>
          </Pressable>
        </View>

        {mode === 'hotseat' && (
          <View style={styles.switchBar}>
            <Text style={styles.switchLabel}>Zobrazení:</Text>
            <Pressable
              style={[styles.switchBtn, viewingPlayer === 'player1' && styles.switchActive]}
              onPress={() => setViewingPlayer('player1')}
            >
              <Text style={styles.switchText}>Hráč 1</Text>
            </Pressable>
            <Pressable
              style={[styles.switchBtn, viewingPlayer === 'player2' && styles.switchActive]}
              onPress={() => setViewingPlayer('player2')}
            >
              <Text style={styles.switchText}>Hráč 2</Text>
            </Pressable>
          </View>
        )}

        <GameBoard
          state={state}
          viewingPlayer={mode === 'vsAi' ? 'player1' : viewingPlayer}
          onPlayCard={actions.playCard}
          onSwapSeven={actions.swapSeven}
          onSkipSwap={actions.skipSwap}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#1B5E20',
  },
  scroll: {
    flexGrow: 1,
  },
  menuBar: {
    flexDirection: 'row',
    padding: 8,
    gap: 8,
    backgroundColor: '#1B5E20',
  },
  menuBtn: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  menuBtnActive: {
    backgroundColor: '#FF8F00',
  },
  menuBtnNew: {
    backgroundColor: '#1565C0',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    justifyContent: 'center',
  },
  menuText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 12,
  },
  switchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingBottom: 4,
  },
  switchLabel: {
    color: '#C8E6C9',
    fontSize: 12,
  },
  switchBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  switchActive: {
    backgroundColor: '#FFD54F',
  },
  switchText: {
    color: '#1B5E20',
    fontWeight: '700',
    fontSize: 12,
  },
});
