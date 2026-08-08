"""Extrahiert die Farbskalen aus den Beispielkarten in skalenbeispiele/.

Jede Karte enthaelt irgendwo im Bild eine Farbskala (Legende). Die Lage der
Leiste und die Zuordnung Pixel -> Temperatur wurden je Quelle manuell
kalibriert (Blockkanten bzw. Beschriftungspositionen, siehe ANCHORS).
Fuer jede Quelle wird der gemeinsame Bereich 2 bis 38 °C abgetastet und als
reines Gradientenbild (800 x 200 px, PNG) gespeichert. Die Abtastung ist
pixelgenau (nearest neighbour): diskrete Blockskalen bleiben gestuft,
kontinuierliche Verlaeufe bleiben kontinuierlich.

Kalibrierung je Quelle:
  * moddeuhd (meteocentre): horizontale Leiste y 670-688, Beschriftung
    unter der Leiste; Anker = Textzentren der Zahlen (-3 bis 39 linear,
    ~9.2 px/°C, Raender nichtlinear — fuer 2-38 °C irrelevant).
  * DWD: vertikale Leiste x 1820-1890, y 86-372; Labelzentren 38 °C bei
    y=84 und 2 °C bei y=372 (8 px/°C), oben/unten auf den Balken geklemmt.
  * t-online (meteociel): horizontale Blockleiste y 521-527, Bloecke
    14.35 px = 2 K, linke Kante x=28.4 entspricht -16 °C (Querprobe:
    Label "16" sitzt auf der berechneten Kante).
  * wetteronline: horizontale Leiste y 16-21 (nur 7 px hoch, obere von
    zwei identischen Leisten), Beschriftung -20 bis 40 aequidistant
    darunter; linearer Fit ueber die Labelzentren.

Zusaetzlich werden synthetische Referenzskalen aus der Viridis-Familie
(matplotlib: viridis, plasma, inferno, magma, cividis) im selben Format
erzeugt — perzeptiv uniforme Colormaps, linear ueber 2-38 °C abgebildet.

Ebenfalls dabei: drei Varianten der rekonstruierten Tagesschau-Skala
(aggregierte Messwerte + CIELAB-Glaettungsspline wie in scale.py):
  * tagesschau: die kontinuierliche Ausgleichskurve, Ausschnitt 2-38 °C;
  * tagesschau-linear: dieselben Farben, aber wahrnehmungslinear
    umparametrisiert (konstante ΔE00-Rate je Kelvin, wie linearize()
    in dwd_linear_vergleich.py);
  * tagesschau-linear-monoton: zusaetzlich L* per Pool-Adjacent-
    Violators auf Monotonie gezwungen (a*/b* bleiben erhalten),
    anschliessend erneut wahrnehmungslinear umparametrisiert;
  * tagesschau-linear-monoton-glatt: wie -monoton, aber mit stetig
    differenzierbarem L*-Verlauf: das monotone L*-Profil wird mit einem
    breiten Gauss-Kern geglaettet (der Knick der PAVA-Loesung
    verschwindet, Monotonie und Mindestgefaelle bleiben erhalten) und
    im Wechsel mit der ΔE00-Linearisierung iteriert, bis beide
    Eigenschaften nahezu exakt gelten;
  * tagesschau-linear-lkonstant: L* faellt exakt linear (konstante
    Rate) zwischen den Endpunkten; gleiches Iterationsschema mit einer
    L*-Rampe als Ziel.

Aufruf (im Repo-Verzeichnis, venv):
    python skalenbeispiele_extraktion.py
"""

from pathlib import Path

import colour
import matplotlib
import numpy as np
from PIL import Image

from scale import load_rgb_map, compute_color_scale, fit_color_spline_lab

BASE = Path("./skalenbeispiele")
T_MIN, T_MAX = 2.0, 38.0
OUT_W, OUT_H = 800, 200

# moddeuhd: Textzentren der Beschriftung (Temperatur -> x-Pixel)
MODDEUHD_ANCHORS = [
    (-3, 305.9), (0, 334.0), (3, 361.0), (6, 389.0), (9, 417.0),
    (12, 445.4), (15, 473.1), (18, 501.1), (21, 526.6), (24, 555.5),
    (27, 583.0), (30, 611.0), (33, 638.5), (36, 666.5), (39, 694.0),
]

# wetteronline: Labelzentren (Temperatur -> x-Pixel), linearer Fit im Code
WETTERONLINE_ANCHORS = [
    (-20, 271.0), (-10, 305.3), (0, 339.7), (10, 376.0),
    (20, 408.0), (30, 443.0), (40, 474.5),
]


