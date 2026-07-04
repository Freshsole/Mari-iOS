# API Documentation

## REST Endpoints

### POST /api/games
Create a new game. Returns `{ gameId, state }`.

### GET /api/games/:id
Get current game state.

### POST /api/games/:id/lead
Body: `{ player, card, declareMeld? }`

### POST /api/games/:id/follow
Body: `{ player, card }`

### POST /api/games/:id/swap-trump-seven
Body: `{ player }`

### GET /api/games/:id/playable/:player
Returns playable cards and meld options.

## WebSocket
Connect: `ws://host?gameId=...&player=player1|player2`
Messages: `{ type: 'state', state: GameState }`
