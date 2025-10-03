#!/usr/bin/env python3
import argparse
import math
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFont

# Raster-Parameter
COLS = 4
CELL_W = 320
CELL_H = 200
PADDING = 16
BORDER = 2
BORDER_COLOR = (32, 32, 32)

# Bild-Endungen
EXTS = {".png", ".jpg", ".jpeg", ".bmp", ".tif", ".tiff", ".webp"}


def list_images(folder: Path):
    return [p for p in sorted(folder.iterdir()) if p.suffix.lower() in EXTS and p.is_file()]


def average_color_ignore_black(img: Image.Image):
    """Mittelwert über RGB, exakt schwarze Pixel (0,0,0) ignorieren."""
    arr = np.asarray(img.convert("RGB"), dtype=np.uint8)
    mask = np.any(arr != 0, axis=2)
    if np.any(mask):
        sel = arr[mask]
        mean = sel.mean(axis=0)
    else:
        mean = arr.reshape(-1, 3).mean(axis=0)
    return tuple(int(round(x)) for x in mean)


def median_color_ignore_black(img: Image.Image):
    """Median über RGB, exakt schwarze Pixel (0,0,0) ignorieren."""
    arr = np.asarray(img.convert("RGB"), dtype=np.uint8)
    mask = np.any(arr != 0, axis=2)
    if np.any(mask):
        sel = arr[mask]
        med = np.median(sel, axis=0)
    else:
        med = np.median(arr.reshape(-1, 3), axis=0)
    return tuple(int(round(x)) for x in med)


def luminance(rgb):
    r, g, b = rgb
    return 0.2126 * r + 0.7152 * g + 0.0722 * b


def pick_text_color(bg_rgb):
    return (0, 0, 0) if luminance(bg_rgb) > 160 else (255, 255, 255)


def fit_text(draw: ImageDraw.ImageDraw, text: str, max_w: int, max_h: int, base_size=24, min_size=10):
    """Fontgröße suchen und bei Bedarf mittig trunkiert. Gibt (Font, Text) zurück."""
    candidates = [
        "DejaVuSans.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        "/Library/Fonts/Arial.ttf",
        "arial.ttf",
    ]
    font_path = None
    for c in candidates:
        try:
            if Path(c).exists():
                font_path = c
                break
        except Exception:
            pass

    def measure(fnt, s):
        bbox = draw.textbbox((0, 0), s, font=fnt)
        return bbox[2] - bbox[0], bbox[3] - bbox[1]

    for size in range(base_size, min_size - 1, -1):
        font = ImageFont.truetype(font_path, size) if font_path else ImageFont.load_default()
        txt = text
        while True:
            w, h = measure(font, txt)
            if w <= max_w and h <= max_h:
                return font, txt
            if len(txt) <= 4:
                break
            head = max(1, len(txt) // 2 - 8)
            tail = max(1, len(txt) - head - 1)
            txt = txt[:head] + "…" + txt[-tail:]
    font = ImageFont.truetype(font_path, min_size) if font_path else ImageFont.load_default()
    txt = text
    w, _ = measure(font, txt)
    while w > max_w and len(txt) > 4:
        head = max(1, len(txt) // 2 - 8)
        tail = max(1, len(txt) - head - 1)
        txt = txt[:head] + "…" + txt[-tail:]
        w, _ = measure(font, txt)
    return font, txt


def make_mosaic(in_dir: Path, out_dir: Path, stat: str, out_name="mosaic.png"):
    imgs = list_images(in_dir)
    if not imgs:
        raise SystemExit("Keine Eingabebilder gefunden.")

    rows = math.ceil(len(imgs) / COLS)
    W = COLS * CELL_W
    H = rows * CELL_H
    out = Image.new("RGB", (W, H), (0, 0, 0))
    draw = ImageDraw.Draw(out)

    for idx, p in enumerate(imgs):
        r = idx // COLS
        c = idx % COLS
        x0 = c * CELL_W
        y0 = r * CELL_H
        x1 = x0 + CELL_W
        y1 = y0 + CELL_H

        with Image.open(p) as im:
            if stat == "median":
                color = median_color_ignore_black(im)
            else:
                color = average_color_ignore_black(im)

        # Zelle
        draw.rectangle([x0, y0, x1 - 1, y1 - 1], fill=color)
        draw.rectangle([x0, y0, x1 - 1, y1 - 1], outline=BORDER_COLOR, width=BORDER)

        # Dateiname ohne Endung
        label = p.stem
        text_color = pick_text_color(color)
        max_w = CELL_W - 2 * PADDING
        max_h = CELL_H - 2 * PADDING
        font, txt = fit_text(draw, label, max_w, max_h)

        # Zentrieren
        bbox = draw.textbbox((0, 0), txt, font=font)
        tw = bbox[2] - bbox[0]
        th = bbox[3] - bbox[1]
        tx = x0 + (CELL_W - tw) // 2
        ty = y0 + (CELL_H - th) // 2

        # dünner Schatten
        shadow = (0, 0, 0) if text_color == (255, 255, 255) else (255, 255, 255)
        draw.text((tx + 1, ty + 1), txt, font=font, fill=shadow)
        draw.text((tx, ty), txt, font=font, fill=text_color)

    out_dir.mkdir(parents=True, exist_ok=True)
    out_path = out_dir / out_name
    out.save(out_path)
    print(f"Gespeichert: {out_path}")


def main():
    ap = argparse.ArgumentParser(description="Farbraster aus Bildfarben erstellen")
    ap.add_argument("eingabeordner", type=Path)
    ap.add_argument("ausgabeordner", type=Path)
    ap.add_argument(
        "--stat",
        choices=["mean", "median"],
        default="median",
        help="Farbstatistik: mean oder median. Standard ist median.",
    )
    args = ap.parse_args()

    if not args.eingabeordner.is_dir():
        raise SystemExit("Eingabeordner existiert nicht oder ist kein Ordner.")

    make_mosaic(args.eingabeordner, args.ausgabeordner, args.stat)


if __name__ == "__main__":
    main()
