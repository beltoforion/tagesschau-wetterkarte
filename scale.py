"""Extraktion der Temperatur-Farbskala aus Tagesschau-Wetterkarten.

Ablauf:
  1. Per OCR (easyocr) werden die Temperaturzahlen auf den Wetterkarten erkannt.
  2. Direkt neben jeder erkannten Zahl wird die Kartenfarbe abgetastet.
  3. Die Zuordnung Temperatur -> RGB wird ueber alle Bilder aggregiert und als
     JSON-Datei (aggregated_rgb_map.json) gespeichert bzw. daraus geladen.
  4. Aus den aggregierten Daten wird die Farbskala berechnet (Median je Grad)
     und eine Ausgleichskurve (Glaettungsspline im CIELAB-Raum) durch die
     Punkte gelegt.
  5. Visualisierung: CIE-1931-Chromatizitaetsdiagramm sowie 3D-RGB-Diagramm
     mit allen Messpunkten und der Ausgleichskurve.
"""

import cv2
import os
import numpy as np
import easyocr
import json
import matplotlib.pyplot as plt
import matplotlib.ticker as tck
import matplotlib.patheffects as pe
import colour
import colour.plotting as cl

from cv2.typing import MatLike
from typing import Dict, List, Tuple
from collections import defaultdict
from mpl_toolkits.mplot3d.art3d import Line3DCollection
from pathlib import Path


def detect_temp_values(img: np.ndarray, box_scale: float = 0.8) -> List[dict]:
    """Erkennt die Temperaturzahlen auf einer Wetterkarte per OCR.

    Das Bild wird fuer die Erkennung auf die doppelte Groesse hochskaliert
    (easyocr arbeitet damit zuverlaessiger), die gefundenen Boxen werden
    anschliessend in die Originalkoordinaten zurueckgerechnet.

    Gefiltert wird auf ganze Zahlen im plausiblen Temperaturbereich; bekannte
    Fehlerkennungen (ARD-Logo, Bulletpoints vor Staedtenamen) werden verworfen.

    Args:
        img: Eingabebild (BGR oder Graustufen).
        box_scale: Faktor, um den jede Box um ihren Mittelpunkt verkleinert
            wird. Kleinere Boxen liegen enger an den Ziffern und verbessern
            das anschliessende Farbsampling am Boxrand.

    Returns:
        Liste von Boxen als dict mit den Schluesseln
        "text", "x", "y", "w", "h", "conf".
    """
    g = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY) if img.ndim == 3 else img.astype(np.uint8, copy=False)
    H, W = g.shape[:2]

    scale = 2.0
    g_up = cv2.resize(g, None, fx=scale, fy=scale, interpolation=cv2.INTER_LINEAR)
    rgb = cv2.cvtColor(g_up, cv2.COLOR_GRAY2RGB)

    reader = easyocr.Reader(['en'], gpu=False, verbose=False)
    results = reader.readtext(rgb, detail=1, paragraph=False, min_size=5, low_text=0.3, text_threshold=0.5)

    boxes = []
    for bbox, text, score in results:
        # verschiedene Unicode-Minuszeichen vereinheitlichen
        t = (text or "").strip().replace("−", "-").replace("–", "-").replace("—", "-")
        if not (t.isdigit() or (t.startswith("-") and t[1:].isdigit())):
            continue
        try:
            val = int(t)
        except ValueError:
            continue

        # Wert ignorieren, wenn er außerhalb eines realistischen Bereichs liegt
        if not (-30 <= val <= 45):
            continue

        # Wert ignorieren wenn der scorewert zu niedrig ist
        if score < 0.3:
            continue

        xs = [p[0] for p in bbox]; ys = [p[1] for p in bbox]
        x1, y1, x2, y2 = int(min(xs)), int(min(ys)), int(max(xs)), int(max(ys))
        w_up, h_up = x2 - x1, y2 - y1

        # unplausibel geformte Boxen (zu breit fuer max. 3 Zeichen) verwerfen
        if w_up <= 0 or h_up <= 0 or w_up > 2.5 * h_up:
            continue

        # Box in die Koordinaten des Originalbilds zurueckrechnen
        x = int(x1 / scale)
        y = int(y1 / scale)
        w = int(w_up / scale)
        h = int(h_up / scale)

        # Mittelpunkt der Box
        cx = x + w / 2.0
        cy = y + h / 2.0

        # Box filtern, wenn sie zu nah in der oberen rechten ecke des Bildes liegt. Dort ist das
        # ard senderlogo, das wird gelegentlich als "0" erkannt.
        if cx > 0.85 * W and cy < 0.25 * H:
            continue

        # Boxgröße im verhältniss zum Bild prüfen. Sehr kleine Boxen ignorieren
        # Es gibt in den Bildern Bulletpoints vor Städtenamen, die gelegentlich als "0" erkannt werden.
        area_perc = (w * h) / (W * H)
        if t == "0" and area_perc < 0.0004:
            continue

        # Box um ihren Mittelpunkt herum verkleinern
        if box_scale != 1.0:
            nw = max(1, int(round(w * box_scale)))
            nh = max(1, int(round(h * box_scale)))
            x = int(round(cx - nw / 2.0))
            y = int(round(cy - nh / 2.0))
            w, h = nw, nh

            # auf Bildgrenzen beschraenken
            if x < 0:
                w += x; x = 0

            if y < 0:
                h += y; y = 0

            if x + w > W:
                w = max(1, W - x)

            if y + h > H:
                h = max(1, H - y)

            if w <= 0 or h <= 0:
                continue

        boxes.append({"text": t, "x": x, "y": y, "w": w, "h": h, "conf": float(score)})

    boxes.sort(key=lambda b: (b["y"] // 10, b["x"]))
    return boxes


def sample_box_rgb(orig_img: np.ndarray, b: dict, offset: int = 0, samples: int = 5) -> Tuple[float, float, float]:
    """Misst die Kartenfarbe direkt neben einer Textbox.

    Da die Ziffern selbst weiss sind, wird nicht innerhalb der Box gemessen,
    sondern an deren linkem und rechtem Aussenrand: dort werden je `samples`
    vertikal verteilte Pixel abgetastet und gemittelt.

    Args:
        orig_img: Original-Wetterkarte (BGR).
        b: Box-Dict aus detect_temp_values().
        offset: Horizontaler Abstand der Messpunkte zum Boxrand in Pixeln.
        samples: Anzahl Messpunkte je Seite.

    Returns:
        Mittlere Farbe als (R, G, B)-Tupel.
    """
    H, W = orig_img.shape[:2]
    x, y, w, h = int(b["x"]), int(b["y"]), int(b["w"]), int(b["h"])

    # Kandidaten-Spalten links und rechts neben der Box
    candidates = []
    xl = x - offset
    xr = x + w + offset

    if 0 <= xl < W:
        candidates.append(xl)

    if 0 <= xr < W:
        candidates.append(xr)

    if not candidates:
        candidates = [min(max(x - offset, 0), W - 1)]

    ys = np.linspace(y, y + max(1, h) - 1, num=max(1, samples)).astype(int)
    ys = np.clip(ys, 0, H - 1)

    pixels = []
    for xi in candidates:
        for yi in ys:
            pixels.append(orig_img[yi, xi, :].astype(np.float32))

    if not pixels:
        return (0.0, 0.0, 0.0)

    mean_bgr = np.mean(pixels, axis=0)
    r, g, b = float(mean_bgr[2]), float(mean_bgr[1]), float(mean_bgr[0])
    return (r, g, b)


def process_file(input_file: str, output_dir: str, average_rgb_map: bool) -> Tuple[np.ndarray, Dict[int, List[Tuple[float, float, float]]]]:
    """Verarbeitet eine einzelne Wetterkarte.

    Erkennt alle Temperaturzahlen, misst die zugehoerigen Kartenfarben und
    schreibt ein Kontrollbild (<name>_ocr.<ext>) mit eingezeichneten Boxen
    in das Ausgabeverzeichnis.

    Args:
        input_file: Pfad zum Kartenbild.
        output_dir: Verzeichnis fuer das Kontrollbild.
        average_rgb_map: Wenn True, werden mehrere Messungen derselben
            Temperatur innerhalb dieses Bildes zu einem Mittelwert
            zusammengefasst.

    Returns:
        Tupel aus Kontrollbild und Zuordnung Temperatur -> Liste von
        (R, G, B)-Messwerten.
    """
    original: MatLike | None = cv2.imread(input_file)
    if original is None:
        raise FileNotFoundError(f"Input file {input_file} could not be read as an image.")

    boxes = detect_temp_values(original)

    # Farbmessung je Box, gruppiert nach erkannter Temperatur
    rgb_map: Dict[int, List[Tuple[float, float, float]]] = {}
    for b in boxes:
        mean_rgb = sample_box_rgb(original, b)  # (R, G, B)
        b["rgb_mean"] = mean_rgb
        try:
            num = int(str(b["text"]))
        except ValueError:
            continue
        rgb_map.setdefault(num, []).append(mean_rgb)

    # Kontrollbild: Boxen in der gemessenen Farbe umranden und beschriften
    img_result = original.copy()
    for bx in boxes:
        x, y, w, h = int(bx["x"]), int(bx["y"]), int(bx["w"]), int(bx["h"])
        r, g, b = bx["rgb_mean"]
        color_bgr = (int(np.clip(b, 0, 255)),
                     int(np.clip(g, 0, 255)),
                     int(np.clip(r, 0, 255)))
        # schwarzer Rand fuer Sichtbarkeit, darauf die gemessene Farbe
        cv2.rectangle(img_result, (x, y), (x + w, y + h), (0, 0, 0), 3)
        cv2.rectangle(img_result, (x, y), (x + w, y + h), color_bgr, 2)

        txt = str(bx["text"])
        org = (x, max(0, y - 5))
        cv2.putText(img_result, txt, org, cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 0), 3)
        cv2.putText(img_result, txt, org, cv2.FONT_HERSHEY_SIMPLEX, 0.6, color_bgr, 1)

    in_name = os.path.basename(input_file)
    stem, ext = os.path.splitext(in_name)
    out_path = os.path.join(output_dir, f"{stem}_ocr{ext}")

    cv2.imwrite(out_path, img_result)

    if average_rgb_map:
        # Mehrfachmessungen derselben Temperatur mitteln
        for k, vlist in rgb_map.items():
            if len(vlist) > 1:
                mean_rgb = tuple(float(c) for c in np.mean(np.array(vlist, dtype=float), axis=0))
                rgb_map[k] = [mean_rgb]

    return img_result, rgb_map


def process_folder(input_dir: str, output_dir: str) -> Tuple[Dict[int, List[Tuple[float, float, float]]],
                                                             Dict[str, Dict[int, List[Tuple[float, float, float]]]]]:
    """Verarbeitet alle Kartenbilder eines Verzeichnisses.

    Fuer jede Datei wird zusaetzlich ein CIE-1931-Diagramm der gemessenen
    Farben erzeugt. Die Messwerte werden sowohl ueber alle Dateien pro
    Temperatur aggregiert als auch je Datei getrennt zurueckgegeben —
    letzteres ist die Grundlage fuer die Trennung der Skalenvarianten
    (jedes Bild verwendet genau eine Variante).

    Args:
        input_dir: Verzeichnis mit den Kartenbildern.
        output_dir: Verzeichnis fuer Kontrollbilder und Diagramme.

    Returns:
        Tupel (agg, per_file): agg als aggregierte Zuordnung
        Temperatur -> Liste von (R, G, B)-Messwerten, per_file als
        Zuordnung Dateiname -> {Temperatur -> Messwerte}.
    """
    exts = {".png", ".jpg", ".jpeg", ".webp", ".bmp", ".tif", ".tiff"}
    os.makedirs(output_dir, exist_ok=True)

    agg: Dict[int, List[Tuple[float, float, float]]] = defaultdict(list)
    per_file: Dict[str, Dict[int, List[Tuple[float, float, float]]]] = {}

    for fn in sorted(os.listdir(input_dir)):
        ext = os.path.splitext(fn.lower())[1]
        if ext in exts:
            path = os.path.join(input_dir, fn)
            try:
                _, rgb_map = process_file(path, output_dir, average_rgb_map=True)

                # CIE-Diagramm je Datei
                stem, ext_orig = os.path.splitext(fn)
                cie_filename = f"{stem}_cie{ext_orig}"
                plot_all_rgb_cie1931(rgb_map, output_dir=output_dir, filename=cie_filename)

                per_file[fn] = rgb_map

                # aggregieren
                for k, vlist in rgb_map.items():
                    agg[k].extend(vlist)
            except Exception as e:
                print(f"Warnung: {fn} uebersprungen ({e})")

    return agg, per_file


def save_rgb_map(path: str, rgb_map: Dict[int, List[Tuple[float, float, float]]]) -> None:
    """Speichert die aggregierte Temperatur/Farb-Zuordnung als JSON."""
    data = {str(k): [list(map(float, triplet)) for triplet in v] for k, v in rgb_map.items()}
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def load_rgb_map(path: str) -> Dict[int, List[Tuple[float, float, float]]]:
    """Laedt die aggregierte Temperatur/Farb-Zuordnung aus einer JSON-Datei."""
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)
    out: Dict[int, List[Tuple[float, float, float]]] = {}
    for k, lst in data.items():
        out[int(k)] = [tuple(map(float, triplet)) for triplet in lst]
    return out


