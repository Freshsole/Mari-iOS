# Lízaný Mariáš – česká karetní hra

Mobilní iOS hra (React Native / Expo) s kompletní herní logikou podle pravidel **Lízaného Mariáše** – 32 karet v německých barvách (Prší styl).

## Struktura projektu

```
shared/          # Herní engine (TypeScript) – sdílená logika
backend/         # REST + WebSocket API pro multiplayer
mobile/          # React Native (Expo) – iOS / Android
docs/            # Pravidla a API dokumentace
```

## Rychlý start

### Herní engine (testy)
```bash
cd shared
npm install
npm test
```

### Backend server
```bash
cd backend
npm install
npm run dev
# http://localhost:5000
```

### Mobilní aplikace (iOS)
```bash
cd mobile
npm install
npm run ios
```

Pro Android: `npm run android`

## Herní režimy v mobilní aplikaci

- **Na přeskáčku** – dva hráči na jednom zařízení
- **Proti AI** – hra proti počítači

## Implementované funkce

- Přesná sekvence rozdání (4+4, trumf, 4+4, talón 15 karet)
- Fáze 1: libovolná karta, lízání z talónu (vítěz → poražený)
- Fáze 2: ctít barvu, trumf, discard + povolené podbití
- Výměna sedmy trumfu s viditelným trumfem
- Hlášky K+Q (20 / 40 bodů) při vedení štychu
- Bodování: esa + desítky + bonus posledního štychu + hlášky = 90 bodů
- České UI a německé barvy karet (Červené, Zelené, Žaludy, Kule)

## State machine

```
Setup → Phase1 (štych + lízání) → Phase2 (uzavřená hra) → EndGame
```

## Technologie

- **Engine**: TypeScript, Jest
- **Backend**: Express + WebSocket
- **Mobile**: Expo 51, React Native, react-native-svg

## Licence

MIT
