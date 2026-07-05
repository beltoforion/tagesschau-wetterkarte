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


def fit_color_spline_lab(temps: np.ndarray, rgb: np.ndarray, sigma: float = 2.0) -> Tuple[np.ndarray, np.ndarray]:
    """Legt eine glaettende Ausgleichskurve im CIELAB-Raum durch die Skalenpunkte.

    Die Stuetzpunktfarben werden nach CIELAB transformiert; dort wird je
    Kanal (L*, a*, b*) ein kubischer Glaettungsspline (Reinsch 1967,
    scipy UnivariateSpline) ueber die Temperatur gelegt und das Ergebnis
    zurueck nach sRGB gewandelt. Der Glaettungsfaktor s = N * sigma²
    entspricht einer angenommenen Streuung der Stuetzpunkte von etwa
    `sigma` Lab-Einheiten (~dE*ab) — die Kurve gleicht also aus, statt zu
    interpolieren.

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

    Returns:
        Tupel (t_fine, rgb_fine): feines Temperaturraster und die darauf
        ausgewertete Ausgleichskurve als (M, 3)-Array, auf [0, 255] begrenzt.
    """
    from scipy.interpolate import UnivariateSpline

    lab = colour.XYZ_to_Lab(colour.sRGB_to_XYZ(np.clip(rgb / 255.0, 0, 1)))

    k = min(3, len(temps) - 1)
    t_fine = np.linspace(temps.min(), temps.max(), 200)
    lab_fine = np.empty((t_fine.size, 3))
    for ch in range(3):
        spline = UnivariateSpline(temps, lab[:, ch], k=k, s=len(temps) * sigma ** 2)
        lab_fine[:, ch] = spline(t_fine)

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


def cluster_palette(samples: List[dict], de_threshold: float = 5.0) -> np.ndarray:
    """Clustert alle Messfarben zur diskreten Bandpalette der Skala.

    Die Tagesschau-Skala besteht aus einer festen Sequenz von Farbbaendern,
    die als Ganzes in Temperaturrichtung verschoben wird. Agglomeratives
    Clustering (average linkage) ueber die paarweisen CIEDE2000-Distanzen
    fasst alle Messungen desselben Bandes zusammen; die Schwelle liegt
    deutlich ueber der Messstreuung (~1-3 dE00) und deutlich unter dem
    Abstand benachbarter Baender (~10+ dE00).

    Die Baender werden anschliessend entlang der Skala geordnet: In jedem
    Einzelbild ist die Bandfolge nach Temperatur sortiert eindeutig; die
    globale Ordnung ergibt sich als mittlerer normierter Rang ueber alle
    Bilder (Borda-Zaehlung).

    Args:
        samples: Messwert-Liste aus build_samples(); jedes Element erhaelt
            den Schluessel "band" (Index in Skalenreihenfolge).
        de_threshold: Cluster-Schwelle in dE00.

    Returns:
        (K, 3)-Array der Bandfarben (Median-RGB je Band) in
        Skalenreihenfolge (kalt -> warm).
    """
    from scipy.cluster.hierarchy import linkage, fcluster
    from scipy.spatial.distance import squareform

    lab = np.array([s["lab"] for s in samples])
    n = len(lab)

    dist = np.zeros((n, n))
    for i in range(n):
        dist[i] = colour.delta_E(np.broadcast_to(lab[i], lab.shape), lab, method="CIE 2000")
    dist = (dist + dist.T) / 2.0  # numerische Symmetrie

    Z = linkage(squareform(dist, checks=False), method="average")
    raw_labels = fcluster(Z, t=de_threshold, criterion="distance")

    # Bandreihenfolge per Borda-Zaehlung ueber die Einzelbilder
    ranks: Dict[int, List[float]] = defaultdict(list)
    files = sorted({s["file"] for s in samples})
    for fn in files:
        idx = [i for i, s in enumerate(samples) if s["file"] == fn]
        # Baender dieses Bildes nach mittlerer Temperatur sortieren
        band_temp: Dict[int, List[float]] = defaultdict(list)
        for i in idx:
            band_temp[raw_labels[i]].append(samples[i]["temp"])
        order = sorted(band_temp, key=lambda b: np.median(band_temp[b]))
        for r, b in enumerate(order):
            ranks[b].append(r / max(1, len(order) - 1))

    ordered = sorted(ranks, key=lambda b: np.mean(ranks[b]))
    band_index = {b: i for i, b in enumerate(ordered)}
    for s, lbl in zip(samples, raw_labels):
        s["band"] = band_index[int(lbl)]

    rgb = np.array([s["rgb"] for s in samples])
    bands = np.array([s["band"] for s in samples])
    return np.array([np.median(rgb[bands == k], axis=0) for k in range(len(ordered))])