def sample_horizontal(img: np.ndarray, y0: int, y1: int,
                      t_anchor: np.ndarray, x_anchor: np.ndarray) -> np.ndarray:
    """Tastet eine horizontale Leiste entlang der Temperaturachse ab.

    Args:
        img: Bildarray (H, W, 3).
        y0, y1: Zeilenbereich der Leiste (Median ueber die Zeilen).
        t_anchor: Ankertemperaturen (aufsteigend).
        x_anchor: zugehoerige x-Pixelpositionen.

    Returns:
        (OUT_W, 3)-Array der Farben fuer T_MIN..T_MAX.
    """
    strip = np.median(img[y0:y1].astype(float), axis=0)
    t = np.linspace(T_MIN, T_MAX, OUT_W)
    x = np.interp(t, t_anchor, x_anchor)
    return strip[np.clip(np.round(x).astype(int), 0, strip.shape[0] - 1)]


def sample_vertical(img: np.ndarray, x0: int, x1: int,
                    t_anchor: np.ndarray, y_anchor: np.ndarray,
                    y_clip: tuple) -> np.ndarray:
    """Tastet eine vertikale Leiste entlang der Temperaturachse ab.

    Args:
        img: Bildarray (H, W, 3).
        x0, x1: Spaltenbereich der Leiste (Median ueber die Spalten).
        t_anchor: Ankertemperaturen (aufsteigend).
        y_anchor: zugehoerige y-Pixelpositionen.
        y_clip: (oben, unten) — Balkengrenzen, auf die geklemmt wird.

    Returns:
        (OUT_W, 3)-Array der Farben fuer T_MIN..T_MAX.
    """
    strip = np.median(img[:, x0:x1].astype(float), axis=1)
    t = np.linspace(T_MIN, T_MAX, OUT_W)
    y = np.interp(t, t_anchor, y_anchor)
    y = np.clip(np.round(y).astype(int), y_clip[0], y_clip[1])
    return strip[y]


def to_lab(rgb255: np.ndarray) -> np.ndarray:
    """sRGB (0-255) -> CIELAB."""
    return colour.XYZ_to_Lab(colour.sRGB_to_XYZ(np.clip(rgb255 / 255.0, 0, 1)))


def to_rgb255(lab: np.ndarray) -> np.ndarray:
    """CIELAB -> sRGB (0-255, in den Farbraum geklemmt)."""
    return np.clip(colour.XYZ_to_sRGB(colour.Lab_to_XYZ(lab)), 0, 1) * 255.0


def linearize_colors(colors: np.ndarray) -> np.ndarray:
    """Parametrisiert eine Farbreihe auf konstante ΔE00-Rate um.

    Die kumulative CIEDE2000-Bogenlaenge der Reihe wird berechnet und
    invertiert: Position i der Ausgabe traegt die Farbe, bei der die
    Eingabe den Anteil i/(N-1) ihrer Gesamtbogenlaenge erreicht hat.
    Farbfolge und Endpunkte bleiben erhalten.

    Args:
        colors: (N, 3)-Farbreihe (0-255, sRGB).

    Returns:
        (N, 3)-Farbreihe mit konstanter ΔE00-Rate je Schritt.
    """
    lab = to_lab(colors)
    de = colour.delta_E(lab[:-1], lab[1:], method="CIE 2000")
    s = np.concatenate([[0.0], np.cumsum(de)])
    s_norm = s / s[-1]

    idx = np.arange(len(colors), dtype=float)
    frac = idx / idx[-1]
    src = np.interp(frac, s_norm, idx)
    return np.stack([np.interp(src, idx, colors[:, ch]) for ch in range(3)], axis=1)


