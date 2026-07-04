import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { v4 as uuidv4 } from 'uuid';
import {
  GameState,
  PlayerId,
  createNewGame,
  getActivePlayer,
  getMeldOptions,
  getPlayableCards,
  playFollow,
  playLead,
  swapTrumpSeven,
} from '../../shared/src';

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

app.use(cors());
app.use(express.json());

interface GameRoom {
  id: string;
  state: GameState;
  connections: Map<PlayerId, import('ws').WebSocket>;
}

const rooms = new Map<string, GameRoom>();

function broadcast(room: GameRoom): void {
  const payload = JSON.stringify({ type: 'state', state: room.state });
  for (const ws of room.connections.values()) {
    if (ws.readyState === ws.OPEN) {
      ws.send(payload);
    }
  }
}

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', game: 'Lízaný Mariáš' });
});

app.post('/api/games', (_req, res) => {
  const id = uuidv4();
  const state = createNewGame('player2');
  rooms.set(id, { id, state, connections: new Map() });
  res.json({ gameId: id, state });
});

app.get('/api/games/:id', (req, res) => {
  const room = rooms.get(req.params.id);
  if (!room) {
    res.status(404).json({ error: 'Hra nenalezena' });
    return;
  }
  res.json({ state: room.state });
});

app.post('/api/games/:id/lead', (req, res) => {
  const room = rooms.get(req.params.id);
  if (!room) {
    res.status(404).json({ error: 'Hra nenalezena' });
    return;
  }
  try {
    const { player, card, declareMeld } = req.body;
    room.state = playLead(room.state, { player, card, declareMeld });
    broadcast(room);
    res.json({ state: room.state });
  } catch (e) {
    res.status(400).json({ error: (e as Error).message });
  }
});

app.post('/api/games/:id/follow', (req, res) => {
  const room = rooms.get(req.params.id);
  if (!room) {
    res.status(404).json({ error: 'Hra nenalezena' });
    return;
  }
  try {
    const { player, card } = req.body;
    room.state = playFollow(room.state, { player, card });
    broadcast(room);
    res.json({ state: room.state });
  } catch (e) {
    res.status(400).json({ error: (e as Error).message });
  }
});

app.post('/api/games/:id/swap-trump-seven', (req, res) => {
  const room = rooms.get(req.params.id);
  if (!room) {
    res.status(404).json({ error: 'Hra nenalezena' });
    return;
  }
  try {
    const { player } = req.body;
    room.state = swapTrumpSeven(room.state, player);
    broadcast(room);
    res.json({ state: room.state });
  } catch (e) {
    res.status(400).json({ error: (e as Error).message });
  }
});

app.get('/api/games/:id/playable/:player', (req, res) => {
  const room = rooms.get(req.params.id);
  if (!room) {
    res.status(404).json({ error: 'Hra nenalezena' });
    return;
  }
  const player = req.params.player as PlayerId;
  res.json({
    cards: getPlayableCards(room.state, player),
    melds: getMeldOptions(room.state, player),
    activePlayer: getActivePlayer(room.state),
  });
});

wss.on('connection', (ws, req) => {
  const url = new URL(req.url ?? '', 'http://localhost');
  const gameId = url.searchParams.get('gameId');
  const player = url.searchParams.get('player') as PlayerId | null;

  if (!gameId || !player || !rooms.has(gameId)) {
    ws.close();
    return;
  }

  const room = rooms.get(gameId)!;
  room.connections.set(player, ws);
  ws.send(JSON.stringify({ type: 'state', state: room.state }));

  ws.on('close', () => {
    room.connections.delete(player);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Mariáš server běží na portu ${PORT}`);
});
