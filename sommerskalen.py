"""Sommerfarbskalen 2025/2026 und die Verschiebung zwischen den Jahrgaengen.

Datenbasis sind ausschliesslich Wetterkarten (Tag- und Nachtkarten) aus dem
meteorologischen Sommer (1. Juni bis 31. August). Innerhalb eines Sommers
wechselt die Redaktion die Skala nicht saisonal — mit dieser Datenbasis ist
sichergestellt, dass kein saisonaler Skalenwechsel im Datensatz steckt und
die Temperatur als Kurvenparameter aussagekraeftig ist.

Je Jahrgang wird die kontinuierliche Sommerfarbskala rekonstruiert
(Median je Grad + robuster Glaettungsspline im CIELAB-Raum, wie in
scale.py). Die Verschiebung zwischen den Jahrgaengen wird direkt an den
beiden kontinuierlichen Skalen bestimmt: fuer ein durchgestimmtes delta-t
wird der mittlere Farbabstand (CIEDE2000) zwischen s2025(t) und
s2026(t + delta-t) ueber den gemeinsamen Temperaturbereich berechnet —
Temperaturen ausserhalb der jeweiligen min/max-Grenzen bleiben aussen vor
(keine Extrapolation). Das delta-t mit dem kleinsten mittleren dE00 ist
die gesuchte Skalenverschiebung.

Aufruf (im Repo-Verzeichnis, venv):
    python sommerskalen.py            # Tag- und Nachtkarten
    python sommerskalen.py --nur-tag  # nur Tagestemperaturkarten
"""

import argparse
import re
from pathlib import Path
from typing import Dict, List, Tuple

import colour
import matplotlib.pyplot as plt
import matplotlib.ticker as tck
import numpy as np

from scale import (load_per_file_rgb_map, compute_color_scale,
                   fit_color_spline_lab, plot_color_scale_bar)

PER_FILE_JSON = "./output_2025-2026/per_file_rgb_map.json"
OUTPUT_DIR = "./output_2025-2026/"

# meteorologischer Sommer: Juni, Juli, August
SUMMER_MONTHS = (6, 7, 8)
FILENAME_RE = re.compile(r"^(tag|nacht)-(\d{4})-(\d{2})-(\d{2})\.")

# Suchbereich und Schrittweite der Verschiebung
DELTA_RANGE = 15.0
DELTA_STEP = 0.05
# Mindestueberlappung der Temperaturbereiche, damit ein delta-t bewertet wird
MIN_OVERLAP = 10.0


def collect_summer_maps(per_file: Dict[str, Dict[int, List[Tuple[float, float, float]]]],
                        only_kind: str = None
                        ) -> Dict[int, Dict[int, List[Tuple[float, float, float]]]]:
    """Aggregiert die Messwerte der Sommerkarten getrennt nach Jahrgang.

    Args:
        per_file: Zuordnung Dateiname -> {Temperatur -> Messwerte}.
        only_kind: optional "tag" oder "nacht" — beschraenkt die Datenbasis
            auf diesen Kartentyp; None nimmt beide.

    Returns:
        Zuordnung Jahr -> {Temperatur -> Messwerte} (nur Sommermonate).
    """
    by_year: Dict[int, Dict[int, List[Tuple[float, float, float]]]] = {}
    n_files: Dict[int, Dict[str, int]] = {}
    for fn, m in sorted(per_file.items()):
        match = FILENAME_RE.match(fn)
        if not match:
            print(f"  übersprungen (kein Datum im Namen): {fn}")
            continue
        kind, year, month = match.group(1), int(match.group(2)), int(match.group(3))
        if month not in SUMMER_MONTHS:
            continue
        if only_kind is not None and kind != only_kind:
            continue
        agg = by_year.setdefault(year, {})
        for t, vlist in m.items():
            agg.setdefault(int(t), []).extend(tuple(v) for v in vlist)
        n_files.setdefault(year, {"tag": 0, "nacht": 0})[kind] += 1

    for year in sorted(by_year):
        nf = n_files[year]
        temps = sorted(by_year[year])
        print(f"Sommer {year}: {nf['tag']} Tagkarten, {nf['nacht']} Nachtkarten, "
              f"Temperaturen {temps[0]} bis {temps[-1]} °C")
    return by_year


def lab_curve(t_fine: np.ndarray, rgb_fine: np.ndarray):
    """Erzeugt einen CIELAB-Interpolator ueber die kontinuierliche Skala.

    Args:
        t_fine: Temperaturraster der Ausgleichskurve.
        rgb_fine: (M, 3)-Array der Kurvenpunkte (0-255, sRGB).

    Returns:
        Funktion t -> (len(t), 3)-Lab-Array (lineare Interpolation auf dem
        feinen Raster; ausserhalb des Rasters undefiniert — Aufrufer muss
        den Gueltigkeitsbereich einhalten).
    """
    lab_fine = colour.XYZ_to_Lab(colour.sRGB_to_XYZ(np.clip(rgb_fine / 255.0, 0, 1)))

    def f(t: np.ndarray) -> np.ndarray:
        return np.stack([np.interp(t, t_fine, lab_fine[:, ch]) for ch in range(3)], axis=1)

    return f


