"""Wahrnehmungsbasierte Uniformitaetsanalyse der Beispielskalen.

Wendet die Kovesi-artige Analyse aus scale.py (Farbgradient je 1-°C-Schritt
in CIEDE2000, kumulative perzeptuelle Bogenlaenge, Helligkeitsverlauf L*)
auf alle Gradientenbilder gradient_2-38_*.png in skalenbeispiele/ an —
die vier extrahierten Redaktionsskalen ebenso wie die synthetischen
Viridis-Referenzen (siehe skalenbeispiele_extraktion.py).

Abgetastet wird an ganzzahligen Temperaturen 2 bis 38 °C. Bei Blockskalen
wird knapp rechts der Blockkante gemessen (Median ueber ein schmales
Fenster), damit der Wert t die Farbe des Blocks [t, t+Schrittweite)
bekommt und die dunklen Trennlinien mancher Leisten nicht einfliessen.
Bootstrap-Unsicherheiten entfallen — hinter den Gradientenbildern stehen
keine Einzelmessungen.

Aufruf (im Repo-Verzeichnis, venv):
    python skalenbeispiele_wahrnehmung.py
"""

from pathlib import Path

import numpy as np
from PIL import Image

from scale import (analyze_perceptual_uniformity, plot_perceptual_uniformity,
                   print_uniformity_report)

BASE = Path("./skalenbeispiele")
T_MIN, T_MAX = 2.0, 38.0

TITLES = {
    "moddeuhd": "Modellkarte meteocentre (1-K-Bloecke)",
    "dwd": "DWD (kontinuierlich)",
    "t-online": "t-online / Meteociel (2-K-Bloecke)",
    "wetteronline": "wetteronline (Blockskala)",
    "viridis": "Viridis (Referenz, perzeptiv uniform)",
    "plasma": "Plasma (Referenz, perzeptiv uniform)",
    "inferno": "Inferno (Referenz, perzeptiv uniform)",
    "magma": "Magma (Referenz, perzeptiv uniform)",
    "cividis": "Cividis (Referenz, perzeptiv uniform)",
    "tagesschau": "Tagesschau rekonstruiert (Ausgleichskurve)",
    "tagesschau-linear": "Tagesschau, wahrnehmungslinear",
    "tagesschau-linear-monoton": "Tagesschau, wahrnehmungslinear + L* monoton",
    "tagesschau-linear-monoton-glatt": "Tagesschau, wahrnehmungslinear + L* monoton, glatt",
    "tagesschau-linear-lkonstant": "Tagesschau, wahrnehmungslinear + L* konstant fallend",
}


def sample_gradient(path: Path) -> tuple:
    """Tastet ein Gradientenbild an ganzzahligen Temperaturen ab.

    Args:
        path: Gradientenbild (Breite = Temperaturachse T_MIN..T_MAX).

    Returns:
        Tupel (temps, rgb): ganzzahlige Temperaturen und (N, 3)-Farben.
    """
    img = np.array(Image.open(path).convert("RGB")).astype(float)
    strip = np.median(img, axis=0)
    n = strip.shape[0]

    temps = np.arange(T_MIN, T_MAX + 1e-9)
    rgb = np.empty((len(temps), 3))
    for i, t in enumerate(temps):
        # knapp rechts der (moeglichen) Blockkante messen, Median gegen
        # die Trennlinien der Blockskalen
        c0 = int(np.ceil((t - T_MIN) / (T_MAX - T_MIN) * (n - 1)))
        cols = np.clip(np.arange(c0 + 2, c0 + 10), 0, n - 1)
        rgb[i] = np.median(strip[cols], axis=0)
    return temps, rgb


def main():
    files = sorted(BASE.glob("gradient_2-38_*.png"))
    if not files:
        raise SystemExit("keine gradient_2-38_*.png in skalenbeispiele/ gefunden")

    for path in files:
        name = path.stem.replace("gradient_2-38_", "")
        title = TITLES.get(name, name)
        temps, rgb = sample_gradient(path)

        result = analyze_perceptual_uniformity(temps, rgb, rgb_map=None)
        print_uniformity_report(result, f"Skala {name} — {title}")

        filename = f"wahrnehmung_uniformitaet_{name}.png"
        plot_perceptual_uniformity(
            result, temps, rgb, output_dir=str(BASE), filename=filename,
            title=f"Wahrnehmungsbasierte Uniformitätsanalyse — {title}")
        print(f"  {filename} geschrieben")


if __name__ == "__main__":
    main()