def monotonize_lightness(colors: np.ndarray, min_slope: float = 0.0) -> np.ndarray:
    """Erzwingt einen monotonen L*-Verlauf (Pool-Adjacent-Violators).

    Die Richtung (steigend/fallend) folgt den Endpunkten der Reihe.
    a* und b* bleiben unveraendert; das Ergebnis wird in den
    sRGB-Farbraum geklemmt. Mit min_slope > 0 wird strikte Monotonie
    erzwungen (PAVA auf die um eine Rampe reduzierten Werte): L* faellt
    bzw. steigt dann ueberall um mindestens min_slope je Schritt — sonst
    entstehen exakt flache Plateaus, deren 8-Bit-Quantisierung im
    gespeicherten Bild als Scheinverletzung der Monotonie zurueckkommt.

    Args:
        colors: (N, 3)-Farbreihe (0-255, sRGB).
        min_slope: Mindestaenderung von L* je Schritt (>= 0).

    Returns:
        (N, 3)-Farbreihe mit monotonem L*.
    """
    lab = to_lab(colors)
    L = lab[:, 0].copy()
    sign = 1.0 if L[-1] >= L[0] else -1.0
    ramp = min_slope * np.arange(len(L))
    y = sign * L - ramp

    # PAVA: isotone Regression (nicht fallend) mit gleichen Gewichten
    vals = list(y)
    cnts = [1] * len(y)
    i = 0
    while i < len(vals) - 1:
        if vals[i] > vals[i + 1] + 1e-12:
            merged = (vals[i] * cnts[i] + vals[i + 1] * cnts[i + 1]) / (cnts[i] + cnts[i + 1])
            vals[i:i + 2] = [merged]
            cnts[i:i + 2] = [cnts[i] + cnts[i + 1]]
            if i > 0:
                i -= 1
        else:
            i += 1
    L_mono = sign * (np.repeat(vals, cnts) + ramp)

    lab[:, 0] = L_mono
    return to_rgb255(lab)


def smooth_lightness_profile(L: np.ndarray, sigma: float) -> np.ndarray:
    """Glaettet ein monotones L*-Profil mit einem Gauss-Kern.

    Die Faltung mit einem positiven Kern erhaelt die Monotonie (und ein
    vorhandenes Mindestgefaelle); die Raender werden vor der Faltung mit
    der jeweiligen Endsteigung linear extrapoliert, damit der Verlauf
    dort nicht abflacht. Ergebnis ist ein glatter (stetig
    differenzierbarer) Verlauf ohne die Knicke der PAVA-Loesung.

    Args:
        L: L*-Profil (monoton).
        sigma: Kernbreite in Abtastschritten.

    Returns:
        Geglaettetes L*-Profil gleicher Laenge.
    """
    n_pad = int(4 * sigma)
    slope_lo = L[1] - L[0]
    slope_hi = L[-1] - L[-2]
    pad_lo = L[0] + slope_lo * np.arange(-n_pad, 0)
    pad_hi = L[-1] + slope_hi * np.arange(1, n_pad + 1)
    ext = np.concatenate([pad_lo, L, pad_hi])

    x = np.arange(-n_pad, n_pad + 1)
    kern = np.exp(-0.5 * (x / sigma) ** 2)
    kern /= kern.sum()
    return np.convolve(ext, kern, mode="valid")


def save_gradient(colors: np.ndarray, out_path: Path) -> None:
    """Speichert eine Farbreihe als OUT_W x OUT_H Gradientenbild.

    Args:
        colors: (OUT_W, 3)-Array (0-255).
        out_path: Zieldatei (PNG).
    """
    band = np.clip(colors, 0, 255).astype(np.uint8)[np.newaxis, :, :]
    img = np.repeat(band, OUT_H, axis=0)
    Image.fromarray(img).save(out_path)
    print(f"  {out_path} geschrieben ({OUT_W}x{OUT_H}, {T_MIN:g}-{T_MAX:g} °C)")


