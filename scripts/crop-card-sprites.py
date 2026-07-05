#!/usr/bin/env python3
"""Crop individual card PNGs from 4×2 suit sprite sheets.

Grid layout (per sheet):
  A   K   Q   J
  10  9   8   7

Place sheets as web/public/cards/sprites/{acorns,hearts,leaves,bells}.png
"""

from __future__ import annotations

import os
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1] / "web" / "public" / "cards"
SPRITE_DIR = ROOT / "sprites"

SUITS = ("acorns", "hearts", "leaves", "bells")
GRID = [
    ("A", 0, 0),
    ("K", 1, 0),
    ("Q", 2, 0),
    ("J", 3, 0),
    ("10", 0, 1),
    ("9", 1, 1),
    ("8", 2, 1),
    ("7", 3, 1),
]
COLS, ROWS = 4, 2


def crop_sheet(suit: str) -> None:
    path = SPRITE_DIR / f"{suit}.png"
    if not path.exists():
        raise FileNotFoundError(path)

    sheet = Image.open(path).convert("RGB")
    cell_w = sheet.width // COLS
    cell_h = sheet.height // ROWS

    for rank, col, row in GRID:
        box = (col * cell_w, row * cell_h, (col + 1) * cell_w, (row + 1) * cell_h)
        card = sheet.crop(box)
        out = ROOT / f"{suit}-{rank}.png"
        card.save(out, optimize=True, compress_level=9)
        print(f"Wrote {out.relative_to(ROOT.parents[2])}")


def main() -> None:
    for suit in SUITS:
        crop_sheet(suit)
    print("Done.")


if __name__ == "__main__":
    main()
