#!/usr/bin/env python3
import sys
from pathlib import Path
from PIL import Image
import numpy as np
import matplotlib.pyplot as plt
import matplotlib.ticker as tck

import colour
from colour import sRGB_to_XYZ, XYZ_to_xy
import colour.plotting as cl
from colour.colorimetry import MSDS_CMFS


def process_image(image_path : Path, output_dir : Path, sample : int = 500000):
    """Verarbeitet ein einzelnes Bild und speichert das Diagramm ins Output-Verzeichnis."""
    img = Image.open(image_path).convert("RGB")
    arr = np.asarray(img, dtype=float) / 255.0
    flat = arr.reshape(-1, 3)

    # subsample für Geschwindigkeit
    #sample = flat.shape[0]
    if flat.shape[0] > sample:
        idx = np.random.choice(flat.shape[0], sample, replace=False)
        flat = flat[idx]

    XYZ = colour.sRGB_to_XYZ(flat)
    xy = colour.XYZ_to_xy(XYZ)

    fig, ax = plt.subplots(figsize=(8, 8))

    # Hintergrunddiagramm
    cl.plot_chromaticity_diagram_CIE1931(
        cmfs="CIE 1931 2 Degree Standard Observer",
        axes=ax,
        show=False,
        title=None,
        spectral_locus_colours="RGB",
#        spectral_locus_labels={"fontsize": 12},   # << fontsize here
        spectral_locus_markers=None,
    )

    # Hufeisen-Kontur
    wavelengths = np.linspace(380, 780, 401)
    cmfs = MSDS_CMFS["CIE 1931 2 Degree Standard Observer"]
    XYZ_cmfs = cmfs[wavelengths]
    xy_cmfs = XYZ_to_xy(XYZ_cmfs)
    ax.plot(xy_cmfs[:, 0], xy_cmfs[:, 1], color="black", linewidth=1.0, zorder=20)
    ax.plot([xy_cmfs[-1, 0], xy_cmfs[0, 0]],
            [xy_cmfs[-1, 1], xy_cmfs[0, 1]],
            color="black", linewidth=1.0, zorder=20)

    # Pixelwolke
    ax.scatter(xy[:, 0], xy[:, 1],
               c=flat, s=2, alpha=0.6, edgecolors="none", zorder=30)

    # Funktion für Gammuts
    def plot_gamut(ax, primaries, white, label, color):
        poly = np.vstack([primaries, primaries[0]])
        ax.plot(poly[:, 0], poly[:, 1], color=color, linewidth=1.2,
                label=label, zorder=40)
        
        if white is not None:
            ax.plot(white[0], white[1], "o", color=color, markersize=4, zorder=41)

    # Gammuts definieren
    pal_primaries = np.array([[0.640, 0.330],
                              [0.290, 0.600],
                              [0.150, 0.060]])
    rec709_primaries = np.array([[0.640, 0.330],
                                 [0.300, 0.600],
                                 [0.150, 0.060]])
    p3_primaries = np.array([[0.680, 0.320],
                             [0.265, 0.690],
                             [0.150, 0.060]])
    crt_primaries = np.array([[0.620, 0.342],
                             [0.288, 0.597],
                             [0.153, 0.070]])

#    white = (0.3127, 0.3290)
    white = None

    plot_gamut(ax, pal_primaries, white, "PAL/EBU Zielfarbraum (TV)", "blue")
    plot_gamut(ax, rec709_primaries, white, "Rec.709 / sRGB (HDTV/Web)", "green")
    plot_gamut(ax, crt_primaries, white, "Avg. CRT Monitor", "yellow")
    plot_gamut(ax, p3_primaries, white, "Display P3 (Apple / OLED)", "blue")

    basename = Path(image_path).stem
    ax.set_title(f"CIE 1931 Farbdiagramm – Pixelverteilung von ‚{basename}‘", fontsize=16)
#    ax.set_title(f"CIE 1931 Farbdiagramm", fontsize=16)

    # Achsenformatierung
    ax.set_xlabel("x (2°) Farbkoordinate", fontsize=14)
    ax.set_ylabel("y (2°) Farbkoordinate", fontsize=14)
    ax.set_xlim(-0.1, 0.85)
    ax.set_ylim(-0.1, 0.95)
    ax.xaxis.set_major_locator(tck.MultipleLocator(0.1))
    ax.xaxis.set_minor_locator(tck.MultipleLocator(0.01))
    ax.yaxis.set_major_locator(tck.MultipleLocator(0.1))
    ax.yaxis.set_minor_locator(tck.MultipleLocator(0.01))

    # Ticks bigger
    ax.tick_params(axis="both", which="major", labelsize=12)
    ax.tick_params(axis="both", which="minor", labelsize=10)
    
    ax.grid(which="major", axis="both", linestyle="--", color="gray", alpha=0.8)

    ax.legend(loc="lower right", fontsize=7)

    plt.tight_layout()

    # Speicherpfad im Output-Verzeichnis
    save_path = Path(output_dir) / f"{basename}_cie1931.png"
    plt.savefig(save_path, dpi=300)
    plt.close(fig)  # Speicher freigeben

    print(f"Gespeichert: {save_path}")


def main(input_dir, output_dir):
    input_dir = Path(input_dir)
    output_dir = Path(output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)

    exts = {".jpg", ".jpeg", ".png", ".bmp", ".tiff", ".webp"}
    images = [f for f in input_dir.iterdir() if f.suffix.lower() in exts]

    print(f"{len(images)} Bilder gefunden in {input_dir}")

    for img_path in images:
        try:
            process_image(img_path, output_dir)
        except Exception as e:
            print(f"Fehler bei {img_path.name}: {e}")


if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python cie1931_pixels_gamuts.py <input_dir> <output_dir>")
    else:
        main(sys.argv[1], sys.argv[2])