def main():
    # moddeuhd: horizontale 1-K-Blockleiste
    img = np.array(Image.open(BASE / "model_moddeuhd_2026052306_4_2_1.png").convert("RGB"))
    ta, xa = map(np.array, zip(*MODDEUHD_ANCHORS))
    save_gradient(sample_horizontal(img, 672, 685, ta, xa),
                  BASE / "gradient_2-38_moddeuhd.png")

    # DWD: vertikale kontinuierliche Leiste (38 °C oben, 2 °C unten)
    img = np.array(Image.open(BASE / "scale_dwd.webp").convert("RGB"))
    save_gradient(sample_vertical(img, 1825, 1885,
                                  np.array([2.0, 38.0]), np.array([372.0, 84.0]),
                                  y_clip=(86, 372)),
                  BASE / "gradient_2-38_dwd.png")

    # t-online: horizontale 2-K-Blockleiste, linke Kante -16 °C
    img = np.array(Image.open(BASE / "scale-t-online.webp").convert("RGB"))
    block_w, x_left = 14.35, 28.4
    ta = np.array([-16.0, 52.0])
    xa = np.array([x_left, x_left + (52.0 - -16.0) / 2.0 * block_w])
    save_gradient(sample_horizontal(img, 521, 528, ta, xa),
                  BASE / "gradient_2-38_t-online.png")

    # wetteronline: horizontale Leiste, linearer Fit ueber die Labelzentren
    img = np.array(Image.open(BASE / "scale_wetter-online.png").convert("RGB"))
    ta, xa = map(np.array, zip(*WETTERONLINE_ANCHORS))
    b, a = np.polyfit(ta, xa, 1)
    t_lin = np.array([T_MIN, T_MAX])
    save_gradient(sample_horizontal(img, 16, 21, t_lin, a + b * t_lin),
                  BASE / "gradient_2-38_wetteronline.png")

    # synthetische Referenzskalen: Viridis-Familie, linear ueber 2-38 °C
    frac = np.linspace(0.0, 1.0, OUT_W)
    for name in ("viridis", "plasma", "inferno", "magma", "cividis"):
        colors = matplotlib.colormaps[name](frac)[:, :3] * 255.0
        save_gradient(colors, BASE / f"gradient_2-38_{name}.png")

    # rekonstruierte Tagesschau-Skala (Ausgleichskurve), Ausschnitt 2-38 °C
    rgb_map = load_rgb_map("./output_2025-2026/aggregated_rgb_map.json")
    temps, scale_rgb = compute_color_scale(rgb_map)
    counts = np.array([len(rgb_map[int(t)]) for t in temps], dtype=float)
    t_fine, rgb_fine = fit_color_spline_lab(temps, scale_rgb, counts=counts)
    if t_fine.min() > T_MIN or t_fine.max() < T_MAX:
        raise SystemExit(f"rekonstruierte Skala deckt {T_MIN}-{T_MAX} °C nicht ab "
                         f"({t_fine.min():.1f}-{t_fine.max():.1f})")
    t = np.linspace(T_MIN, T_MAX, OUT_W)
    ts_colors = np.stack([np.interp(t, t_fine, rgb_fine[:, ch]) for ch in range(3)], axis=1)
    save_gradient(ts_colors, BASE / "gradient_2-38_tagesschau.png")

    # dieselben Farben, wahrnehmungslinear ueber 2-38 °C
    ts_linear = linearize_colors(ts_colors)
    save_gradient(ts_linear, BASE / "gradient_2-38_tagesschau-linear.png")

    # zusaetzlich monotones L* (mindestens 0.4 L* je Kelvin, damit keine
    # exakt flachen Plateaus entstehen), danach erneut wahrnehmungslinear.
    # Iteriert, weil die sRGB-Gamut-Klemmung das Ziel-L* lokal wieder
    # absenken kann — nach wenigen Durchlaeufen konvergiert das Profil.
    slope_per_sample = 0.4 * (T_MAX - T_MIN) / (OUT_W - 1)
    ts_mono = ts_linear
    for _ in range(4):
        ts_mono = monotonize_lightness(ts_mono, min_slope=slope_per_sample)
    ts_mono = linearize_colors(ts_mono)
    save_gradient(ts_mono, BASE / "gradient_2-38_tagesschau-linear-monoton.png")

    # Variante mit stetig differenzierbarem L*: monotones Profil glaetten
    # (sigma ~ 2.7 K) und als festes Ziel im Wechsel mit der
    # ΔE00-Linearisierung einpraegen
    L_target = smooth_lightness_profile(to_lab(ts_mono)[:, 0], sigma=60.0)
    ts_glatt = ts_mono
    for _ in range(5):
        ts_glatt = linearize_colors(ts_glatt)
        lab = to_lab(ts_glatt)
        lab[:, 0] = L_target
        ts_glatt = to_rgb255(lab)
    save_gradient(ts_glatt, BASE / "gradient_2-38_tagesschau-linear-monoton-glatt.png")

    # Variante mit exakt linear fallendem L*: Rampe zwischen den
    # Endpunkten als festes Ziel, gleiches Iterationsschema
    lab = to_lab(ts_mono)
    L_ramp = np.linspace(lab[0, 0], lab[-1, 0], len(ts_mono))
    ts_lkonst = ts_mono
    for _ in range(5):
        ts_lkonst = linearize_colors(ts_lkonst)
        lab = to_lab(ts_lkonst)
        lab[:, 0] = L_ramp
        ts_lkonst = to_rgb255(lab)
    save_gradient(ts_lkonst, BASE / "gradient_2-38_tagesschau-linear-lkonstant.png")


if __name__ == "__main__":
    main()