def similarity_scan(t_a: np.ndarray, lab_a,
                    t_b: np.ndarray, lab_b) -> Tuple[np.ndarray, np.ndarray]:
    """Berechnet den mittleren Farbabstand beider Skalen je Verschiebung.

    Verglichen wird skala_a(t) mit skala_b(t + delta) fuer alle t des
    gemeinsamen Gueltigkeitsbereichs; Temperaturen ausserhalb der min/max-
    Grenzen einer der beiden Skalen werden ignoriert.

    Args:
        t_a: Temperaturraster der Skala A (aufsteigend).
        lab_a: Lab-Interpolator der Skala A (aus lab_curve()).
        t_b: Temperaturraster der Skala B.
        lab_b: Lab-Interpolator der Skala B.

    Returns:
        Tupel (deltas, mean_de): getestete Verschiebungen und der jeweils
        mittlere dE00 (NaN, wenn die Ueberlappung unter MIN_OVERLAP liegt).
    """
    deltas = np.arange(-DELTA_RANGE, DELTA_RANGE + 1e-9, DELTA_STEP)
    mean_de = np.full(deltas.shape, np.nan)

    for i, d in enumerate(deltas):
        lo = max(t_a.min(), t_b.min() - d)
        hi = min(t_a.max(), t_b.max() - d)
        if hi - lo < MIN_OVERLAP:
            continue
        t = np.arange(lo, hi + 1e-9, 0.1)
        de = colour.delta_E(lab_a(t), lab_b(t + d), method="CIE 2000")
        mean_de[i] = float(np.mean(de))

    return deltas, mean_de


def plot_comparison(scales: dict, deltas: np.ndarray, mean_de: np.ndarray,
                    best_delta: float, best_de: float,
                    output_dir: str,
                    filename: str = "sommer_skalenvergleich.png") -> None:
    """Zeichnet den Vergleich der Sommerskalen und die Aehnlichkeitskurve.

    Oben: beide kontinuierlichen Skalen auf gemeinsamer Temperaturachse.
    Mitte: Skala 2026 um -delta-t* verschoben — die Baender liegen uebereinander.
    Unten: mittlerer dE00 ueber der getesteten Verschiebung mit Minimum.

    Args:
        scales: Jahr -> (t_fine, rgb_fine) der kontinuierlichen Skalen.
        deltas: getestete Verschiebungen.
        mean_de: mittlerer dE00 je Verschiebung.
        best_delta: Verschiebung mit minimalem dE00.
        best_de: minimaler mittlerer dE00.
        output_dir: Ausgabeverzeichnis.
        filename: Dateiname der Grafik.
    """
    (y_a, (t_a, rgb_a)), (y_b, (t_b, rgb_b)) = sorted(scales.items())

    fig, (ax_raw, ax_shift, ax_de) = plt.subplots(
        3, 1, figsize=(12, 9), height_ratios=[1.0, 1.0, 1.6],
        constrained_layout=True)

    def draw_bar(ax, t, rgb, y0, y1):
        gradient = np.clip(rgb / 255.0, 0, 1)[np.newaxis, :, :]
        ax.imshow(gradient, aspect="auto", interpolation="bilinear",
                  extent=(float(t.min()), float(t.max()), y0, y1))

    x_lo = min(t_a.min(), t_b.min() - best_delta) - 1
    x_hi = max(t_a.max(), t_b.max()) + 1

    # oben: beide Skalen unverschoben, direkt aneinander — die Verschiebung
    # der Farbbaender ist an der Nahtstelle unmittelbar sichtbar
    draw_bar(ax_raw, t_a, rgb_a, 0.0, 1.0)
    draw_bar(ax_raw, t_b, rgb_b, 1.0, 2.0)
    ax_raw.set_yticks([0.5, 1.5])
    ax_raw.set_yticklabels([f"Sommer {y_a}", f"Sommer {y_b}"])
    ax_raw.set_title("Rekonstruierte Sommerfarbskalen (gemessen)", fontsize=11, loc="left")

    # Mitte: Skala B um die gefundene Verschiebung zurueckgeschoben —
    # die Naht verschwindet, die Skalen gehen ineinander ueber
    draw_bar(ax_shift, t_a, rgb_a, 0.0, 1.0)
    draw_bar(ax_shift, t_b - best_delta, rgb_b, 1.0, 2.0)
    ax_shift.set_yticks([0.5, 1.5])
    ax_shift.set_yticklabels([f"Sommer {y_a}", f"{y_b} − {best_delta:.2f} K"])
    ax_shift.set_title(f"Skala {y_b} um Δt* = {best_delta:+.2f} K verschoben", fontsize=11, loc="left")

    for ax in (ax_raw, ax_shift):
        ax.set_xlim(x_lo, x_hi)
        ax.set_ylim(-0.05, 2.05)
        ax.xaxis.set_major_locator(tck.MultipleLocator(5))
        ax.xaxis.set_minor_locator(tck.MultipleLocator(1))
        ax.grid(True, axis="x", which="major", linestyle=":", alpha=0.5)
    ax_shift.set_xlabel(f"Temperatur [°C] (Skala {y_a})")

    # unten: Aehnlichkeit ueber der Verschiebung
    ax_de.plot(deltas, mean_de, color="navy", linewidth=1.5)
    ax_de.axvline(best_delta, color="crimson", linestyle="--", linewidth=1.2)
    ax_de.plot([best_delta], [best_de], "o", color="crimson", zorder=5)
    ax_de.annotate(f"Δt* = {best_delta:+.2f} K\nmittl. ΔE00 = {best_de:.2f}",
                   xy=(best_delta, best_de), xytext=(10, 25),
                   textcoords="offset points", fontsize=10, color="crimson")
    ax_de.set_xlabel(f"Verschiebung Δt [K]  —  Vergleich {y_a}(t) mit {y_b}(t + Δt)")
    ax_de.set_ylabel("mittlerer ΔE00")
    ax_de.set_title("Aehnlichkeit der kontinuierlichen Skalen ueber der Verschiebung",
                    fontsize=11, loc="left")
    ax_de.grid(True, linestyle=":", alpha=0.5)

    Path(output_dir).mkdir(parents=True, exist_ok=True)
    plt.savefig(Path(output_dir) / filename, dpi=200, bbox_inches="tight")
    plt.close(fig)


