"""DWD-Messwertkarte: rekonstruierte Tagesschau-Skala vs. wahrnehmungslineare Variante.

Erzeugt fuer einen Tag zwei ansonsten identische Karten aus den
DWD-Stationsmesswerten:

  1. eingefaerbt mit der rekonstruierten Tagesschau-Farbskala
     (Skalenvariante des Ankerbildes), und
  2. eingefaerbt mit einer wahrnehmungslinearisierten Version derselben
     Skala: gleicher Farbverlauf, gleiche Endpunkte, aber so
     umparametrisiert, dass jeder 1-K-Schritt denselben Farbabstand
     (CIEDE2000) traegt. Die Bandstruktur der Originalskala verschwindet,
     die Farbfolge bleibt.

Aufruf (im Repo-Verzeichnis, venv):
    python dwd_linear_vergleich.py 2025-04-17 --anchor tag-2025-04-16.webp
"""

import argparse
import sys
from datetime import datetime
from pathlib import Path

import numpy as np
import colour
from matplotlib.colors import LinearSegmentedColormap

import dwd_tempkarte as dwd
from dwd_tagesschau_vergleich import render
from scale import (load_per_file_rgb_map, build_samples, cluster_palette,
                   estimate_scale_offsets, compute_color_scale,
                   fit_color_spline_lab)


def variant_scale(per_file_path: str, anchor: str, max_offset_diff: float):
    """Spline-Skala (t_fine, rgb_fine) der Skalenvariante des Ankerbildes."""
    per_file = load_per_file_rgb_map(per_file_path)
    if anchor not in per_file:
        raise SystemExit(f"Ankerbild {anchor!r} nicht in {per_file_path}")

    samples = build_samples(per_file)
    cluster_palette(samples)
    offsets, _ = estimate_scale_offsets(samples)

    ref = offsets[anchor]
    files = {fn for fn, d in offsets.items() if abs(d - ref) <= max_offset_diff}
    print(f"[i] Variante des Ankers ({ref:+.1f} °C): {sorted(files)}", file=sys.stderr)

    rgb_map = {}
    for fn in files:
        for t, vlist in per_file[fn].items():
            rgb_map.setdefault(int(t), []).extend(vlist)

    temps, scale_rgb = compute_color_scale(rgb_map)
    return fit_color_spline_lab(temps, scale_rgb)


def linearize(t_fine: np.ndarray, rgb_fine: np.ndarray):
    """Parametrisiert die Skala auf konstante ΔE00-Rate je Kelvin um.

    Die kumulative CIEDE2000-Bogenlaenge s(t) der Originalskala wird
    berechnet und invertiert: Die linearisierte Skala nimmt bei der
    Temperatur t die Farbe an, bei der die Originalskala den Anteil
    (t - t_min)/(t_max - t_min) ihrer gesamten Bogenlaenge erreicht hat.
    """
    lab = colour.XYZ_to_Lab(colour.sRGB_to_XYZ(np.clip(rgb_fine / 255.0, 0, 1)))
    de = colour.delta_E(lab[:-1], lab[1:], method="CIE 2000")
    s = np.concatenate([[0.0], np.cumsum(de)])
    s_norm = s / s[-1]

    frac = (t_fine - t_fine.min()) / (t_fine.max() - t_fine.min())
    # Position in der Originalskala, an der der Bogenlaengen-Anteil erreicht ist
    t_src = np.interp(frac, s_norm, t_fine)
    rgb_lin = np.stack([np.interp(t_src, t_fine, rgb_fine[:, ch]) for ch in range(3)], axis=1)
    return rgb_lin


def main() -> int:
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("datum", help="Datum YYYY-MM-DD")
    p.add_argument("--param", choices=("mean", "max", "min"), default="max")
    p.add_argument("--anchor", default="tag-2025-04-16.webp")
    p.add_argument("--max-offset-diff", type=float, default=0.35)
    p.add_argument("--per-file-json", default="output_2025-2026/per_file_rgb_map.json")
    args = p.parse_args()

    target = datetime.strptime(args.datum, "%Y-%m-%d").date()
    t_fine, rgb_fine = variant_scale(args.per_file_json, args.anchor, args.max_offset_diff)
    rgb_lin = linearize(t_fine, rgb_fine)
    t_min, t_max = float(t_fine.min()), float(t_fine.max())
    print(f"[i] Skala deckt {t_min:.1f} bis {t_max:.1f} °C ab", file=sys.stderr)

    cmap_orig = LinearSegmentedColormap.from_list(
        "tagesschau", np.clip(rgb_fine / 255.0, 0, 1), N=512)
    cmap_lin = LinearSegmentedColormap.from_list(
        "tagesschau_linear", np.clip(rgb_lin / 255.0, 0, 1), N=512)

    observations = dwd.collect_observations(target, args.param)
    label = dwd.PARAM_COLUMNS[args.param][1]

    render(observations, target, cmap_orig, t_min, t_max,
           Path("output") / f"dwd_{args.param}_{target.isoformat()}_tagesschau.png",
           title=(f"{label}\nDeutschland · {target.strftime('%d.%m.%Y')} · "
                  f"DWD-Messwerte in rekonstruierter Tagesschau-Farbskala"))
    render(observations, target, cmap_lin, t_min, t_max,
           Path("output") / f"dwd_{args.param}_{target.isoformat()}_tagesschau_linear.png",
           title=(f"{label}\nDeutschland · {target.strftime('%d.%m.%Y')} · "
                  f"dieselbe Skala, wahrnehmungslinear umparametrisiert (ΔE00/K konstant)"))
    return 0


if __name__ == "__main__":
    sys.exit(main())