def estimate_scale_offsets(samples: List[dict], n_iter: int = 10) -> Tuple[Dict[str, float], Dict[int, float]]:
    """Schaetzt je Bild die Temperatur-Verschiebung der Farbskala.

    Modell: Bild i verwendet die Referenzskala um delta_i Grad verschoben,
    d.h. Band b deckt dort die Temperaturen T_ref(b) + delta_i ab. Die
    Schaetzung erfolgt durch alternierende Median-Minimierung (robust
    gegen einzelne OCR-Fehlmessungen):

        T_ref(b)  = Median ueber alle Messungen von (T - delta_datei)
        delta_i   = Median ueber Bild i von (T - T_ref(band))

    Abschliessend werden die Offsets so zentriert, dass der haeufigste
    Offset bei 0 liegt (Referenzvariante).

    Args:
        samples: Messwert-Liste mit Bandzuordnung (aus cluster_palette()).
        n_iter: Anzahl Iterationen der alternierenden Minimierung.

    Returns:
        Tupel (offsets, t_ref): offsets als Dateiname -> Verschiebung in °C,
        t_ref als Band -> Referenztemperatur.
    """
    files = sorted({s["file"] for s in samples})
    delta = {fn: 0.0 for fn in files}

    for _ in range(n_iter):
        band_vals: Dict[int, List[float]] = defaultdict(list)
        for s in samples:
            band_vals[s["band"]].append(s["temp"] - delta[s["file"]])
        t_ref = {b: float(np.median(v)) for b, v in band_vals.items()}

        for fn in files:
            resid = [s["temp"] - t_ref[s["band"]] for s in samples if s["file"] == fn]
            delta[fn] = float(np.median(resid))

    # Zentrieren: haeufigster Offset (Modus auf 1-°C-Raster) wird zu 0
    vals = np.array(list(delta.values()))
    grid = np.round(vals)
    mode = float(np.bincount((grid - grid.min()).astype(int)).argmax() + grid.min())
    delta = {fn: v - mode for fn, v in delta.items()}
    t_ref = {b: v + mode for b, v in t_ref.items()}
    return delta, t_ref


def group_scale_variants(offsets: Dict[str, float], gap: float = 0.75) -> Dict[str, int]:
    """Gruppiert die Bilder anhand ihrer Skalen-Offsets zu Varianten.

    Die sortierten Offsets werden an Luecken groesser als `gap` Grad
    getrennt; jede Gruppe ist eine Skalenvariante. Die Offsets sind in den
    Daten auf ganze Grad quantisiert (die Redaktion verschiebt die Skala
    in 1-°C-Schritten), daher liegt die Schwelle unter 1 °C, damit auch
    benachbarte Verschiebungen getrennt werden.

    Args:
        offsets: Dateiname -> Offset in °C.
        gap: Mindestabstand zwischen zwei Varianten in °C.

    Returns:
        Zuordnung Dateiname -> Variantennummer (0 = kaelteste Variante).
    """
    by_offset = sorted(offsets.items(), key=lambda kv: kv[1])
    variant: Dict[str, int] = {}
    v = 0
    for i, (fn, d) in enumerate(by_offset):
        if i > 0 and d - by_offset[i - 1][1] > gap:
            v += 1
        variant[fn] = v
    return variant