def save_per_file_rgb_map(path: str, per_file: Dict[str, Dict[int, List[Tuple[float, float, float]]]]) -> None:
    """Speichert die Temperatur/Farb-Zuordnung je Datei als JSON."""
    data = {fn: {str(k): [list(map(float, t)) for t in v] for k, v in m.items()}
            for fn, m in per_file.items()}
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def load_per_file_rgb_map(path: str) -> Dict[str, Dict[int, List[Tuple[float, float, float]]]]:
    """Laedt die Temperatur/Farb-Zuordnung je Datei aus einer JSON-Datei."""
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)
    return {fn: {int(k): [tuple(map(float, t)) for t in v] for k, v in m.items()}
            for fn, m in data.items()}


def compute_color_scale(rgb_map: Dict[int, List[Tuple[float, float, float]]]) -> Tuple[np.ndarray, np.ndarray]:
    """Berechnet die Farbskala aus den aggregierten Messwerten.

    Je Temperatur wird der Median ueber alle Messwerte gebildet. Der Median
    ist robust gegenueber einzelnen Fehlmessungen (z.B. wenn eine Box auf
    einer Kuestenlinie oder einem Ortsnamen liegt).

    Args:
        rgb_map: Zuordnung Temperatur -> Liste von (R, G, B)-Messwerten.

    Returns:
        Tupel (temps, rgb): temps als aufsteigend sortiertes Array der
        Temperaturen, rgb als (N, 3)-Array der zugehoerigen Medianfarben.
    """
    temps = np.array(sorted(rgb_map.keys()), dtype=float)
    rgb = np.array([np.median(np.asarray(rgb_map[int(t)], dtype=float), axis=0) for t in temps])
    return temps, rgb


