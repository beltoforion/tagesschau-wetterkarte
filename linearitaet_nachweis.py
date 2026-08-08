"""Nachweis der Wahrnehmungslinearitaet der umparametrisierten Skala.

Vergleicht die rekonstruierte Tagesschau-Skala (Skalenvariante des
Ankerbildes) mit ihrer wahrnehmungslinear umparametrisierten Version
(linearize() aus dwd_linear_vergleich.py):

  1. Farbabstand dE00 je 1-K-Schritt: die Originalskala zeigt das
     Saegezahnmuster ihrer Bandstruktur, die linearisierte Version eine
     konstante Rate.
  2. Kumulative perzeptuelle Bogenlaenge: die linearisierte Skala liegt
     exakt auf der Geraden, die Originalskala windet sich darum.
  3. Beide Skalen als Farbbalken ueber derselben Temperaturachse.

Aufruf (im Repo-Verzeichnis, venv):
    python linearitaet_nachweis.py --anchor tag-2025-04-16.webp
"""

import argparse
import sys

import numpy as np
import colour
import matplotlib.pyplot as plt
import matplotlib.ticker as tck

from dwd_linear_vergleich import variant_scale, linearize

OUT_PATH = "output_2025-2026/linearitaet_nachweis.png"


def de_per_kelvin(t_fine: np.ndarray, rgb: np.ndarray, t_grid: np.ndarray):
    """dE00 je 1-K-Schritt einer Skala, ausgewertet auf einem 1-K-Raster."""
    pts = np.stack([np.interp(t_grid, t_fine, rgb[:, ch]) for ch in range(3)], axis=1)
    lab = colour.XYZ_to_Lab(colour.sRGB_to_XYZ(np.clip(pts / 255.0, 0, 1)))
    return colour.delta_E(lab[:-1], lab[1:], method="CIE 2000")


def main() -> int:
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("--anchor", default="tag-2025-04-16.webp")
    p.add_argument("--max-offset-diff", type=float, default=0.35)
    p.add_argument("--per-file-json", default="output_2025-2026/per_file_rgb_map.json")
    args = p.parse_args()

    t_fine, rgb_orig = variant_scale(args.per_file_json, args.anchor, args.max_offset_diff)
    rgb_lin = linearize(t_fine, rgb_orig)

    t_lo, t_hi = float(t_fine.min()), float(t_fine.max())
    t_grid = np.arange(np.ceil(t_lo), np.floor(t_hi) + 1.0)
    t_mid = (t_grid[:-1] + t_grid[1:]) / 2.0

    de_orig = de_per_kelvin(t_fine, rgb_orig, t_grid)
    de_lin = de_per_kelvin(t_fine, rgb_lin, t_grid)
    cv_orig = de_orig.std() / de_orig.mean()
    cv_lin = de_lin.std() / de_lin.mean()
    print(f"[i] dE00/K Original:      Mittel {de_orig.mean():.2f}, CV {cv_orig:.2f}",
          file=sys.stderr)
    print(f"[i] dE00/K linearisiert:  Mittel {de_lin.mean():.2f}, CV {cv_lin:.2f}",
          file=sys.stderr)

    fig, (ax_de, ax_cum, ax_bar) = plt.subplots(
        3, 1, figsize=(11, 10), sharex=True,
        gridspec_kw={"height_ratios": [2.2, 2.2, 0.9], "hspace": 0.3})

    # Panel 1: dE00 je 1-K-Schritt
    ax_de.bar(t_mid, de_orig, width=0.9, color="lightgray", edgecolor="gray",
              linewidth=0.5, label=f"Originalskala (CV = {cv_orig:.2f})")
    ax_de.plot(t_mid, de_lin, "-o", color="firebrick", markersize=4, linewidth=1.6,
               label=f"wahrnehmungslinear (CV = {cv_lin:.2f})")
    ax_de.axhline(de_lin.mean(), color="firebrick", linestyle=":", linewidth=1.0, alpha=0.7)
    ax_de.set_ylabel("ΔE₀₀ pro 1 °C")
    ax_de.legend(loc="upper right", fontsize=10)
    ax_de.set_title("Farbabstand je 1-°C-Schritt (CIEDE2000): Sägezahn der Bandstruktur "
                    "vs. konstante Rate", fontsize=11, loc="left")
    ax_de.grid(True, axis="y", linestyle=":", alpha=0.5)

    # Panel 2: kumulative Bogenlaenge
    cum_orig = np.concatenate([[0.0], np.cumsum(de_orig)])
    cum_lin = np.concatenate([[0.0], np.cumsum(de_lin)])
    ax_cum.plot(t_grid, cum_orig, "-", color="gray", linewidth=1.6, marker="o",
                markersize=3.5, label="Originalskala")
    ax_cum.plot(t_grid, cum_lin, "-", color="firebrick", linewidth=1.8, marker="o",
                markersize=3.5, label="wahrnehmungslinear")
    ax_cum.plot([t_grid[0], t_grid[-1]], [0, cum_lin[-1]], "--", color="black",
                linewidth=1.0, label="perfekte Linearität (Referenzgerade)")
    ax_cum.set_ylabel("kumulative ΔE₀₀")
    ax_cum.legend(loc="upper left", fontsize=10)
    ax_cum.set_title("Kumulative wahrgenommene Farbänderung: die linearisierte Skala "
                     "liegt auf der Geraden", fontsize=11, loc="left")
    ax_cum.grid(True, linestyle=":", alpha=0.5)

    # Panel 3: beide Skalen als Balken
    for i, (label, rgb) in enumerate((("Original", rgb_orig), ("linear", rgb_lin))):
        gradient = np.clip(rgb / 255.0, 0, 1)[np.newaxis, :, :]
        ax_bar.imshow(gradient, aspect="auto", interpolation="bilinear",
                      extent=(t_lo, t_hi, i - 0.38, i + 0.38), zorder=3)
    ax_bar.set_xlim(t_lo - 0.5, t_hi + 0.5)
    ax_bar.set_ylim(-0.6, 1.6)
    ax_bar.set_yticks([0, 1])
    ax_bar.set_yticklabels(["Original", "linearisiert"], fontsize=10)
    ax_bar.invert_yaxis()
    ax_bar.set_xlabel("Temperatur [°C]")
    ax_bar.xaxis.set_major_locator(tck.MultipleLocator(5))
    ax_bar.xaxis.set_minor_locator(tck.MultipleLocator(1))

    fig.suptitle("Nachweis: gleiche Farben, aber wahrnehmungslinear verteilt", fontsize=13)
    plt.savefig(OUT_PATH, dpi=200, bbox_inches="tight")
    plt.close(fig)
    print(f"gespeichert: {OUT_PATH}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
