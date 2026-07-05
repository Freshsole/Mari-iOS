# Lízaný Mariáš – česká karetní hra

Full-stack implementace tradiční české karetní hry – **Web**, iOS a Android.

```
shared/          # Herní engine (TypeScript) – sdílená logika
backend/         # REST + WebSocket API pro multiplayer
web/             # React web app – GitHub Pages
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

### Web (GitHub Pages)
```bash
cd web
npm install
npm run dev      # lokální vývoj
npm run build    # produkční build
```

**Live verze:** https://freshsole.github.io/Mari-iOS/

> Aktualizace se nasazují automaticky po každém pushi do `main`.

### Mobilní aplikace (iOS)
```bash
cd mobile
npm install
npm run ios
```

Pro Android: `npm run android`

## Herní režimy (web i mobil)

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
- **Web**: React 18, Vite, GitHub Pages
- **Backend**: Express + WebSocket
- **Mobile**: Expo 51, React Native, react-native-svg

## Licence

MIT