def plot_scale_variants(samples: List[dict],
                        offsets: Dict[str, float],
                        variants: Dict[str, int],
                        output_dir: str,
                        filename: str = "skalenvarianten.png") -> None:
    """Visualisiert die erkannten Skalenvarianten.

    Linkes Panel: je Bild (Zeile, nach Offset sortiert) die Messfarben an
    ihrer gemessenen Temperatur — die Verschiebung der Skala ist direkt
    sichtbar. Rechtes Panel: dieselben Daten nach Abzug des geschaetzten
    Offsets — die Zeilen kollabieren auf eine gemeinsame Referenzskala.

    Args:
        samples: Messwert-Liste mit Bandzuordnung.
        offsets: Dateiname -> Offset in °C.
        variants: Dateiname -> Variantennummer.
        output_dir: Ausgabeverzeichnis.
        filename: Dateiname der Grafik.
    """
    Path(output_dir).mkdir(parents=True, exist_ok=True)

    files = sorted(offsets, key=lambda fn: (offsets[fn], fn))
    y_of = {fn: i for i, fn in enumerate(files)}

    fig, (ax_l, ax_r) = plt.subplots(1, 2, figsize=(16, 0.35 * len(files) + 2.5), sharey=True)

    for ax, shifted in ((ax_l, False), (ax_r, True)):
        for s in samples:
            x = s["temp"] - (offsets[s["file"]] if shifted else 0.0)
            ax.scatter(x, y_of[s["file"]], color=np.clip(s["rgb"] / 255.0, 0, 1),
                       s=90, marker="s", edgecolors="black", linewidths=0.3)
        ax.set_xlabel("Temperatur [°C]" if not shifted else "Temperatur − Offset [°C]")
        ax.grid(True, axis="x", linestyle=":", alpha=0.5)
    ax_l.set_title("gemessen (Skalen verschoben)", fontsize=11, loc="left")
    ax_r.set_title("nach Offset-Korrektur (ausgerichtet)", fontsize=11, loc="left")

    ax_l.set_yticks(range(len(files)))
    ax_l.set_yticklabels([f"V{variants[fn]}  ({offsets[fn]:+.1f} °C)  {fn}" for fn in files],
                         fontsize=7, family="monospace")
    ax_l.invert_yaxis()

    fig.suptitle("Skalenvarianten: Verschiebung der Farbskala je Bild", fontsize=13)
    plt.tight_layout()
    plt.savefig(Path(output_dir) / filename, dpi=200, bbox_inches="tight")
    plt.close(fig)


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
                         filename: str = "farbskalen_uebersicht.png") -> None:
    """Zeichnet alle Karten-Farbskalen untereinander in eine Uebersicht.

    Je Karte wird die aus der Ausgleichskurve abgeleitete Skala als
    horizontaler Farbbalken ueber einer gemeinsamen Temperaturachse
    dargestellt. Sortiert wird nach dem Minimalwert der Skala; der Name
    der Wetterkarte steht an jedem Balken.

    Args:
        per_file: Zuordnung Dateiname -> {Temperatur -> Messwerte}.
        output_dir: Ausgabeverzeichnis.
        filename: Dateiname der Grafik.
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

    fig, ax = plt.subplots(figsize=(14, 0.45 * len(scales) + 2))

    for i, (name, t_fine, rgb_fine) in enumerate(scales):
        gradient = np.clip(rgb_fine / 255.0, 0, 1)[np.newaxis, :, :]
        ax.imshow(gradient, aspect="auto", interpolation="bilinear",
                  extent=(float(t_fine.min()), float(t_fine.max()), i - 0.38, i + 0.38),
                  zorder=3)

    t_lo = min(float(tf.min()) for _, tf, _ in scales)
    t_hi = max(float(tf.max()) for _, tf, _ in scales)
    ax.set_xlim(t_lo - 1, t_hi + 1)
    ax.set_ylim(-0.6, len(scales) - 0.4)
    ax.invert_yaxis()  # kleinster Minimalwert oben

    ax.set_yticks(range(len(scales)))
    ax.set_yticklabels([name for name, _, _ in scales], fontsize=8, family="monospace")
    ax.set_xlabel("Temperatur [°C]")
    ax.xaxis.set_major_locator(tck.MultipleLocator(5))
    ax.xaxis.set_minor_locator(tck.MultipleLocator(1))
    ax.grid(True, axis="x", which="major", linestyle=":", alpha=0.6, zorder=0)

    ax.set_title("Farbskalen aller Wetterkarten (sortiert nach Minimaltemperatur)", fontsize=13)

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
                               title: str = "Wahrnehmungsbasierte Uniformitätsanalyse der Farbskala") -> None:
    """Visualisiert die Uniformitaetsanalyse der Farbskala.

    Vier Panels ueber einer gemeinsamen Temperaturachse, darunter die
    Farbskala als Kontextleiste:
      1. dE00 je 1-°C-Schritt (Balken in der Farbe des Schrittmittels) mit
         Bootstrap-Fehlerbalken, JND-Linie und Mittelwertlinie; Anomalien
         sind markiert (o = unter JND, ^ = Sprung > Mittel + 2 Std).
      2. Kumulative perzeptuelle Bogenlaenge S(T) mit linearer Referenz.
      3. Helligkeitsverlauf L*(T) (Monotonie-Check nach Kovesi).
      4. Metrikvergleich dE76 / dE00 / CAM16-UCS, je auf ihren Mittelwert
         normiert (zeigt Modellunabhaengigkeit der Befunde).

    Args:
        result: Ergebnis-Dict aus analyze_perceptual_uniformity().
        temps: Temperaturen der Skalenpunkte.
        scale_rgb: (N, 3)-Array der Skalenfarben.
        output_dir: Ausgabeverzeichnis.
        filename: Dateiname der Grafik.
        title: Gesamttitel der Grafik.
    """
    Path(output_dir).mkdir(parents=True, exist_ok=True)

    t_mid = result["t_mid"]
    de00 = result["de00"]
    t_min, t_max = float(temps.min()), float(temps.max())
    # Farbe des Schrittmittels: Mittel der beiden angrenzenden Skalenfarben
    step_colors = np.clip((scale_rgb[:-1] + scale_rgb[1:]) / 2.0 / 255.0, 0, 1)

    fig, axes = plt.subplots(
        5, 1, figsize=(12, 14), sharex=True,
        gridspec_kw={"height_ratios": [3, 2.5, 2, 2.5, 0.5], "hspace": 0.3},
    )
    ax1, ax2, ax3, ax4, ax_bar = axes

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

    # Panel 4: Metrikvergleich (auf Mittelwert normiert)
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
                         filename: str = "all_rgb_cie1931.png") -> None:
    """Zeichnet alle Messwerte in ein CIE-1931-Chromatizitaetsdiagramm.

    Die RGB-Werte werden als sRGB interpretiert, nach CIE-xy umgerechnet und
    mit ihrer Temperatur beschriftet. Zusaetzlich wird der Rec.709/sRGB-Gamut
    eingezeichnet.

    Args:
        rgb_map: Zuordnung Temperatur -> Liste von (R, G, B)-Messwerten.
        output_dir: Ausgabeverzeichnis.
        filename: Dateiname der Grafik.
    """
    Path(output_dir).mkdir(parents=True, exist_ok=True)

    fig, ax = plt.subplots(figsize=(8, 8))
    n = draw_cie1931(ax, rgb_map)
    if n == 0:
        plt.close(fig)
        return

    ax.set_title(f"CIE 1931 – Alle RGB Samples (n={n})", fontsize=16)

    plt.tight_layout()
    out_path = Path(output_dir) / filename
    plt.savefig(out_path, dpi=300)
    plt.close(fig)


def draw_cie1931(ax, rgb_map: Dict[int, List[Tuple[float, float, float]]]) -> int:
    """Zeichnet die Messwerte in ein CIE-1931-Diagramm auf gegebene Achse.

    Args:
        ax: Matplotlib-Achse, in die gezeichnet wird.
        rgb_map: Zuordnung Temperatur -> Liste von (R, G, B)-Messwerten.

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
    t_fine, rgb_fine = fit_color_spline_lab(temps, scale_rgb)

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

    plot_all_rgb_cie1931(rgb_map, output_dir=output_dir)
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

    # ------------------------------------------------------------------
    # Skalenvarianten isolieren: die Redaktion verschiebt die Farbskala
    # je nach Wetterlage in Temperaturrichtung, daher koennen verschiedene
    # Temperaturen dieselbe Farbe tragen. Trennung ueber Band-Clustering
    # und Offset-Schaetzung je Bild.
    # ------------------------------------------------------------------
    samples = build_samples(per_file)
    band_colors = cluster_palette(samples)
    offsets, _ = estimate_scale_offsets(samples)
    variants = group_scale_variants(offsets)
    n_var = max(variants.values()) + 1

    print()
    print(f"Skalenvarianten: {len(band_colors)} Farbbänder in der Palette, "
          f"{n_var} Variante(n) über {len(offsets)} Bilder")
    for fn in sorted(offsets, key=lambda f: (variants[f], offsets[f], f)):
        print(f"  V{variants[fn]}  Offset {offsets[fn]:+5.1f} °C  {fn}")

    plot_scale_variants(samples, offsets, variants, output_dir=output_dir)

    # Validierung: maximale Farbdifferenz je Temperatur — gemischt muss sie
    # gross sein (verschobene Skalen), je Variante klein (unimodal)
    def max_de_per_temp(sample_list: List[dict]) -> float:
        by_t: Dict[float, List[np.ndarray]] = defaultdict(list)
        for s in sample_list:
            by_t[s["temp"]].append(s["lab"])
        worst = 0.0
        for labs in by_t.values():
            for i in range(len(labs)):
                for j in range(i + 1, len(labs)):
                    worst = max(worst, float(colour.delta_E(labs[i], labs[j], method="CIE 2000")))
        return worst

    worst_mixed = max_de_per_temp(samples)
    worst_split = max(
        (max_de_per_temp([s for s in samples if variants[s["file"]] == v]) for v in range(n_var)),
        default=0.0)
    aligned = [{**s, "temp": float(round(s["temp"] - offsets[s["file"]]))} for s in samples]
    worst_aligned = max_de_per_temp(aligned)
    print(f"  Validierung max ΔE00 je Temperatur: gemischt = {worst_mixed:.1f}, "
          f"innerhalb der Varianten = {worst_split:.1f}, "
          f"offset-korrigiert = {worst_aligned:.1f}")

    # Referenzskala: alle Messungen um ihren Bild-Offset verschoben und
    # gemeinsam ausgewertet — die eigentliche, verschiebungsbereinigte
    # Zuordnung Farbband -> relative Temperatur mit maximaler Datenbasis.
    # Die Temperaturachse ist relativ zur Referenzvariante (Offset 0).
    ref_map: Dict[int, List[Tuple[float, float, float]]] = defaultdict(list)
    for s in aligned:
        ref_map[int(s["temp"])].append(tuple(s["rgb"]))

    temps_r, scale_r = compute_color_scale(ref_map)
    t_fine_r, rgb_fine_r = fit_color_spline_lab(temps_r, scale_r)
    result_r = analyze_perceptual_uniformity(temps_r, scale_r, ref_map)
    print_uniformity_report(result_r, "Uniformitätsanalyse — Referenzskala (offset-korrigiert, alle Bilder)")
    plot_color_scale_bar(temps_r, scale_r, t_fine_r, rgb_fine_r,
                         output_dir=output_dir, filename="farbskala_referenz.png")
    plot_perceptual_uniformity(
        result_r, temps_r, scale_r, output_dir=output_dir,
        filename="wahrnehmung_uniformitaet_referenz.png",
        title="Wahrnehmungsbasierte Uniformitätsanalyse — Referenzskala (offset-korrigiert)")

    # Skala und Uniformitaetsanalyse je Variante
    for v in range(n_var):
        v_files = {fn for fn, vv in variants.items() if vv == v}
        v_map: Dict[int, List[Tuple[float, float, float]]] = defaultdict(list)
        for s in samples:
            if s["file"] in v_files:
                v_map[int(s["temp"])].append(tuple(s["rgb"]))

        v_off = float(np.mean([offsets[fn] for fn in v_files]))
        label = f"Variante V{v} (Offset {v_off:+.1f} °C, {len(v_files)} Bild(er))"

        if len(v_map) < 5:
            print(f"\n{label}: nur {len(v_map)} Temperaturen — Analyse übersprungen")
            continue

        temps_v, scale_v = compute_color_scale(v_map)
        t_fine_v, rgb_fine_v = fit_color_spline_lab(temps_v, scale_v)
        result_v = analyze_perceptual_uniformity(temps_v, scale_v, v_map)
        print_uniformity_report(result_v, f"Uniformitätsanalyse — {label}")
        plot_color_scale_bar(temps_v, scale_v, t_fine_v, rgb_fine_v,
                             output_dir=output_dir, filename=f"farbskala_V{v}.png")
        plot_perceptual_uniformity(
            result_v, temps_v, scale_v, output_dir=output_dir,
            filename=f"wahrnehmung_uniformitaet_V{v}.png",
            title=f"Wahrnehmungsbasierte Uniformitätsanalyse — {label}")


if __name__ == "__main__":
    main()
