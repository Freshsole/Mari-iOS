#!/usr/bin/env python3
"""Make card PNGs transparent and extract suit icons for trump indicator."""

from __future__ import annotations

import os
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1] / "web" / "public"
CARDS = ROOT / "cards"
SUITS = ROOT / "suits"

# Crop boxes on 200x~330 Bonaparte scans (top pip / emblem area per suit).
SUIT_CROPS = {
    "acorns": (76, 16, 124, 64),
    "hearts": (20, 50, 60, 90),
    "leaves": (18, 48, 62, 92),
    "bells": (18, 48, 62, 92),
}


def is_background_pixel(r: int, g: int, b: int, a: int = 255) -> bool:
    if a < 10:
        return True
    # Card scan cream / paper and near-white margins.
    if r > 228 and g > 224 and b > 210:
        return True
    # Very light warm paper inside face.
    if r > 215 and g > 210 and b > 190 and max(r, g, b) - min(r, g, b) < 40:
        return True
    return False


def remove_background(im: Image.Image) -> Image.Image:
    rgba = im.convert("RGBA")
    pixels = rgba.load()
    w, h = rgba.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = pixels[x, y]
            if is_background_pixel(r, g, b, a):
                pixels[x, y] = (r, g, b, 0)
    return rgba


def trim_transparent(im: Image.Image, pad: int = 2) -> Image.Image:
    bbox = im.getbbox()
    if not bbox:
        return im
    left, top, right, bottom = bbox
    left = max(0, left - pad)
    top = max(0, top - pad)
    right = min(im.width, right + pad)
    bottom = min(im.height, bottom + pad)
    return im.crop((left, top, right, bottom))


def process_cards() -> None:
    for path in sorted(CARDS.glob("*.png")):
        if path.parent.name == "sprites":
            continue
        im = Image.open(path)
        out = trim_transparent(remove_background(im), pad=1)
        out.save(path, optimize=True)
        print(f"Processed {path.name}")


def extract_suit_icons() -> None:
    SUITS.mkdir(parents=True, exist_ok=True)
    for suit, box in SUIT_CROPS.items():
        src = CARDS / f"{suit}-7.png"
        im = Image.open(src)
        crop = im.crop(box)
        icon = trim_transparent(remove_background(crop), pad=1)
        icon = icon.resize((56, 56), Image.Resampling.LANCZOS)
        out = SUITS / f"{suit}.png"
        icon.save(out, optimize=True)
        # Also keep bundled copies for Vite imports.
        bundled = Path(__file__).resolve().parents[1] / "web" / "src" / "assets" / "suits" / f"{suit}.png"
        bundled.parent.mkdir(parents=True, exist_ok=True)
        icon.save(bundled, optimize=True)
        print(f"Wrote {out}")


def main() -> None:
    extract_suit_icons()
    process_cards()
    print("Done.")


if __name__ == "__main__":
    main()