def fit_color_spline_lab(temps: np.ndarray, rgb: np.ndarray, sigma: float = 4.0,
                         counts: np.ndarray = None,
                         n_iter: int = 4) -> Tuple[np.ndarray, np.ndarray]:
    """Legt eine glaettende Ausgleichskurve im CIELAB-Raum durch die Skalenpunkte.

    Die Stuetzpunktfarben werden nach CIELAB transformiert; dort wird je
    Kanal (L*, a*, b*) ein kubischer Glaettungsspline (Reinsch 1967,
    scipy UnivariateSpline) ueber die Temperatur gelegt und das Ergebnis
    zurueck nach sRGB gewandelt. Der Glaettungsfaktor entspricht einer
    angenommenen Streuung der Stuetzpunkte von etwa `sigma` Lab-Einheiten
    (~dE*ab) — die Kurve gleicht also aus, statt zu interpolieren.

    Drei Massnahmen halten die Kurve ruhig, obwohl die Stuetzpunkte
    geclustert sind (die Skala ist gebandet, mehrere °C tragen fast
    dieselbe Farbe) und einzelne Mediane weit abliegen:

    * Robuste Neugewichtung (IRLS mit Huber-Gewichten auf den
      Lab-Residuen): Ausreisser-Mediane werden heruntergewichtet und
      ziehen die Kurve nicht mehr zu Schleifen und Wacklern.
    * Optionale Gewichtung mit sqrt(n) je Stuetzpunkt (`counts`):
      duenn belegte Temperaturen (oft nur 1-2 Messungen an den
      Skalenraendern) bestimmen die Kurve schwaecher als gut belegte.
    * Verankerte Endpunkte: erster und letzter Stuetzpunkt erhalten
      hohes Gewicht, damit die stark geglaettete Kurve an den Raendern
      nicht ueberschiesst und aus dem sRGB-Gamut laeuft.

    Gegenueber einem globalen Ausgleichspolynom je RGB-Kanal ist der
    Spline lokal: kein Wackeln zwischen den Stuetzpunkten (Runge-Effekt)
    und kein Ueberschwingen an den Raendern. Die Glaettung im
    wahrnehmungsuniformen Lab-Raum dosiert zudem ueberall gleich stark
    in Einheiten des Farbabstands — konsistent zur dE00-basierten
    Uniformitaetsanalyse.

    Args:
        temps: Temperaturen der Stuetzpunkte (aufsteigend).
        rgb: (N, 3)-Array der Stuetzpunktfarben (0-255).
        sigma: Angenommene Streuung der Stuetzpunkte in Lab-Einheiten.
        counts: Anzahl Messungen je Stuetzpunkt (None = gleichgewichtet).
        n_iter: Anzahl der robusten Neugewichtungs-Iterationen.

    Returns:
        Tupel (t_fine, rgb_fine): feines Temperaturraster und die darauf
        ausgewertete Ausgleichskurve als (M, 3)-Array, auf [0, 255] begrenzt.
    """
    from scipy.interpolate import UnivariateSpline

    lab = colour.XYZ_to_Lab(colour.sRGB_to_XYZ(np.clip(rgb / 255.0, 0, 1)))

    k = min(3, len(temps) - 1)
    t_fine = np.linspace(temps.min(), temps.max(), 200)

    w_n = np.sqrt(np.asarray(counts, dtype=float)) if counts is not None else np.ones(len(temps))
    w_n = w_n / w_n.mean()
    w_n[0] *= 5.0
    w_n[-1] *= 5.0

    w_r = np.ones(len(temps))
    splines = None
    for _ in range(max(1, n_iter)):
        # s ist auf die Gewichtsdefinition von UnivariateSpline abgestimmt:
        # mit w ~ sqrt(n) hat jedes gewichtete Residuum die Erwartung sigma,
        # die robusten Gewichte reduzieren das Budget entsprechend.
        s = np.sum(w_r ** 2) * sigma ** 2
        w = w_n * w_r
        splines = [UnivariateSpline(temps, lab[:, ch], w=w, k=k, s=s) for ch in range(3)]
        lab_hat = np.stack([sp(temps) for sp in splines], axis=1)
        residual = np.linalg.norm(lab - lab_hat, axis=1)
        # Huber-Gewichte auf Basis des MAD; Untergrenze 0.3, damit kein
        # Stuetzpunkt vollstaendig verworfen wird
        spread = max(1.4826 * float(np.median(residual)), 1.0)
        u = residual / (1.345 * spread)
        w_r = np.maximum(np.where(u > 1.0, 1.0 / u, 1.0), 0.3)

    lab_fine = np.stack([sp(t_fine) for sp in splines], axis=1)
    rgb_fine = colour.XYZ_to_sRGB(colour.Lab_to_XYZ(lab_fine))
    return t_fine, np.clip(rgb_fine, 0.0, 1.0) * 255.0


def build_samples(per_file: Dict[str, Dict[int, List[Tuple[float, float, float]]]]) -> List[dict]:
    """Ueberfuehrt die per-Datei-Zuordnung in eine flache Messwert-Liste.

    Args:
        per_file: Zuordnung Dateiname -> {Temperatur -> Messwerte}.

    Returns:
        Liste von Messwerten als dict mit "file", "temp", "rgb" (np.ndarray)
        und "lab" (CIELAB, fuer Farbdifferenzrechnungen).
    """
    samples = []
    for fn, m in per_file.items():
        for t, vlist in m.items():
            for rgb in vlist:
                samples.append({"file": fn, "temp": float(t), "rgb": np.asarray(rgb, dtype=float)})

    all_rgb = np.array([s["rgb"] for s in samples])
    all_lab = colour.XYZ_to_Lab(colour.sRGB_to_XYZ(np.clip(all_rgb / 255.0, 0, 1)))
    for s, lab in zip(samples, all_lab):
        s["lab"] = lab
    return samples


def plot_map_panel(name: str,
                   rgb_map: Dict[int, List[Tuple[float, float, float]]],
                   output_dir: str,
                   filename: str) -> None:
    """Erstellt das Drei-Panel-Bild fuer eine einzelne Wetterkarte.

    Links: CIE-1931-Chromatizitaetsdiagramm mit den Temperaturwerten.
    Mitte: 3D-RGB-Darstellung mit Ausgleichskurve (Glaettungsspline in CIELAB).
    Rechts: die aus der Kurve abgeleitete Farbskala als vertikaler
    Farbbalken ueber der Temperaturachse.

    Args:
        name: Name der Wetterkarte (Dateiname, erscheint im Titel).
        rgb_map: Messwerte dieser Karte (Temperatur -> RGB-Liste).
        output_dir: Ausgabeverzeichnis.
        filename: Dateiname der Grafik.
    """
    Path(output_dir).mkdir(parents=True, exist_ok=True)

    temps, scale_rgb = compute_color_scale(rgb_map)
    # Einzelkarten haben wenige, teils fehlerbehaftete Stuetzpunkte
    # (Median aus oft nur einer Messung) — staerker glaetten als beim
    # aggregierten Datensatz, sonst schlaegt die Kurve Schleifen
    t_fine, rgb_fine = fit_color_spline_lab(temps, scale_rgb, sigma=6.0)

    # Breite knapp am Inhalt halten: das CIE-Diagramm hat ein festes
    # Seitenverhaeltnis und fuellt einen breiteren Slot nicht aus, die
    # 3D-Achse bringt grosse Eigenraender mit — beides erzeugte sonst
    # breite Leerflaechen zwischen den Panels.
    fig = plt.figure(figsize=(13, 6.5))
    gs = fig.add_gridspec(1, 3, width_ratios=[1.0, 1.05, 0.13], wspace=0.05,
                          left=0.04, right=0.93)

    # links: CIE 1931
    ax_cie = fig.add_subplot(gs[0])
    draw_cie1931(ax_cie, rgb_map)
    ax_cie.set_title("CIE 1931", fontsize=12)

    # Mitte: RGB-Wuerfel mit Kurve
    ax_3d = fig.add_subplot(gs[1], projection="3d")
    draw_rgb_3d(ax_3d, rgb_map, temps, scale_rgb, rgb_fine)
    ax_3d.set_box_aspect((1, 1, 1), zoom=1.15)
    ax_3d.set_title("RGB-Raum mit Ausgleichskurve", fontsize=12)

    # rechts: Farbskala aus der Kurve, vertikal (kalt unten, warm oben)
    ax_bar = fig.add_subplot(gs[2])
    gradient = np.clip(rgb_fine / 255.0, 0, 1)[:, np.newaxis, :]
    ax_bar.imshow(gradient, aspect="auto", origin="lower",
                  extent=(0, 1, float(t_fine.min()), float(t_fine.max())),
                  interpolation="bilinear")
    ax_bar.set_xticks([])
    # Achse rechts vom Balken, damit sie nicht mit der 3D-Achse kollidiert
    ax_bar.yaxis.tick_right()
    ax_bar.yaxis.set_label_position("right")
    ax_bar.yaxis.set_major_locator(tck.MultipleLocator(2))
    ax_bar.yaxis.set_minor_locator(tck.MultipleLocator(1))
    ax_bar.set_ylabel("Temperatur [°C]")
    ax_bar.set_title("Farbskala", fontsize=12)

    fig.suptitle(f"{name} — Farbskala ({int(temps.min())} bis {int(temps.max())} °C)", fontsize=14)

    plt.savefig(Path(output_dir) / filename, dpi=200, bbox_inches="tight")
    plt.close(fig)


