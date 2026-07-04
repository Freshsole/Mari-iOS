# 🎴 Lízaný Mariáš - Czech Card Game

Full-stack implementation of the traditional Czech card game playable on **Web, iOS, and Android**.

## 📋 Game Overview

**Lízaný Mariáš** is a 2-player trick-taking card game using a 32-card German-suited deck (7-Ace in each suit).

### Card Rankings (Highest to Lowest)
- Ace (A) = 10 points
- Ten (10) = 10 points  
- King (K) = 0 points
- Queen (Q) = 0 points
- Jack (J) = 0 points
- 9, 8, 7 = 0 points

### Game Phases

#### Phase 1: Draw Phase (Talón Active)
- Players can play **ANY card** (no suit obligation)
- **No obligation to overtrump**
- After each trick: winner draws first, then loser
- Each player maintains 8 cards in hand

#### Phase 2: Close Game (Talón Exhausted)
Strict rules activate:
1. **MUST follow suit** if able
2. Can underplay (no obligation to beat)
3. **MUST play Trump** if no suited card
4. Only discard if no suit or trump

### Scoring System

- **Aces & Tens won**: 10 points each
- **Last trick bonus**: +10 points
- **Melds (K+Q same suit)**: 
  - Regular suit: 20 points
  - Trump suit: 40 points
- **Total available**: 90 points

## 🏗️ Project Structure

```
Mari-iOS/
├── backend/                 # Node.js/Express server
│   ├── src/
│   │   ├── game/           # Game state machine
│   │   ├── rules/          # Card validation & scoring
│   │   ├── routes/         # REST API
│   │   └── ws/             # WebSocket handlers
│   └── package.json
│
├── web/                     # React web app
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   └── services/       # API services
│   └── package.json
│
├── mobile/                  # React Native (iOS/Android)
│   ├── src/
│   │   ├── screens/
│   │   └── components/
│   └── package.json
│
└── docs/
    ├── RULES.md            # Detailed rules
    └── API.md              # API documentation
```

## 🚀 Quick Start

### Backend
```bash
cd backend
npm install
npm run dev
# Server runs on http://localhost:5000
```

### Web
```bash
cd web
npm install
npm run dev
# Opens http://localhost:5173
```

### Mobile
```bash
cd mobile
npm install
npm run ios    # For iOS
npm run android # For Android
```

## ✨ Features

- ✅ Full game state management with strict validation
- ✅ Real-time multiplayer (WebSockets)
- ✅ Phase 1 & Phase 2 rule enforcement
- ✅ Meld detection and scoring
- ✅ Czech language UI
- ✅ Cross-platform (Web, iOS, Android)
- ✅ Game history & statistics
- ✅ Responsive design

## 🎮 How to Play

1. **Create Game** - Click "Nová hra" to start
2. **Get Dealt** - Each player receives 8 cards
3. **Play Tricks** - Lead card, then follow card
4. **Phase 1** - Draw from deck after each trick
5. **Phase 2** - Stricter rules apply (after deck empty)
6. **Score** - Count tricks won + melds + last trick bonus

## 🔧 Technical Stack

- **Backend**: Express.js + TypeScript + WebSockets
- **Web Frontend**: React 18 + TypeScript + Vite
- **Mobile**: React Native + TypeScript
- **Database**: (Optional) PostgreSQL for game history

## 📝 Game Rules Implementation

### State Machine
```
Setup → Phase1 (Loop) → Phase2 (Loop) → EndGame Scoring
```

### Validation Engine
```typescript
isValidMove(leadCard, responseCard, hand, trumpSuit, isPhase2)
```

Ensures:
- Phase 1: Any card valid
- Phase 2: Suit → Trump → Discard hierarchy

## 👥 Contributing

This is a complete game implementation. Feel free to add features like:
- AI opponent
- Game replay functionality
- Statistics tracking
- Tournaments mode

## 📄 License

MIT
