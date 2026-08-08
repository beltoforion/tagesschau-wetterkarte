"""Uniformitaetsanalyse der interpolierten Sommerfarbskalen 2025/2026.

Fuer beide kontinuierlichen Sommerskalen (Datenbasis: Tag- und Nachtkarten
des meteorologischen Sommers, Rekonstruktion wie in sommerskalen.py) wird
der lokale Farbabstand pro Grad bestimmt: an jeder Stelle t wird der
CIEDE2000-Abstand zwischen s(t - 0.5 K) und s(t + 0.5 K) berechnet — also
der wahrgenommene Farbunterschied, den ein Temperaturschritt von 1 K an
dieser Stelle der Skala erzeugt.

Eine perzeptiv uniforme Skala haette eine konstante Kurve; Spitzen zeigen
Temperaturbereiche, in denen die Farbe schnell umschlaegt, Taeler zeigen
Bereiche, in denen benachbarte Temperaturen kaum unterscheidbar sind.

Aufruf (im Repo-Verzeichnis, venv):
    python sommer_uniformitaet.py            # Tag- und Nachtkarten
    python sommer_uniformitaet.py --nur-tag  # nur Tagestemperaturkarten
"""

import argparse
from pathlib import Path

import colour
import matplotlib.pyplot as plt
import matplotlib.ticker as tck
import numpy as np

from scale import load_per_file_rgb_map, compute_color_scale, fit_color_spline_lab
from sommerskalen import PER_FILE_JSON, OUTPUT_DIR, collect_summer_maps, lab_curve

# Fensterbreite des lokalen Farbabstands (1 K => "Delta-E pro Grad")
WINDOW = 1.0
# Schrittweite des Auswerterasters
STEP = 0.1


def uniformity_profile(t_fine: np.ndarray, rgb_fine: np.ndarray):
    """Berechnet den lokalen Farbabstand pro Grad entlang der Skala.

    Args:
        t_fine: Temperaturraster der Ausgleichskurve.
        rgb_fine: (M, 3)-Array der Kurvenpunkte (0-255, sRGB).

    Returns:
        Tupel (t, de): Auswertetemperaturen (Fenstermitten) und der
        CIEDE2000-Abstand ueber das 1-K-Fenster um die jeweilige Stelle.
    """
    lab = lab_curve(t_fine, rgb_fine)
    half = WINDOW / 2.0
    t = np.arange(t_fine.min() + half, t_fine.max() - half + 1e-9, STEP)
    de = colour.delta_E(lab(t - half), lab(t + half), method="CIE 2000")
    return t, de


def plot_uniformity(profiles: dict, scales: dict, output_dir: str,
                    filename: str = "sommer_uniformitaet.png") -> None:
    """Zeichnet die Uniformitaetsprofile beider Sommerskalen.

    Je Jahrgang ein Panel: oben das Farbband der Skala, darunter die
    Kurve des lokalen dE00 pro Grad mit Mittelwertlinie.

    Args:
        profiles: Jahr -> (t, de) aus uniformity_profile().
        scales: Jahr -> (t_fine, rgb_fine) der kontinuierlichen Skalen.
        output_dir: Ausgabeverzeichnis.
        filename: Dateiname der Grafik.
    """
    years = sorted(profiles)
    x_lo = min(scales[y][0].min() for y in years) - 1
    x_hi = max(scales[y][0].max() for y in years) + 1
    de_hi = 1.1 * max(profiles[y][1].max() for y in years)

    fig, axes = plt.subplots(2, len(years), figsize=(7 * len(years), 5.5),
                             height_ratios=[0.18, 1.0], sharex=True,
                             constrained_layout=True)
    axes = np.atleast_2d(axes)

    for col, year in enumerate(years):
        t_fine, rgb_fine = scales[year]
        t, de = profiles[year]
        mean_de = float(np.mean(de))

        ax_bar = axes[0, col]
        gradient = np.clip(rgb_fine / 255.0, 0, 1)[np.newaxis, :, :]
        ax_bar.imshow(gradient, aspect="auto", interpolation="bilinear",
                      extent=(float(t_fine.min()), float(t_fine.max()), 0, 1))
        ax_bar.set_yticks([])
        ax_bar.set_title(f"Sommerskala {year}", fontsize=11, loc="left")

        ax = axes[1, col]
        ax.plot(t, de, color="navy", linewidth=1.5)
        ax.axhline(mean_de, color="crimson", linestyle="--", linewidth=1.0,
                   label=f"Mittel: {mean_de:.2f}")
        i_max, i_min = int(np.argmax(de)), int(np.argmin(de))
        ax.plot([t[i_max]], [de[i_max]], "^", color="darkorange", zorder=5,
                label=f"Max: {de[i_max]:.2f} bei {t[i_max]:.1f} °C")
        ax.plot([t[i_min]], [de[i_min]], "v", color="seagreen", zorder=5,
                label=f"Min: {de[i_min]:.2f} bei {t[i_min]:.1f} °C")
        ax.set_xlim(x_lo, x_hi)
        ax.set_ylim(0, de_hi)
        ax.xaxis.set_major_locator(tck.MultipleLocator(5))
        ax.xaxis.set_minor_locator(tck.MultipleLocator(1))
        ax.grid(True, linestyle=":", alpha=0.5)
        ax.set_xlabel("Temperatur [°C]")
        ax.legend(loc="upper left", fontsize=9)
        if col == 0:
            ax.set_ylabel("ΔE00 pro 1 K")

    fig.suptitle("Uniformitaet der interpolierten Sommerskalen: "
                 "lokaler Farbabstand pro Grad (CIEDE2000)", fontsize=12)

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

    scales, profiles = {}, {}
    print()
    for year in sorted(by_year):
        rgb_map = by_year[year]
        temps, scale_rgb = compute_color_scale(rgb_map)
        counts = np.array([len(rgb_map[int(t)]) for t in temps], dtype=float)
        t_fine, rgb_fine = fit_color_spline_lab(temps, scale_rgb, counts=counts)
        scales[year] = (t_fine, rgb_fine)

        t, de = uniformity_profile(t_fine, rgb_fine)
        profiles[year] = (t, de)

        mean_de, std_de = float(np.mean(de)), float(np.std(de))
        i_max, i_min = int(np.argmax(de)), int(np.argmin(de))
        print(f"Sommerskala {year} ({t_fine.min():.0f} bis {t_fine.max():.0f} °C):")
        print(f"  ΔE00 pro 1 K: Mittel {mean_de:.2f}, Streuung {std_de:.2f}, "
              f"Variationskoeffizient {std_de / mean_de:.2f}")
        print(f"  am steilsten: {de[i_max]:.2f} bei {t[i_max]:.1f} °C")
        print(f"  am flachsten: {de[i_min]:.2f} bei {t[i_min]:.1f} °C "
              f"(Kontrastverhältnis Max/Min = {de[i_max] / de[i_min]:.1f})")

    plot_uniformity(profiles, scales, OUTPUT_DIR,
                    filename=f"sommer_uniformitaet{suffix}.png")
    print(f"\n  sommer_uniformitaet{suffix}.png geschrieben")


if __name__ == "__main__":
    main()