def plot_scales_overview(per_file: Dict[str, Dict[int, List[Tuple[float, float, float]]]],
                         output_dir: str,
                         filename: str = "farbskalen_uebersicht.png",
                         highlight: str = "2026",
                         title: str = None) -> None:
    """Zeichnet alle Karten-Farbskalen nebeneinander in eine Uebersicht.

    Je Karte wird die aus der Ausgleichskurve abgeleitete Skala als
    vertikaler Farbbalken ueber einer gemeinsamen Temperaturachse (y)
    dargestellt. Sortiert wird nach dem Minimalwert der Skala; der Name
    der Wetterkarte steht unter jedem Balken. Karten, deren Dateiname
    `highlight` enthaelt, bekommen eine duenne gestrichelte dunkelblaue
    Linie hinter dem Balken und eine dunkelblaue Beschriftung — damit
    laesst sich z.B. die Skalenverschiebung des Jahrgangs 2026 gegenueber
    den uebrigen Karten hervorheben.

    Args:
        per_file: Zuordnung Dateiname -> {Temperatur -> Messwerte}.
        output_dir: Ausgabeverzeichnis.
        filename: Dateiname der Grafik.
        highlight: Teilstring der hervorzuhebenden Dateinamen ("" = keine).
        title: Diagrammtitel (None = Standardtitel).
    """
    Path(output_dir).mkdir(parents=True, exist_ok=True)

    # Skala je Karte berechnen, nach Minimaltemperatur sortieren
    scales = []
    for name, rgb_map in per_file.items():
        if not rgb_map:
            continue
        temps, scale_rgb = compute_color_scale(rgb_map)
        # wie in plot_map_panel(): Einzelkarten staerker glaetten
        t_fine, rgb_fine = fit_color_spline_lab(temps, scale_rgb, sigma=6.0)
        scales.append((name, t_fine, rgb_fine))
    scales.sort(key=lambda e: float(e[1].min()))

    if not scales:
        return

    fig, ax = plt.subplots(figsize=(0.32 * len(scales) + 2.5, 10))

    for i, (name, t_fine, rgb_fine) in enumerate(scales):
        gradient = np.clip(rgb_fine / 255.0, 0, 1)[:, np.newaxis, :]
        ax.imshow(gradient, aspect="auto", interpolation="bilinear", origin="lower",
                  extent=(i - 0.38, i + 0.38, float(t_fine.min()), float(t_fine.max())),
                  zorder=3)
        if highlight and highlight in name:
            ax.axvline(x=i, color="navy", linestyle="--", linewidth=0.8,
                       alpha=0.8, zorder=1)

    t_lo = min(float(tf.min()) for _, tf, _ in scales)
    t_hi = max(float(tf.max()) for _, tf, _ in scales)
    ax.set_ylim(t_lo - 1, t_hi + 1)
    ax.set_xlim(-0.6, len(scales) - 0.4)  # kleinster Minimalwert links

    ax.set_xticks(range(len(scales)))
    ax.set_xticklabels([name for name, _, _ in scales], fontsize=10,
                       family="monospace", rotation=90)
    if highlight:
        for tick, (name, _, _) in zip(ax.get_xticklabels(), scales):
            if highlight in name:
                tick.set_color("navy")
                tick.set_fontweight("bold")
    ax.set_ylabel("Temperatur [°C]", fontsize=18)
    ax.yaxis.set_major_locator(tck.MultipleLocator(5))
    ax.yaxis.set_minor_locator(tck.MultipleLocator(1))
    ax.tick_params(axis="y", labelsize=16)
    # Temperaturwerte bei der grossen Bildbreite auch am rechten Rand anzeigen
    ax.tick_params(axis="y", which="major", right=True, labelright=True)
    ax.grid(True, axis="y", which="major", linestyle=":", alpha=0.6, zorder=0)

    if title is None:
        title = "Farbskalen aller Wetterkarten (sortiert nach Minimaltemperatur)"
    ax.set_title(title, fontsize=18)

    plt.tight_layout()
    plt.savefig(Path(output_dir) / filename, dpi=200, bbox_inches="tight")
    plt.close(fig)


def analyze_perceptual_uniformity(temps: np.ndarray,
                                  scale_rgb: np.ndarray,
                                  rgb_map: Dict[int, List[Tuple[float, float, float]]] | None = None,
                                  n_bootstrap: int = 500,
                                  seed: int = 42) -> dict:
    """Analysiert die wahrnehmungsbasierte Uniformitaet der Farbskala.

    Fragestellung: Korreliert die Staerke des Farbwechsels mit der Staerke
    des Temperaturwechsels, oder gibt es Anomalien? Methodik analog zur
    Colormap-Bewertung nach Kovesi (2015), "Good Colour Maps: How to Design
    Them" (arXiv:1509.03700).

    Farbraum-Pipeline: Die Messwerte werden als sRGB (IEC 61966-2-1, D65)
    interpretiert und nach CIE XYZ ueberfuehrt. Rec.709 (TV) hat identische
    Primaervalenzen; der EOTF-Unterschied ist fuer diese Analyse
    vernachlaessigbar.

    Farbdifferenz-Metriken je 1-°C-Schritt:
      * CIEDE2000 (Primaermetrik): CIE-Standard fuer kleine Farbdifferenzen
        (CIE 15:2004; Sharma, Wu & Dalal 2005),
        dE00 = sqrt((dL'/kL·SL)² + (dC'/kC·SC)² + (dH'/kH·SH)²
                    + RT·(dC'/kC·SC)·(dH'/kH·SH)).
      * CIE 1976 (dE*ab): euklidische Distanz in CIELAB, als Referenz.
      * CAM16-UCS: euklidische Distanz im uniformen Raum des
        Farberscheinungsmodells CAM16 (Li et al. 2017), Cross-Check mit
        Standard-Betrachtungsbedingungen (average surround).

    Auswertung:
      * Lokaler perzeptueller Gradient g(T) = dE(c_i, c_i+1) / (T_i+1 - T_i).
      * Kumulative perzeptuelle Bogenlaenge S(T) = Summe dE00; bei einer
        wahrnehmungslinearen Skala ist S(T) eine Gerade.
      * Anomalie-Flags: dE00 < 1 (JND, Schritt praktisch nicht
        unterscheidbar) bzw. dE00 > Mittelwert + 2·Std (Sprung).
      * Unsicherheit der dE00-Schritte per Bootstrap ueber die
        Einzelmessungen je Temperatur (Resampling des Medians).

    Args:
        temps: Temperaturen der Skalenpunkte (aufsteigend).
        scale_rgb: (N, 3)-Array der Skalenfarben (Median je Temperatur).
        rgb_map: Alle Einzelmessungen (fuer die Bootstrap-Unsicherheit).
            None, wenn die Farben nicht aus Messungen stammen (z.B. bei der
            Ausgleichskurve) — die Unsicherheit ist dann 0.
        n_bootstrap: Anzahl Bootstrap-Replikate.
        seed: Startwert des Zufallsgenerators (Reproduzierbarkeit).

    Returns:
        dict mit Schritt-Temperaturen ("t_mid", "dt"), Farbdifferenzen
        ("de00", "de76", "de_cam16", "de00_std"), kumulativer Bogenlaenge
        ("cum_de00"), Helligkeitsverlauf ("L_star", "L_monotonic"),
        Statistik ("mean", "std", "cv") und Anomalie-Flags
        ("flag_sub_jnd", "flag_jump").
    """
    def to_lab(rgb255: np.ndarray) -> np.ndarray:
        return colour.XYZ_to_Lab(colour.sRGB_to_XYZ(np.clip(rgb255 / 255.0, 0, 1)))

    XYZ = colour.sRGB_to_XYZ(np.clip(scale_rgb / 255.0, 0, 1))
    Lab = colour.XYZ_to_Lab(XYZ)
    Jab = colour.XYZ_to_CAM16UCS(XYZ)

    dt = np.diff(temps)
    # Farbdifferenz je Schritt, normiert auf 1 °C (lokaler Gradient)
    de00 = colour.delta_E(Lab[:-1], Lab[1:], method="CIE 2000") / dt
    de76 = colour.delta_E(Lab[:-1], Lab[1:], method="CIE 1976") / dt
    de_cam16 = colour.delta_E(Jab[:-1], Jab[1:], method="CAM16-UCS") / dt

    # kumulative perzeptuelle Bogenlaenge, S(T_min) = 0
    cum_de00 = np.concatenate([[0.0], np.cumsum(de00 * dt)])

    # Bootstrap: Median je Temperatur aus den Einzelmessungen resampeln
    # und die Streuung der resultierenden dE00-Schritte bestimmen
    if rgb_map is not None:
        rng = np.random.default_rng(seed)
        samples = [np.asarray(rgb_map[int(t)], dtype=float) for t in temps]
        boot = np.empty((n_bootstrap, len(temps) - 1))
        for i in range(n_bootstrap):
            med = np.array([s[rng.integers(0, len(s), size=len(s))].mean(axis=0) if len(s) > 1
                            else s[0] for s in samples])
            lab_b = to_lab(med)
            boot[i] = colour.delta_E(lab_b[:-1], lab_b[1:], method="CIE 2000") / dt
        de00_std = boot.std(axis=0)
    else:
        de00_std = np.zeros(len(temps) - 1)

    mean, std = float(de00.mean()), float(de00.std())
    L_star = Lab[:, 0]
    dL = np.diff(L_star)

    return {
        "t_mid": (temps[:-1] + temps[1:]) / 2.0,
        "dt": dt,
        "de00": de00,
        "de76": de76,
        "de_cam16": de_cam16,
        "de00_std": de00_std,
        "cum_de00": cum_de00,
        "L_star": L_star,
        "L_monotonic": bool(np.all(dL <= 0) or np.all(dL >= 0)),
        "mean": mean,
        "std": std,
        "cv": std / mean if mean > 0 else float("nan"),
        "flag_sub_jnd": de00 < 1.0,
        "flag_jump": de00 > mean + 2.0 * std,
    }


