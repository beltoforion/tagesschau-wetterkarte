"""Wahrnehmungsbasierte Uniformitaetsanalyse der Sommerskalen 2025/2026.

Wendet die Kovesi-artige Analyse aus scale.py (Farbgradient je 1-°C-Schritt
in CIEDE2000 mit Bootstrap-Unsicherheit, kumulative perzeptuelle
Bogenlaenge, Helligkeitsverlauf L*, Metrikvergleich dE76/dE00/CAM16-UCS)
getrennt auf die beiden Sommerskalen an — analog zur Gesamtjahres-Grafik
wahrnehmung_uniformitaet.png, aber je Jahrgang nur mit den Karten des
meteorologischen Sommers.

Datenbasis sind die gemessenen Skalenpunkte (Median je Grad), nicht die
Ausgleichskurve — die Bootstrap-Fehlerbalken kommen aus den
Einzelmessungen je Temperatur. Mit --geglaettet wird stattdessen die
Ausgleichskurve (robuster Glaettungsspline im CIELAB-Raum, wie in
sommerskalen.py) an ganzzahligen Temperaturen abgetastet und analysiert;
Bootstrap entfaellt dann, weil hinter den Kurvenpunkten keine
Einzelmessungen stehen (analog wahrnehmung_uniformitaet_fit.png).

Aufruf (im Repo-Verzeichnis, venv):
    python sommer_wahrnehmung.py                        # Messpunkte, Tag+Nacht
    python sommer_wahrnehmung.py --nur-tag              # Messpunkte, nur Tagkarten
    python sommer_wahrnehmung.py --nur-tag --geglaettet # Ausgleichskurve, nur Tagkarten
"""

import argparse

import numpy as np

from scale import (load_per_file_rgb_map, compute_color_scale,
                   fit_color_spline_lab, analyze_perceptual_uniformity,
                   plot_perceptual_uniformity, print_uniformity_report)
from sommerskalen import PER_FILE_JSON, OUTPUT_DIR, collect_summer_maps


def sample_spline_at_integers(t_fine: np.ndarray, rgb_fine: np.ndarray
                              ) -> tuple:
    """Tastet die Ausgleichskurve an ganzzahligen Temperaturen ab.

    Args:
        t_fine: Temperaturraster der Ausgleichskurve.
        rgb_fine: (M, 3)-Array der Kurvenpunkte (0-255, sRGB).

    Returns:
        Tupel (temps, rgb): ganzzahlige Temperaturen im Gueltigkeitsbereich
        der Kurve und die dort interpolierten Farben.
    """
    temps = np.arange(np.ceil(t_fine.min()), np.floor(t_fine.max()) + 1e-9)
    rgb = np.stack([np.interp(temps, t_fine, rgb_fine[:, ch])
                    for ch in range(3)], axis=1)
    return temps, rgb


def main():
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--nur-tag", action="store_true",
                        help="nur Tagestemperaturkarten verwenden (ohne Nachtkarten)")
    parser.add_argument("--geglaettet", action="store_true",
                        help="Ausgleichskurve statt der gemessenen Skalenpunkte analysieren")
    args = parser.parse_args()
    only_kind = "tag" if args.nur_tag else None
    suffix = "_tag" if args.nur_tag else ""
    basis = "nur Tagestemperaturkarten" if args.nur_tag else "Tag- und Nachtkarten"
    if args.nur_tag:
        print("Datenbasis: nur Tagestemperaturkarten (tag-*)")

    per_file = load_per_file_rgb_map(PER_FILE_JSON)
    by_year = collect_summer_maps(per_file, only_kind=only_kind)

    for year in sorted(by_year):
        rgb_map = by_year[year]
        temps, scale_rgb = compute_color_scale(rgb_map)

        if args.geglaettet:
            counts = np.array([len(rgb_map[int(t)]) for t in temps], dtype=float)
            t_fine, rgb_fine = fit_color_spline_lab(temps, scale_rgb, counts=counts)
            temps, scale_rgb = sample_spline_at_integers(t_fine, rgb_fine)
            rgb_map = None  # Kurvenpunkte sind keine Messwerte — kein Bootstrap
            variante = "geglättete Skala"
        else:
            variante = "gemessene Skalenpunkte"

        result = analyze_perceptual_uniformity(temps, scale_rgb, rgb_map=rgb_map)
        print_uniformity_report(result, f"Sommerskala {year} ({basis}, {variante})")

        fit_tag = "_fit" if args.geglaettet else ""
        filename = f"wahrnehmung_uniformitaet_sommer_{year}{fit_tag}{suffix}.png"
        plot_perceptual_uniformity(
            result, temps, scale_rgb, output_dir=OUTPUT_DIR, filename=filename,
            title=(f"Wahrnehmungsbasierte Uniformitätsanalyse — "
                   f"Sommerskala {year} ({basis}, {variante})"))
        print(f"  {filename} geschrieben")


if __name__ == "__main__":
    main()
