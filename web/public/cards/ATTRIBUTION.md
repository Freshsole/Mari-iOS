# Attribution – playing card images

Card artwork: **Bonaparte Bohemian pattern** (jednohlavé Mariášky), Plzeň, Czech Republic.

Each card is a separate PNG in `web/public/cards/` (32 cards + back). The four suit sprite sheets in `sprites/` are assembled from the same scans for reference.

| Our suit | Czech name | WWPCM code |
|----------|------------|------------|
| acorns (Žaludy) | žaludy | `c` |
| hearts (Červené) | srdce | `h` |
| bells (Kule) | kule | `d` |
| leaves (Zelené) | zelené | `s` |

Source scans: [WWPCM00022 Bonaparte Bohemian pattern I](http://a.trionfi.eu/WWPCM/decks/d00022/d00022.htm) (World of Playing Cards / Trionfi archive).

Card back: reverse scan from the same deck (`d00022r001.jpg`).

To use your own 4×2 sprite sheets instead, place `acorns.png`, `hearts.png`, `leaves.png`, `bells.png` in `sprites/` and run:

```bash
python3 scripts/crop-card-sprites.py
```

That regenerates the individual `{suit}-{rank}.png` files (grid: A K Q J / 10 9 8 7).