def plot_perceptual_uniformity(result: dict,
                               temps: np.ndarray,
                               scale_rgb: np.ndarray,
                               output_dir: str,
                               filename: str = "wahrnehmung_uniformitaet.png",
                               title: str = "Wahrnehmungsbasierte Uniformitätsanalyse der Farbskala",
                               show_metrics: bool = False) -> None:
    """Visualisiert die Uniformitaetsanalyse der Farbskala.

    Drei Panels ueber einer gemeinsamen Temperaturachse, darunter die
    Farbskala als Kontextleiste:
      1. dE00 je 1-°C-Schritt (Balken in der Farbe des Schrittmittels) mit
         Bootstrap-Fehlerbalken, JND-Linie und Mittelwertlinie; Anomalien
         sind markiert (o = unter JND, ^ = Sprung > Mittel + 2 Std).
      2. Kumulative perzeptuelle Bogenlaenge S(T) mit linearer Referenz.
      3. Helligkeitsverlauf L*(T) (Monotonie-Check nach Kovesi).
    Optional (show_metrics=True) zusaetzlich ein viertes Panel:
      4. Metrikvergleich dE76 / dE00 / CAM16-UCS, je auf ihren Mittelwert
         normiert (zeigt Modellunabhaengigkeit der Befunde).

    Args:
        result: Ergebnis-Dict aus analyze_perceptual_uniformity().
        temps: Temperaturen der Skalenpunkte.
        scale_rgb: (N, 3)-Array der Skalenfarben.
        output_dir: Ausgabeverzeichnis.
        filename: Dateiname der Grafik.
        title: Gesamttitel der Grafik.
        show_metrics: Metrikvergleichs-Panel mit ausgeben.
    """
    Path(output_dir).mkdir(parents=True, exist_ok=True)

    t_mid = result["t_mid"]
    de00 = result["de00"]
    t_min, t_max = float(temps.min()), float(temps.max())
    # Farbe des Schrittmittels: Mittel der beiden angrenzenden Skalenfarben
    step_colors = np.clip((scale_rgb[:-1] + scale_rgb[1:]) / 2.0 / 255.0, 0, 1)

    if show_metrics:
        ratios, figsize = [3, 2.5, 2, 2.5, 0.5], (12, 14)
    else:
        ratios, figsize = [3, 2.5, 2, 0.5], (12, 11.5)
    fig, axes = plt.subplots(
        len(ratios), 1, figsize=figsize, sharex=True,
        gridspec_kw={"height_ratios": ratios, "hspace": 0.3},
    )
    if show_metrics:
        ax1, ax2, ax3, ax4, ax_bar = axes
    else:
        (ax1, ax2, ax3, ax_bar), ax4 = axes, None

    # Panel 1: dE00 je Schritt
    yerr = result["de00_std"] if np.any(result["de00_std"] > 0) else None
    ax1.bar(t_mid, de00, width=result["dt"] * 0.9, color=step_colors,
            edgecolor="black", linewidth=0.5,
            yerr=yerr, capsize=2, ecolor="dimgray")
    ax1.axhline(1.0, color="gray", linestyle="--", linewidth=1.2)
    ax1.axhline(result["mean"], color="black", linestyle=":", linewidth=1.2)
    ax1.text(t_max, 1.0, " JND (ΔE₀₀=1)", va="center", fontsize=8, color="gray")
    ax1.text(t_max, result["mean"], f" Mittel ({result['mean']:.1f})", va="center", fontsize=8)
    y_marker = de00.max() * 1.08
    for tm, sub, jump in zip(t_mid, result["flag_sub_jnd"], result["flag_jump"]):
        if sub:
            ax1.plot(tm, y_marker, "o", color="gray", markersize=5, clip_on=False)
        if jump:
            ax1.plot(tm, y_marker, "^", color="red", markersize=7, clip_on=False)
    ax1.set_ylabel("ΔE₀₀ / °C")
    ax1.set_title(
        f"Perzeptueller Farbgradient je °C-Schritt (CIEDE2000) — "
        f"○ unter JND: {int(result['flag_sub_jnd'].sum())}, "
        f"▲ Sprung: {int(result['flag_jump'].sum())}, CV = {result['cv']:.2f}",
        fontsize=11, loc="left",
    )

    # Panel 2: kumulative Bogenlaenge mit linearer Referenz
    cum = result["cum_de00"]
    linear_ref = np.interp(temps, [t_min, t_max], [0.0, cum[-1]])
    ax2.plot(temps, cum, "-", color="black", linewidth=1.5, marker="o",
             markersize=4, label="S(T) = Σ ΔE₀₀")
    ax2.plot([t_min, t_max], [0, cum[-1]], "--", color="gray", linewidth=1.2,
             label="wahrnehmungslineare Referenz")
    ax2.fill_between(temps, cum, linear_ref, color="red", alpha=0.15)
    ax2.set_ylabel("kumulative ΔE₀₀")
    ax2.legend(loc="upper left", fontsize=9)
    ax2.set_title("Kumulative perzeptuelle Bogenlänge", fontsize=11, loc="left")

    # Panel 3: Helligkeitsverlauf
    ax3.plot(temps, result["L_star"], "-", color="black", linewidth=1)
    ax3.scatter(temps, result["L_star"], c=np.clip(scale_rgb / 255.0, 0, 1),
                s=40, edgecolors="black", linewidths=0.5, zorder=3)
    mono = "monoton" if result["L_monotonic"] else "NICHT monoton"
    ax3.set_ylabel("L*")
    ax3.set_title(f"Helligkeitsverlauf L*(T) — {mono}", fontsize=11, loc="left")

    # Panel 4 (optional): Metrikvergleich (auf Mittelwert normiert)
    if show_metrics:
        for key, label, style in (("de76", "ΔE*ab (CIE 1976)", ":"),
                                  ("de00", "ΔE₀₀ (CIEDE2000)", "-"),
                                  ("de_cam16", "ΔE′ (CAM16-UCS)", "--")):
            v = result[key]
            ax4.plot(t_mid, v / v.mean(), style, linewidth=1.4, marker=".", label=label)
        ax4.axhline(1.0, color="gray", linewidth=0.8)
        ax4.set_ylabel("ΔE / Mittel")
        ax4.legend(loc="upper right", fontsize=9)
        ax4.set_title("Metrikvergleich (normiert)", fontsize=11, loc="left")

    # Kontextleiste: die Farbskala selbst
    for t, rgb in zip(temps, scale_rgb):
        ax_bar.axvspan(t - 0.5, t + 0.5, color=np.clip(rgb / 255.0, 0, 1))
    ax_bar.set_xlim(t_min - 0.5, t_max + 0.5)
    ax_bar.set_yticks([])
    ax_bar.set_xlabel("Temperatur [°C]")
    ax_bar.xaxis.set_major_locator(tck.MultipleLocator(2))
    ax_bar.xaxis.set_minor_locator(tck.MultipleLocator(1))

    fig.suptitle(title, fontsize=14)

    out_path = Path(output_dir) / filename
    plt.savefig(out_path, dpi=300, bbox_inches="tight")
    plt.close(fig)


