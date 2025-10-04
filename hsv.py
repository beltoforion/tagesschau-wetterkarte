#!/usr/bin/env python3
import argparse
from pathlib import Path
from typing import Tuple
from PIL import Image, ImageDraw, ImageFont


def _cover_center(img: Image.Image, target_wh: Tuple[int, int]) -> Image.Image:
    tw, th = target_wh
    iw, ih = img.size
    if iw * th >= tw * ih:
        scale = th / ih
        nw = max(1, int(round(iw * scale)))
        img = img.resize((nw, th), Image.Resampling.LANCZOS)
        left = max(0, (nw - tw) // 2)
        return img.crop((left, 0, left + tw, th))
    else:
        scale = tw / iw
        nh = max(1, int(round(ih * scale)))
        img = img.resize((tw, nh), Image.Resampling.LANCZOS)
        top = max(0, (nh - th) // 2)
        return img.crop((0, top, tw, top + th))


def _load_font(px: int) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    for name in ("DejaVuSans.ttf", "Arial.ttf", "LiberationSans-Regular.ttf"):
        try:
            return ImageFont.truetype(name, px)
        except Exception:
            continue
    return ImageFont.load_default()


def _label_chip(
    draw: ImageDraw.ImageDraw,
    box: Tuple[int, int, int, int],
    text: str,
    align_left: bool,
    font_px: int,
):
    x0, y0, x1, y1 = box
    font = _load_font(font_px)

    # Measure text and capture bearings so we can center accurately.
    try:
        tb = draw.textbbox((0, 0), text, font=font)
    except Exception:
        # Fallback for very old Pillow
        w, h = draw.textsize(text, font=font)
        tb = (0, 0, w, h)
    tw, th = tb[2] - tb[0], tb[3] - tb[1]
    left_bearing, top_bearing = tb[0], tb[1]

    # Tight chip: inner padding and small corner radius
    inner_pad = max(3, int(font_px * 0.22))
    outer_margin = max(3, int(font_px * 0.18))
    radius = max(4, int(font_px * 0.18))

    chip_w = tw + 2 * inner_pad
    chip_h = th + 2 * inner_pad

    if align_left:
        bx0 = x0 + outer_margin
        by1 = y1 - outer_margin
        bx1 = bx0 + chip_w
        by0 = by1 - chip_h
    else:
        bx1 = x1 - outer_margin
        by1 = y1 - outer_margin
        bx0 = bx1 - chip_w
        by0 = by1 - chip_h

    draw.rounded_rectangle((bx0, by0, bx1, by1), radius, fill=(255, 255, 255, 200))

    # Center text inside chip, compensating for font bearings
    tx = int(round((bx0 + bx1) / 2 - tw / 2 - left_bearing))
    ty = int(round((by0 + by1) / 2 - th / 2 - top_bearing))
    draw.text((tx, ty), text, fill=(0, 0, 0, 255), font=font)


def build_panel(inp: Path, out_path: Path, final_gutter_px: int = 1):
    """
    1) Split HSV at source resolution.
    2) Stack H,S,V vertically without horizontal resample.
    3) Compute left column width so whole canvas is 16:9.
    4) Compose at native scale, then downscale to 1920x1080.
    Labels German, always on. Left crop centered.
    """
    with Image.open(inp) as im_src:
        base_rgb = im_src.convert("RGB")
        iw, ih = base_rgb.size

    Rw, Th = iw, ih

    # Choose native gutter so that after downscaling to 1080px high it equals final_gutter_px
    denom = max(1, (1080 - 2 * final_gutter_px))
    g_nat = int(round((3 * ih * final_gutter_px) / denom))

    Hnat = 3 * ih + 2 * g_nat
    Wnat = int(round((16 / 9) * Hnat))
    Lw = Wnat - g_nat - Rw
    if Lw <= 0:
        raise ValueError(f"Computed left width <= 0 (L={Lw}). Input too wide for rule with iw={iw}, ih={ih}.")

    canvas = Image.new("RGBA", (Wnat, Hnat), (255, 255, 255, 255))

    with Image.open(inp) as im_src:
        left = _cover_center(im_src.convert("RGB"), (Lw, Hnat))
    canvas.paste(left, (0, 0))

    h, s, v = base_rgb.convert("HSV").split()

    for idx, plane in enumerate((h, s, v)):
        tile_rgb = Image.merge("RGB", (plane, plane, plane))
        y = idx * Th + idx * g_nat
        canvas.paste(tile_rgb, (Lw + g_nat, y))

    # Large labels, tightly boxed
    label_font_px = 110
    d = ImageDraw.Draw(canvas, "RGBA")
    _label_chip(d, (0, 0, Lw, Hnat), "Originalkarte", align_left=True, font_px=label_font_px)
    _label_chip(d, (Lw + g_nat, 0, Lw + g_nat + Rw, Th), "Farbton", align_left=False, font_px=label_font_px)
    _label_chip(d, (Lw + g_nat, Th + g_nat, Lw + g_nat + Rw, 2 * Th + g_nat), "Sättigung", align_left=False, font_px=label_font_px)
    _label_chip(d, (Lw + g_nat, 2 * Th + 2 * g_nat, Lw + g_nat + Rw, 3 * Th + 2 * g_nat), "Helligkeit", align_left=False, font_px=label_font_px)

    final = canvas.convert("RGB").resize((1920, 1080), Image.Resampling.LANCZOS)

    if not out_path.suffix:
        out_path = out_path.with_suffix(".png")
    out_path.parent.mkdir(parents=True, exist_ok=True)
    final.save(out_path, format="PNG")


def main():
    ap = argparse.ArgumentParser(description="Create a single HSV panel from an image (16:9 output, 1920x1080).")
    ap.add_argument("image", type=Path, help="Input image")
    ap.add_argument("-o", "--out", type=Path, help="Output image path (default: <stem>_hsv_panel.png)")
    ap.add_argument("--gutter", type=int, default=1, help="Final spacing in pixels between tiles (default 1)")
    args = ap.parse_args()

    inp: Path = args.image
    out_path: Path = args.out if args.out else inp.with_name(f"{inp.stem}_hsv_panel.png")
    build_panel(inp, out_path, final_gutter_px=args.gutter)


if __name__ == "__main__":
    main()
