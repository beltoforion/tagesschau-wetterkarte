"""Rendert eine DWD-Messwertkarte in der rekonstruierten Tagesschau-Farbskala.

Zweck: Vergleich der Tagesschau-Temperaturkarte mit den tatsaechlich
gemessenen DWD-Tageswerten in identischer Farbgebung. Die Farbskala wird
aus den OCR-Messwerten (per_file_rgb_map.json aus scale.py) derjenigen
Skalenvariante rekonstruiert, die die Vergleichskarte verwendet — als
Ankerbild dient standardmaessig die Sommerkarte tag-2025-07-04.webp.

Aufruf (im Repo-Verzeichnis, venv mit colour-science):
    python dwd_tagesschau_vergleich.py 2025-07-01 --anchor tag-2025-07-04.webp
"""

import argparse
import sys
from datetime import datetime
from pathlib import Path

import numpy as np
import matplotlib.pyplot as plt
from matplotlib.colors import LinearSegmentedColormap, Normalize
from scipy.interpolate import griddata

import dwd_tempkarte as dwd
from scale import (load_per_file_rgb_map, build_samples, cluster_palette,
                   estimate_scale_offsets, compute_color_scale,
                   fit_color_spline_lab)


def tagesschau_cmap(per_file_path: str, anchor: str, max_offset_diff: float = 0.5):
    """Baut die Colormap der Skalenvariante, die das Ankerbild verwendet.

    Es werden alle Bilder herangezogen, deren geschaetzter Skalen-Offset
    hoechstens `max_offset_diff` °C vom Ankerbild abweicht (= dieselbe
    Variante); deren Messwerte werden gemeinsam zu Medianfarben je °C
    aggregiert und mit dem Glaettungsspline aus scale.py zur
    kontinuierlichen Skala verrechnet.

    Returns:
        Tupel (cmap, t_min, t_max).
    """
    per_file = load_per_file_rgb_map(per_file_path)
    if anchor not in per_file:
        raise SystemExit(f"Ankerbild {anchor!r} nicht in {per_file_path}")

    samples = build_samples(per_file)
    cluster_palette(samples)  # setzt s["band"], Voraussetzung fuer Offsets
    offsets, _ = estimate_scale_offsets(samples)

    ref = offsets[anchor]
    variant_files = {fn for fn, d in offsets.items() if abs(d - ref) <= max_offset_diff}
    print(f"[i] Skalenvariante des Ankers: {sorted(variant_files)} "
          f"(Offset {ref:+.1f} °C)", file=sys.stderr)

    rgb_map = {}
    for fn in variant_files:
        for t, vlist in per_file[fn].items():
            rgb_map.setdefault(int(t), []).extend(vlist)

    temps, scale_rgb = compute_color_scale(rgb_map)
    t_fine, rgb_fine = fit_color_spline_lab(temps, scale_rgb)

    cmap = LinearSegmentedColormap.from_list(
        "tagesschau", np.clip(rgb_fine / 255.0, 0, 1), N=512)
    return cmap, float(t_fine.min()), float(t_fine.max())


def germany_mask(glon: np.ndarray, glat: np.ndarray) -> np.ndarray:
    """True fuer Gitterpunkte innerhalb der deutschen Landesgrenze.

    Ausserhalb Deutschlands existieren keine Stationsdaten — die
    Interpolation dort waere reine Extrapolation und wird maskiert.
    """
    from matplotlib.path import Path as MplPath

    geo = dwd._load_geojson(dwd.GERMANY_OUTLINE_URL, "germany_outline.geojson")
    pts = np.column_stack([glon.ravel(), glat.ravel()])
    inside = np.zeros(pts.shape[0], dtype=bool)
    for feat in geo.get("features", [geo]):
        geom = feat.get("geometry", feat)
        for lon, lat in dwd._iter_rings(geom):
            ring = MplPath(np.column_stack([lon, lat]))
            inside |= ring.contains_points(pts)
    return inside.reshape(glon.shape)


def render(observations, target, cmap, vmin, vmax, out_path: Path,
           title: str, step: float = 1.0) -> None:
    """Wie dwd_tempkarte.render_map, aber mit fest verankerter Skala und
    auf die deutsche Landesflaeche maskiert."""
    lats = np.array([s.lat for s, _ in observations])
    lons = np.array([s.lon for s, _ in observations])
    vals = np.array([v for _, v in observations])

    lon_min, lon_max = 5.5, 15.5
    lat_min, lat_max = 47.0, 55.5
    glon, glat = np.meshgrid(np.linspace(lon_min, lon_max, 320),
                             np.linspace(lat_min, lat_max, 280))
    grid = griddata((lons, lats), vals, (glon, glat), method="cubic")
    nearest = griddata((lons, lats), vals, (glon, glat), method="nearest")
    grid = np.where(np.isnan(grid), nearest, grid)
    grid = np.where(germany_mask(glon, glat), grid, np.nan)

    norm = Normalize(vmin=vmin, vmax=vmax)

    fig, ax = plt.subplots(figsize=(9, 10))
    mesh = ax.pcolormesh(glon, glat, grid, cmap=cmap, norm=norm,
                         shading="auto", zorder=1)
    levels = np.arange(np.floor(vals.min()), np.ceil(vals.max()) + step, step)
    cs = ax.contour(glon, glat, grid, levels=levels, colors="black",
                    linewidths=0.4, alpha=0.4, zorder=2)
    ax.clabel(cs, levels=levels[::2], inline=True, fontsize=6, fmt="%g°")

    dwd.draw_overlay(ax, with_states=False)

    ax.set_xlim(lon_min, lon_max)
    ax.set_ylim(lat_min, lat_max)
    ax.set_aspect(1.0 / np.cos(np.deg2rad((lat_min + lat_max) / 2)))
    ax.set_xlabel("Längengrad [°O]")
    ax.set_ylabel("Breitengrad [°N]")
    ax.set_title(title, fontsize=12)

    cbar = fig.colorbar(mesh, ax=ax, orientation="vertical", shrink=0.85,
                        pad=0.02)
    cbar.set_label("Temperatur [°C]")

    out_path.parent.mkdir(parents=True, exist_ok=True)
    plt.tight_layout()
    plt.savefig(out_path, dpi=200)
    plt.close(fig)
    print(f"[i] Karte gespeichert: {out_path}", file=sys.stderr)


def main() -> int:
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("datum", help="Datum YYYY-MM-DD")
    p.add_argument("--param", choices=("mean", "max", "min"), default="max")
    p.add_argument("--anchor", default="tag-2025-07-04.webp",
                   help="Wetterkarte, deren Skalenvariante verwendet wird")
    p.add_argument("--per-file-json", default="output_2025-2026/per_file_rgb_map.json")
    p.add_argument("--output", type=Path, default=None)
    args = p.parse_args()

    target = datetime.strptime(args.datum, "%Y-%m-%d").date()
    cmap, t_min, t_max = tagesschau_cmap(args.per_file_json, args.anchor)
    print(f"[i] Rekonstruierte Skala deckt {t_min:.1f} bis {t_max:.1f} °C ab",
          file=sys.stderr)

    observations = dwd.collect_observations(target, args.param)
    out = args.output or Path("output") / f"dwd_{args.param}_{target.isoformat()}_tagesschau.png"
    label = dwd.PARAM_COLUMNS[args.param][1]
    render(observations, target, cmap, t_min, t_max, out,
           title=(f"{label}\nDeutschland · {target.strftime('%d.%m.%Y')} · "
                  f"DWD-Messwerte in rekonstruierter Tagesschau-Farbskala"))
    return 0


if __name__ == "__main__":
    sys.exit(main())