def main():
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--nur-tag", action="store_true",
                        help="nur Tagestemperaturkarten verwenden (ohne Nachtkarten)")
    args = parser.parse_args()
    only_kind = "tag" if args.nur_tag else None
    suffix = "_tag" if args.nur_tag else ""
    if args.nur_tag:
        print("Datenbasis: nur Tagestemperaturkarten (tag-*)")

    per_file = load_per_file_rgb_map(PER_FILE_JSON)
    by_year = collect_summer_maps(per_file, only_kind=only_kind)

    years = sorted(by_year)
    if len(years) != 2:
        raise SystemExit(f"Erwarte genau zwei Sommer-Jahrgänge, gefunden: {years}")

    # kontinuierliche Sommerskala je Jahrgang rekonstruieren
    scales = {}
    for year in years:
        rgb_map = by_year[year]
        temps, scale_rgb = compute_color_scale(rgb_map)
        counts = np.array([len(rgb_map[int(t)]) for t in temps], dtype=float)
        t_fine, rgb_fine = fit_color_spline_lab(temps, scale_rgb, counts=counts)
        scales[year] = (t_fine, rgb_fine)
        plot_color_scale_bar(temps, scale_rgb, t_fine, rgb_fine,
                             output_dir=OUTPUT_DIR,
                             filename=f"farbskala_sommer_{year}{suffix}.png")
        print(f"  farbskala_sommer_{year}{suffix}.png geschrieben "
              f"({len(temps)} Stützpunkte, {int(temps.min())} bis {int(temps.max())} °C)")

    # Aehnlichkeit der kontinuierlichen Skalen fuer beliebige Verschiebungen
    (y_a, (t_a, rgb_a)), (y_b, (t_b, rgb_b)) = sorted(scales.items())
    deltas, mean_de = similarity_scan(t_a, lab_curve(t_a, rgb_a),
                                      t_b, lab_curve(t_b, rgb_b))

    valid = ~np.isnan(mean_de)
    i_best = int(np.nanargmin(mean_de))
    best_delta, best_de = float(deltas[i_best]), float(mean_de[i_best])
    de_zero = float(mean_de[np.argmin(np.abs(deltas))])

    print()
    print(f"Verschiebungs-Scan: Δt von {-DELTA_RANGE:g} bis {+DELTA_RANGE:g} K "
          f"in {DELTA_STEP:g}-K-Schritten, {int(valid.sum())} bewertete Verschiebungen "
          f"(Mindestüberlappung {MIN_OVERLAP:g} K)")
    print(f"  ohne Verschiebung (Δt = 0):     mittlerer ΔE00 = {de_zero:.2f}")
    print(f"  beste Übereinstimmung:          Δt* = {best_delta:+.2f} K, "
          f"mittlerer ΔE00 = {best_de:.2f}")
    print(f"  Lesart: die Farbe bei t °C der Sommerskala {y_a} liegt in der "
          f"Sommerskala {y_b} bei t {best_delta:+.2f} K.")

    plot_comparison(scales, deltas, mean_de, best_delta, best_de, OUTPUT_DIR,
                    filename=f"sommer_skalenvergleich{suffix}.png")
    print(f"  sommer_skalenvergleich{suffix}.png geschrieben")


if __name__ == "__main__":
    main()