def plot_rgb_3d(rgb_map: Dict[int, List[Tuple[float, float, float]]],
                temps: np.ndarray,
                scale_rgb: np.ndarray,
                t_fine: np.ndarray,
                rgb_fine: np.ndarray,
                output_dir: str,
                filename: str = "rgb_scale_3d.png") -> None:
    """Stellt Messpunkte, Farbskala und Ausgleichskurve im RGB-Wuerfel dar.

    Alle Einzelmessungen werden als kleine Punkte, die Medianwerte der Skala
    als groessere beschriftete Punkte gezeichnet. Die Ausgleichskurve wird
    als Linienzug dargestellt, dessen Segmente in der jeweiligen Kurvenfarbe
    eingefaerbt sind.

    Args:
        rgb_map: Alle Einzelmessungen (Temperatur -> Liste von RGB-Werten).
        temps: Temperaturen der Skalenpunkte.
        scale_rgb: (N, 3)-Array der Skalenfarben (Median je Temperatur).
        t_fine: Temperaturraster der Ausgleichskurve.
        rgb_fine: (M, 3)-Array der Kurvenpunkte.
        output_dir: Ausgabeverzeichnis.
        filename: Dateiname der Grafik.
    """
    Path(output_dir).mkdir(parents=True, exist_ok=True)

    fig = plt.figure(figsize=(10, 9))
    ax = fig.add_subplot(projection="3d")
    draw_rgb_3d(ax, rgb_map, temps, scale_rgb, rgb_fine)
    ax.set_title(f"Farbskala im RGB-Raum ({int(temps.min())}–{int(temps.max())} °C)")
    ax.legend(loc="upper left")

    plt.tight_layout()
    out_path = Path(output_dir) / filename
    plt.savefig(out_path, dpi=300)
    plt.close(fig)


def draw_rgb_3d(ax,
                rgb_map: Dict[int, List[Tuple[float, float, float]]],
                temps: np.ndarray,
                scale_rgb: np.ndarray,
                rgb_fine: np.ndarray) -> None:
    """Zeichnet Messpunkte, Skalenpunkte und Kurve in eine 3D-Achse.

    Args:
        ax: Matplotlib-3D-Achse, in die gezeichnet wird.
        rgb_map: Alle Einzelmessungen (Temperatur -> Liste von RGB-Werten).
        temps: Temperaturen der Skalenpunkte.
        scale_rgb: (N, 3)-Array der Skalenfarben (Median je Temperatur).
        rgb_fine: (M, 3)-Array der Punkte der Ausgleichskurve.
    """
    # Einzelmessungen: kleine Punkte in ihrer eigenen Farbe
    all_rgb = np.array([s for samples in rgb_map.values() for s in samples], dtype=float)
    ax.scatter(all_rgb[:, 0], all_rgb[:, 1], all_rgb[:, 2],
               c=np.clip(all_rgb / 255.0, 0, 1), s=12, alpha=0.4,
               edgecolors="none", label="Einzelmessungen")

    # Skalenpunkte (Median je Temperatur): groessere Punkte mit Beschriftung
    ax.scatter(scale_rgb[:, 0], scale_rgb[:, 1], scale_rgb[:, 2],
               c=np.clip(scale_rgb / 255.0, 0, 1), s=70, alpha=1.0,
               edgecolors="black", linewidths=0.6, label="Farbskala (Median je °C)")
    for t, (r, g, b) in zip(temps, scale_rgb):
        ax.text(r, g, b, f" {int(t)}", fontsize=7, zorder=99)

    # Ausgleichskurve: Segmente in der jeweiligen Kurvenfarbe
    pts = rgb_fine.reshape(-1, 1, 3)
    segments = np.concatenate([pts[:-1], pts[1:]], axis=1)
    seg_colors = np.clip(rgb_fine[:-1] / 255.0, 0, 1)
    lc = Line3DCollection(segments, colors=seg_colors, linewidths=3, label="Ausgleichskurve")
    ax.add_collection3d(lc)

    ax.set_xlim(0, 255)
    ax.set_ylim(0, 255)
    ax.set_zlim(0, 255)
    ax.set_xlabel("R")
    ax.set_ylabel("G")
    ax.set_zlabel("B")


def plot_color_scale_bar(temps: np.ndarray,
                         scale_rgb: np.ndarray,
                         t_fine: np.ndarray,
                         rgb_fine: np.ndarray,
                         output_dir: str,
                         filename: str = "farbskala.png") -> None:
    """Rendert die Farbskala als Farbbalken-Bild.

    Oben wird der kontinuierliche Farbverlauf aus der Ausgleichskurve
    gezeichnet, darunter zum Vergleich die gemessenen Medianfarben als
    diskrete Bloecke (je 1 °C breit). Die gemeinsame Achse ist in °C
    beschriftet.

    Args:
        temps: Temperaturen der Skalenpunkte.
        scale_rgb: (N, 3)-Array der Skalenfarben (Median je Temperatur).
        t_fine: Temperaturraster der Ausgleichskurve.
        rgb_fine: (M, 3)-Array der Kurvenpunkte.
        output_dir: Ausgabeverzeichnis.
        filename: Dateiname der Grafik.
    """
    Path(output_dir).mkdir(parents=True, exist_ok=True)

    t_min, t_max = float(t_fine.min()), float(t_fine.max())

    fig, (ax_fit, ax_med) = plt.subplots(
        2, 1, figsize=(12, 3.2), sharex=True,
        gridspec_kw={"hspace": 0.35},
    )

    # oben: kontinuierlicher Verlauf aus der Ausgleichskurve
    gradient = np.clip(rgb_fine / 255.0, 0, 1)[np.newaxis, :, :]
    ax_fit.imshow(gradient, aspect="auto", extent=(t_min, t_max, 0, 1),
                  interpolation="bilinear")
    ax_fit.set_yticks([])
    ax_fit.set_title("Ausgleichskurve (kontinuierlich)", fontsize=10, loc="left")

    # unten: gemessene Medianfarben als diskrete 1-°C-Bloecke
    for t, rgb in zip(temps, scale_rgb):
        ax_med.axvspan(t - 0.5, t + 0.5, color=np.clip(rgb / 255.0, 0, 1))
    ax_med.set_xlim(t_min, t_max)
    ax_med.set_yticks([])
    ax_med.set_title("Messwerte (Median je °C)", fontsize=10, loc="left")

    ax_med.set_xlabel("Temperatur [°C]")
    ax_med.xaxis.set_major_locator(tck.MultipleLocator(2))
    ax_med.xaxis.set_minor_locator(tck.MultipleLocator(1))

    fig.suptitle(f"Tagesschau-Wetterkarte – Farbskala ({int(t_min)}–{int(t_max)} °C)", fontsize=13)

    out_path = Path(output_dir) / filename
    plt.savefig(out_path, dpi=300, bbox_inches="tight")
    plt.close(fig)


