#!/usr/bin/env python3
import argparse
from pathlib import Path
from PIL import Image

def split_hsv(inp: Path, outdir: Path):
    outdir.mkdir(parents=True, exist_ok=True)
    img = Image.open(inp).convert("RGB")
    h, s, v = img.convert("HSV").split()
    stem = inp.stem
    h.save(outdir / f"{stem}_H.png")
    s.save(outdir / f"{stem}_S.png")
    v.save(outdir / f"{stem}_V.png")

def compose_rgb(h_path: Path, s_path: Path, v_path: Path, out_path: Path):
    # Ensure 8-bit grayscale and same size
    h = Image.open(h_path).convert("L")
    s = Image.open(s_path).convert("L")
    v = Image.open(v_path).convert("L")

    if s.size != h.size:
        s = s.resize(h.size, Image.NEAREST)
    
    if v.size != h.size:
        v = v.resize(h.size, Image.NEAREST)

    rgb = Image.merge("HSV", (h, s, v)).convert("RGB")
    out_path.parent.mkdir(parents=True, exist_ok=True)
    rgb.save(out_path)

def main():
    ap = argparse.ArgumentParser(description="Split image to HSV or compose RGB from H,S,V images.")
    sub = ap.add_subparsers(dest="cmd", required=True)

    sp = sub.add_parser("split", help="Split an image into H,S,V grayscale PNGs")
    sp.add_argument("image", type=Path)
    sp.add_argument("-o", "--outdir", type=Path, default=None)

    cp = sub.add_parser("compose", help="Compose RGB from H,S,V grayscale images")
    cp.add_argument("--h", required=True, type=Path, help="Hue image (8-bit grayscale)")
    cp.add_argument("--s", required=True, type=Path, help="Saturation image (8-bit grayscale)")
    cp.add_argument("--v", required=True, type=Path, help="Value/Brightness image (8-bit grayscale)")
    cp.add_argument("-o", "--out", required=True, type=Path, help="Output RGB image")

    args = ap.parse_args()

    if args.cmd == "split":
        print(f"Splitting {args.image} into HSV channels...")
        
        inp = args.image
        outdir = args.outdir if args.outdir else inp.parent
        split_hsv(inp, outdir)
    else:
        compose_rgb(args.h, args.s, args.v, args.out)

if __name__ == "__main__":
    main()
