#!/usr/bin/env python3
"""Make card PNGs transparent and extract suit icons for trump indicator."""

from __future__ import annotations

from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1] / "web" / "public"
CARDS = ROOT / "cards"
SUITS = ROOT / "suits"
BUNDLED_SUITS = Path(__file__).resolve().parents[1] / "web" / "src" / "assets" / "suits"

# Single pip crops on Bonaparte scans (file name + box).
SUIT_SOURCES = {
    "acorns": ("acorns-7.png", (76, 16, 124, 64)),
    "hearts": ("hearts-A.png", (32, 18, 84, 70)),
    "leaves": ("leaves-7.png", (84, 14, 120, 50)),
    "bells": ("bells-A.png", (28, 16, 80, 68)),
}

ICON_SIZE = 64
ICON_PADDING = 8


def is_paper_pixel(r: int, g: int, b: int, a: int = 255) -> bool:
    if a < 10:
        return True
    if r > 228 and g > 224 and b > 210:
        return True
    if r > 215 and g > 210 and b > 190 and max(r, g, b) - min(r, g, b) < 40:
        return True
    return False


def is_icon_background_pixel(r: int, g: int, b: int, a: int = 255) -> bool:
    if is_paper_pixel(r, g, b, a):
        return True
    # Card face black fill around suit pips.
    if r < 35 and g < 35 and b < 35:
        return True
    # Stray light border pixels on scans.
    if r > 200 and g > 200 and b > 185:
        return True
    return False


def remove_paper_background(im: Image.Image) -> Image.Image:
    rgba = im.convert("RGBA")
    pixels = rgba.load()
    w, h = rgba.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = pixels[x, y]
            if is_paper_pixel(r, g, b, a):
                pixels[x, y] = (r, g, b, 0)
    return rgba


def remove_icon_background(im: Image.Image) -> Image.Image:
    rgba = im.convert("RGBA")
    pixels = rgba.load()
    w, h = rgba.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = pixels[x, y]
            if is_icon_background_pixel(r, g, b, a):
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


def fit_icon_on_square(im: Image.Image, size: int = ICON_SIZE, padding: int = ICON_PADDING) -> Image.Image:
    content = size - padding * 2
    fitted = im.copy()
    fitted.thumbnail((content, content), Image.Resampling.LANCZOS)
    canvas = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    ox = (size - fitted.width) // 2
    oy = (size - fitted.height) // 2
    canvas.paste(fitted, (ox, oy), fitted)
    return canvas


def process_cards() -> None:
    for path in sorted(CARDS.glob("*.png")):
        if path.parent.name == "sprites":
            continue
        im = Image.open(path)
        out = trim_transparent(remove_paper_background(im), pad=1)
        out.save(path, optimize=True)
        print(f"Processed {path.name}")


def extract_suit_icons() -> None:
    SUITS.mkdir(parents=True, exist_ok=True)
    BUNDLED_SUITS.mkdir(parents=True, exist_ok=True)

    for suit, (file_name, box) in SUIT_SOURCES.items():
        src = CARDS / file_name
        crop = Image.open(src).crop(box)
        icon = trim_transparent(remove_icon_background(crop), pad=1)
        icon = fit_icon_on_square(icon)

        out = SUITS / f"{suit}.png"
        bundled = BUNDLED_SUITS / f"{suit}.png"
        icon.save(out, optimize=True)
        icon.save(bundled, optimize=True)
        print(f"Wrote {out}")


def main() -> None:
    extract_suit_icons()
    process_cards()
    print("Done.")


if __name__ == "__main__":
    main()