def plot_all_rgb_cie1931(rgb_map: Dict[int, List[Tuple[float, float, float]]],
                         output_dir: str,
                         filename: str = "all_rgb_cie1931.png",
                         rgb_fine: np.ndarray = None) -> None:
    """Zeichnet alle Messwerte in ein CIE-1931-Chromatizitaetsdiagramm.

    Die RGB-Werte werden als sRGB interpretiert, nach CIE-xy umgerechnet und
    mit ihrer Temperatur beschriftet. Zusaetzlich wird der Rec.709/sRGB-Gamut
    eingezeichnet.

    Args:
        rgb_map: Zuordnung Temperatur -> Liste von (R, G, B)-Messwerten.
        output_dir: Ausgabeverzeichnis.
        filename: Dateiname der Grafik.
        rgb_fine: optional die bereits berechnete Ausgleichskurve als
            (M, 3)-Array (0-255); wird nach CIE-xy projiziert und
            eingezeichnet (keine Neuberechnung).
    """
    Path(output_dir).mkdir(parents=True, exist_ok=True)

    fig, ax = plt.subplots(figsize=(8, 8))
    n = draw_cie1931(ax, rgb_map, rgb_fine=rgb_fine)
    if n == 0:
        plt.close(fig)
        return

    ax.set_title(f"CIE 1931 – Alle RGB Samples (n={n})", fontsize=16)

    plt.tight_layout()
    out_path = Path(output_dir) / filename
    plt.savefig(out_path, dpi=300)
    plt.close(fig)


def draw_cie1931(ax, rgb_map: Dict[int, List[Tuple[float, float, float]]],
                 rgb_fine: np.ndarray = None) -> int:
    """Zeichnet die Messwerte in ein CIE-1931-Diagramm auf gegebene Achse.

    Args:
        ax: Matplotlib-Achse, in die gezeichnet wird.
        rgb_map: Zuordnung Temperatur -> Liste von (R, G, B)-Messwerten.
        rgb_fine: optional die fertig berechnete Ausgleichskurve als
            (M, 3)-Array (0-255), die nach CIE-xy projiziert und als
            Linie eingezeichnet wird.

    Returns:
        Anzahl der gezeichneten Messwerte (0, wenn nichts zu zeichnen war).
    """
    # Messwerte samt Temperatur-Label in flache Listen ueberfuehren
    labels = []
    all_rgb = []
    for temp, samples in rgb_map.items():
        for rgb_sample in samples:
            labels.append(str(temp))
            all_rgb.append(rgb_sample)

    if not all_rgb:
        return 0

    rgb = (np.asarray(all_rgb, dtype=float) / 255.0).clip(0, 1)
    XYZ = colour.sRGB_to_XYZ(rgb)
    xy = colour.XYZ_to_xy(XYZ)

    # Hintergrund: das eingefaerbte Chromatizitaetsdiagramm
    cl.plot_chromaticity_diagram_CIE1931(
        cmfs="CIE 1931 2 Degree Standard Observer",
        axes=ax,
        show=False,
        title=None,
        spectral_locus_colours="RGB",
        spectral_locus_markers=None,
    )

    def plot_gamut(ax, primaries, white, label, color):
        """Zeichnet ein Farbraum-Dreieck samt Weisspunkt ein."""
        poly = np.vstack([primaries, primaries[0]])
        ax.plot(poly[:, 0], poly[:, 1], color=color, linewidth=1.2,
                label=label, zorder=40)
        ax.plot(white[0], white[1], "o", color=color, markersize=4, zorder=41)

    rec709_primaries = np.array([[0.640, 0.330],
                                 [0.300, 0.600],
                                 [0.150, 0.060]])
    white = (0.3127, 0.3290)

    plot_gamut(ax, rec709_primaries, white, "Rec.709 / sRGB (HDTV/Web)", "blue")

    # Achsen, Ticks, Raster
    ax.set_xlim(0.0, 0.80)
    ax.set_ylim(0.0, 0.90)
    ax.set_aspect("equal", adjustable="box")
    ax.xaxis.set_major_locator(tck.MultipleLocator(0.1))
    ax.xaxis.set_minor_locator(tck.MultipleLocator(0.01))
    ax.yaxis.set_major_locator(tck.MultipleLocator(0.1))
    ax.yaxis.set_minor_locator(tck.MultipleLocator(0.01))
    ax.grid(True, which="major", linestyle="--", linewidth=0.8, alpha=0.8)
    ax.grid(True, which="minor", linestyle=":", linewidth=0.6, alpha=0.4)

    # Messpunkte in ihrer eigenen Farbe
    ax.scatter(xy[:, 0], xy[:, 1], c=rgb, s=14, alpha=0.95, edgecolors="none", zorder=30)

    # Ausgleichskurve (bereits berechnet, hier nur nach xy projiziert);
    # weisser Halo, damit die dunkle Linie auf dem farbigen
    # Chromatizitaetshintergrund lesbar bleibt
    if rgb_fine is not None and len(rgb_fine):
        xy_fit = colour.XYZ_to_xy(colour.sRGB_to_XYZ(
            np.clip(np.asarray(rgb_fine, dtype=float) / 255.0, 0, 1)))
        ax.plot(xy_fit[:, 0], xy_fit[:, 1], color="navy", linewidth=1.8,
                label="Ausgleichskurve", zorder=50,
                path_effects=[pe.withStroke(linewidth=3.2, foreground="white")])
        ax.legend(loc="upper right", fontsize=9)

    # Temperatur-Labels mit weissem Umriss fuer Lesbarkeit
    for (x, y), lbl in zip(xy, labels):
        ax.text(
            x, y,
            lbl,
            fontsize=6,
            ha="left",
            va="bottom",
            clip_on=True,
            path_effects=[pe.withStroke(linewidth=1, foreground="white")],
            zorder=99,
        )

    ax.set_xlabel("x", fontsize=14)
    ax.set_ylabel("y", fontsize=14)
    return len(rgb)


def print_uniformity_report(result: dict, heading: str) -> None:
    """Gibt die Uniformitaetsanalyse als Tabelle mit Zusammenfassung aus.

    Args:
        result: Ergebnis-Dict aus analyze_perceptual_uniformity().
        heading: Ueberschrift der Tabelle.
    """
    has_err = bool(np.any(result["de00_std"] > 0))

    print()
    print(f"{heading} (Farbdifferenz je 1-°C-Schritt):")
    print(f"{'Schritt':>12}  {'ΔE00':>12}  {'ΔE76':>7}  {'ΔE CAM16':>9}  Anomalie")
    for i, tm in enumerate(result["t_mid"]):
        t0, t1 = int(tm - result["dt"][i] / 2), int(tm + result["dt"][i] / 2)
        flag = ""
        if result["flag_sub_jnd"][i]:
            flag = "unter JND (nicht unterscheidbar)"
        elif result["flag_jump"][i]:
            flag = "SPRUNG (> Mittel + 2σ)"
        err = f" ±{result['de00_std'][i]:>4.2f}" if has_err else "      "
        print(f"{t0:>4} → {t1:>3} °C  {result['de00'][i]:>6.2f}{err}  "
              f"{result['de76'][i]:>7.2f}  {result['de_cam16'][i]:>9.2f}  {flag}")

    n_sub = int(result["flag_sub_jnd"].sum())
    n_jump = int(result["flag_jump"].sum())
    mono = "monoton" if result["L_monotonic"] else "nicht monoton"
    print()
    print(f"Zusammenfassung: ΔE00 Mittel = {result['mean']:.2f}, Std = {result['std']:.2f}, "
          f"CV = {result['cv']:.2f} (0 = perfekt uniform)")
    print(f"  {n_sub} von {len(result['de00'])} Schritten unter JND (ΔE00 < 1), "
          f"{n_jump} Sprünge (> Mittel + 2σ), Helligkeit L*: {mono}")


def plot_summary_panel(rgb_map: Dict[int, List[Tuple[float, float, float]]],
                       temps: np.ndarray,
                       scale_rgb: np.ndarray,
                       t_fine: np.ndarray,
                       rgb_fine: np.ndarray,
                       output_dir: str,
                       filename: str = "uebersicht_panel.png") -> None:
    """Erstellt das zusammenfassende Zwei-Panel-Bild der Skalenrekonstruktion.

    Links: 3D-RGB-Darstellung aller Messungen mit Ausgleichskurve.
    Rechts: CIE-1931-Chromatizitaetsdiagramm mit allen Samples und
    der Projektion der Ausgleichskurve.

    Es wird nichts neu berechnet — alle Eingaben sind die bereits
    vorliegenden Ergebnisse aus compute_color_scale() und
    fit_color_spline_lab().

    Args:
        rgb_map: Alle Einzelmessungen (Temperatur -> Liste von RGB-Werten).
        temps: Temperaturen der Skalenpunkte.
        scale_rgb: (N, 3)-Array der Skalenfarben (Median je Temperatur).
        t_fine: Temperaturraster der Ausgleichskurve.
        rgb_fine: (M, 3)-Array der Kurvenpunkte (0-255).
        output_dir: Ausgabeverzeichnis.
        filename: Dateiname der Grafik.
    """
    Path(output_dir).mkdir(parents=True, exist_ok=True)

    fig = plt.figure(figsize=(16, 8.5))
    gs = fig.add_gridspec(1, 2, wspace=0.08,
                          left=0.03, right=0.97, top=0.92, bottom=0.05)

    # links: RGB-Wuerfel mit Ausgleichskurve
    ax_3d = fig.add_subplot(gs[0, 0], projection="3d")
    draw_rgb_3d(ax_3d, rgb_map, temps, scale_rgb, rgb_fine)
    ax_3d.set_box_aspect((1, 1, 1), zoom=1.1)
    ax_3d.set_title("RGB-Raum mit Ausgleichskurve", fontsize=13)
    ax_3d.legend(loc="upper left", fontsize=9)

    # rechts: CIE 1931 mit allen Samples und projizierter Kurve
    ax_cie = fig.add_subplot(gs[0, 1])
    draw_cie1931(ax_cie, rgb_map, rgb_fine=rgb_fine)
    ax_cie.set_title("CIE 1931 mit projizierter Ausgleichskurve", fontsize=13)

    plt.savefig(Path(output_dir) / filename, dpi=200, bbox_inches="tight")
    plt.close(fig)


def plot_reconstructed_scale(rgb_fine: np.ndarray,
                             output_dir: str,
                             filename: str = "rekonstruierte_farbskala.png") -> None:
    """Zeichnet die rekonstruierte kontinuierliche Farbskala als eigenes Bild.

    Der Farbverlauf aus der Ausgleichskurve wird als horizontaler Balken
    ohne Temperaturbeschriftung dargestellt.

    Args:
        rgb_fine: (M, 3)-Array der Kurvenpunkte (0-255).
        output_dir: Ausgabeverzeichnis.
        filename: Dateiname der Grafik.
    """
    Path(output_dir).mkdir(parents=True, exist_ok=True)

    fig, ax_bar = plt.subplots(figsize=(16, 1.4))
    gradient = np.clip(rgb_fine / 255.0, 0, 1)[np.newaxis, :, :]
    ax_bar.imshow(gradient, aspect="auto", interpolation="bilinear",
                  extent=(0, 1, 0, 1))
    ax_bar.set_xticks([])
    ax_bar.set_yticks([])
    ax_bar.set_title("Rekonstruierte kontinuierliche Farbskala", fontsize=13)

    plt.savefig(Path(output_dir) / filename, dpi=200, bbox_inches="tight")
    plt.close(fig)


def main():
    input_dir = "./bilder_wetterkarten_de_2025-2026/"
    output_dir = "./output_2025-2026/"
    json_path = os.path.join(output_dir, "aggregated_rgb_map.json")
    per_file_path = os.path.join(output_dir, "per_file_rgb_map.json")

    # Messdaten aus dem Cache laden oder einmalig aus den Bildern extrahieren
    if not (os.path.exists(json_path) and os.path.exists(per_file_path)):
        rgb_map, per_file = process_folder(input_dir, output_dir)
        save_rgb_map(json_path, rgb_map)
        save_per_file_rgb_map(per_file_path, per_file)
    else:
        rgb_map = load_rgb_map(json_path)
        per_file = load_per_file_rgb_map(per_file_path)

    # Farbskala (Median je Grad) und Ausgleichskurve berechnen
    temps, scale_rgb = compute_color_scale(rgb_map)
    counts = np.array([len(rgb_map[int(t)]) for t in temps], dtype=float)
    t_fine, rgb_fine = fit_color_spline_lab(temps, scale_rgb, counts=counts)

    print("Farbskala (Median je °C):")
    for t, (r, g, b) in zip(temps, scale_rgb):
        n = len(rgb_map[int(t)])
        print(f"{int(t):>4} °C: ({r:6.1f}, {g:6.1f}, {b:6.1f})  [{n} Messung(en)]")

    # Wahrnehmungsbasierte Uniformitaetsanalyse der gemessenen Skala
    result = analyze_perceptual_uniformity(temps, scale_rgb, rgb_map)
    print_uniformity_report(result, "Uniformitätsanalyse — gemessene Skala (Median je °C)")

    # dieselbe Analyse fuer die geglaettete Skala: Ausgleichskurve an den
    # ganzzahligen Temperaturen auswerten (keine Bootstrap-Unsicherheit,
    # da keine Messstreuung zugrunde liegt)
    fit_rgb = np.stack([np.interp(temps, t_fine, rgb_fine[:, ch]) for ch in range(3)], axis=1)
    result_fit = analyze_perceptual_uniformity(temps, fit_rgb)
    print_uniformity_report(result_fit, "Uniformitätsanalyse — geglättete Skala (Ausgleichskurve)")

    plot_all_rgb_cie1931(rgb_map, output_dir=output_dir, rgb_fine=rgb_fine)
    plot_summary_panel(rgb_map, temps, scale_rgb, t_fine, rgb_fine, output_dir=output_dir)
    plot_reconstructed_scale(rgb_fine, output_dir=output_dir)
    plot_rgb_3d(rgb_map, temps, scale_rgb, t_fine, rgb_fine, output_dir=output_dir)
    plot_color_scale_bar(temps, scale_rgb, t_fine, rgb_fine, output_dir=output_dir)
    plot_perceptual_uniformity(result, temps, scale_rgb, output_dir=output_dir)
    plot_perceptual_uniformity(
        result_fit, temps, fit_rgb, output_dir=output_dir,
        filename="wahrnehmung_uniformitaet_fit.png",
        title="Wahrnehmungsbasierte Uniformitätsanalyse — geglättete Skala (Ausgleichskurve)")

    # Drei-Panel-Bild je Wetterkarte (CIE 1931 | RGB-3D | Farbskala)
    # und Uebersicht aller Karten-Farbskalen
    for fn, m in sorted(per_file.items()):
        stem = os.path.splitext(fn)[0]
        try:
            plot_map_panel(fn, m, output_dir=output_dir, filename=f"{stem}_panel.png")
        except Exception as e:
            print(f"Warnung: Panel für {fn} übersprungen ({e})")
    plot_scales_overview(per_file, output_dir=output_dir)


if __name__ == "__main__":
    main()
