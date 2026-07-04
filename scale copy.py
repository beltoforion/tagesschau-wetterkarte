import cv2
import os
import numpy as np
import easyocr
import json
import matplotlib.pyplot as plt
import matplotlib.ticker as tck
import matplotlib.patheffects as pe
import numpy as np
import colour
import colour.plotting as cl

from cv2.typing import MatLike
from typing import Dict, List, Tuple
from collections import defaultdict
from colour import XYZ_to_xy
from colour.colorimetry import MSDS_CMFS
from pathlib import Path
from mpl_toolkits.mplot3d import Axes3D  
from numpy.typing import NDArray
from typing import Any


def pre_process_file(input_file : str, output_dir : str, debug : bool = False) -> Tuple[MatLike, np.ndarray]:
    img : MatLike | None = cv2.imread(input_file)
    if img is None:
        raise FileNotFoundError(f"Input file {input_file} could not be read as an image.")

    w,h = img.shape[1], img.shape[0]

    # wenn das bild 1920x1080 ist, dann wird es um die hälfte runterskaliert. OCR funktioniert zuverlässiger
    # mit kleineren Bildern
#    if w==1920 and h==1080:
#        proc = cv2.resize(img, (int(w/2), int(h/2)), interpolation=cv2.INTER_AREA)
#        proc = cv2.GaussianBlur(img, (5, 5), 0)

    return img, img

    proc = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    if debug:
        cv2.imwrite(os.path.join(output_dir, "proc_01_gray.png"), proc)

    proc = cv2.bitwise_not(proc)
    if debug:
        cv2.imwrite(os.path.join(output_dir, "proc_02_inverted.png"), proc)

    threshold = 25
    proc = np.where(proc <= threshold, 0, 255).astype(np.uint8)
    if debug:    
        cv2.imwrite(os.path.join(output_dir, "proc_03_threshold.png"), proc)

#    proc = cv2.GaussianBlur(proc, (3, 3), 0)
#    if debug:    
#        cv2.imwrite(os.path.join(output_dir, "proc_04_blur.png"), proc)

    return img, proc

    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    inv = cv2.bitwise_not(gray)
    cv2.imwrite(os.path.join(output_dir, "01_inverted.png"), inv)

    # 2. Harte Schwelle: nur sehr dunkle Pixel ≤ 25 behalten
    threshold = 25
    raw_mask = np.where(inv <= threshold, 0, 255).astype(np.uint8)
    cv2.imwrite(os.path.join(output_dir, "02_mask_thresh.png"), raw_mask)

    # 3. Connected Components: kleine Fragmente entfernen
    num_labels, labels, stats, _ = cv2.connectedComponentsWithStats(255 - raw_mask, connectivity=8)

    min_area = 30
    clean_mask = np.full_like(raw_mask, 255)  # Start: alles weiß

    for i in range(1, num_labels):  # i=0 ist Hintergrund
        area = stats[i, cv2.CC_STAT_AREA]
        if area >= min_area:
            clean_mask[labels == i] = 0  # behalten

    cv2.imwrite(os.path.join(output_dir, "03_mask_cleaned.png"), clean_mask)
    return img, clean_mask


def detect_temp_values(img: np.ndarray, box_scale: float = 0.8):
    g = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY) if img.ndim == 3 else img.astype(np.uint8, copy=False)
    H, W = g.shape[:2]

    scale = 2.0
    g_up = cv2.resize(g, None, fx=scale, fy=scale, interpolation=cv2.INTER_LINEAR)
    rgb = cv2.cvtColor(g_up, cv2.COLOR_GRAY2RGB)

    reader = easyocr.Reader(['en'], gpu=False, verbose=False)
    results = reader.readtext(rgb, detail=1, paragraph=False, min_size=5, low_text=0.3, text_threshold=0.5)

    boxes = []
    for bbox, text, score in results:
        t = (text or "").strip().replace("−","-").replace("–","-").replace("—","-")
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

        if w_up <= 0 or h_up <= 0 or w_up > 2.5 * h_up:
            continue

        # back-scale to processed image size
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
        a1 = w * h
        a2 = W * H
        area_perc = a1 / a2
        if t=="0":
            if area_perc < 0.0004:
                continue

        # resize box around its center
        if box_scale != 1.0:
            nw = max(1, int(round(w * box_scale)))
            nh = max(1, int(round(h * box_scale)))
            x = int(round(cx - nw / 2.0))
            y = int(round(cy - nh / 2.0))
            w, h = nw, nh

            # clamp to image bounds
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
    H, W = orig_img.shape[:2]
    x, y, w, h = int(b["x"]), int(b["y"]), int(b["w"]), int(b["h"])

    # Candidate x positions (left and right outside edges)
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


def process_file(input_file: str, output_dir: str, average_rgb_map : bool, debug: bool):
    if not os.path.exists(input_file):
        raise FileNotFoundError(f"Input file {input_file} does not exist.")

    original, processed = pre_process_file(input_file, output_dir, debug)
    boxes = detect_temp_values(processed)

    # mean RGB per box and aggregation per detected number
    rgb_map: dict[int, list[Tuple[float, float, float]]] = {}
    for b in boxes:
        mean_rgb = sample_box_rgb(original, b)  # (R, G, B)
        b["rgb_mean"] = mean_rgb
        try:
            num = int(str(b["text"]))
        except ValueError:
            continue
        rgb_map.setdefault(num, []).append(mean_rgb)

    # draw result (outline in mean color, value as text)
    img_result = original.copy()
    for bx in boxes:
        x, y, w, h = int(bx["x"]), int(bx["y"]), int(bx["w"]), int(bx["h"])
        r, g, b = bx["rgb_mean"]
        color_bgr = (int(np.clip(b, 0, 255)),
                     int(np.clip(g, 0, 255)),
                     int(np.clip(r, 0, 255)))
        # optional black border for visibility then mean color on top
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
        # average RGB per detected number
        for k, vlist in rgb_map.items():
            if len(vlist) > 1:
                mean_rgb = tuple(float(c) for c in np.mean(np.array(vlist, dtype=float), axis=0))
                rgb_map[k] = [mean_rgb]

    return img_result, rgb_map


def process_folder(input_dir: str, output_dir: str, debug: bool = False) -> Dict[int, List[Tuple[float, float, float]]]:
    exts = {".png", ".jpg", ".jpeg", ".webp", ".bmp", ".tif", ".tiff"}
    os.makedirs(output_dir, exist_ok=True)

    agg: Dict[int, List[Tuple[float, float, float]]] = defaultdict(list)

    for fn in sorted(os.listdir(input_dir)):
        ext = os.path.splitext(fn.lower())[1]
        if ext in exts:
            path = os.path.join(input_dir, fn)
            try:
                _, rgb_map = process_file(path, output_dir, average_rgb_map=True, debug=debug)

                # per-file CIE plot
                stem, ext_orig = os.path.splitext(fn)
                cie_filename = f"{stem}_cie{ext_orig}"
                plot_all_rgb_cie1931(rgb_map, output_dir=output_dir, filename=cie_filename)

                # aggregate
                for k, vlist in rgb_map.items():
                    agg[k].extend(vlist)
            except Exception:
                pass  # skip unreadable/corrupt files silently

    return agg


def save_rgb_map(path: str, rgb_map: Dict[int, List[Tuple[float, float, float]]]) -> None:
    data = {str(k): [list(map(float, triplet)) for triplet in v] for k, v in rgb_map.items()}
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def load_rgb_map(path: str) -> Dict[int, List[Tuple[float, float, float]]]:
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)
    out: Dict[int, List[Tuple[float, float, float]]] = {}
    for k, lst in data.items():
        out[int(k)] = [tuple(map(float, triplet)) for triplet in lst]
    return out


def plot_all_rgb_cie1931(rgb_map: Dict[int, List[Tuple[float, float, float]]],
                         output_dir: str,
                         filename: str = "all_rgb_cie1931.png") -> None:
    Path(output_dir).mkdir(parents=True, exist_ok=True)

    # flatten while keeping labels
    labels = []
    all_rgb = []
    for temp, samples in rgb_map.items():
        for rgb in samples:
            labels.append(str(temp))
            all_rgb.append(rgb)

    if not all_rgb:
        return

    rgb = (np.asarray(all_rgb, dtype=float) / 255.0).clip(0, 1)
    XYZ = colour.sRGB_to_XYZ(rgb)
    xy = colour.XYZ_to_xy(XYZ)

    fig, ax = plt.subplots(figsize=(8, 8))

    # background
    cl.plot_chromaticity_diagram_CIE1931(
        cmfs="CIE 1931 2 Degree Standard Observer",
        axes=ax,
        show=False,
        title=None,
        spectral_locus_colours="RGB",
        spectral_locus_markers=None,
    )

    # Funktion für Gammuts
    def plot_gamut(ax, primaries, white, label, color):
        poly = np.vstack([primaries, primaries[0]])
        ax.plot(poly[:, 0], poly[:, 1], color=color, linewidth=1.2,
                label=label, zorder=40)
        ax.plot(white[0], white[1], "o", color=color, markersize=4, zorder=41)

    # Gammuts definieren
    pal_primaries = np.array([[0.640, 0.330],
                              [0.290, 0.600],
                              [0.150, 0.060]])
    rec709_primaries = np.array([[0.640, 0.330],
                                 [0.300, 0.600],
                                 [0.150, 0.060]])
    white = (0.3127, 0.3290)

    plot_gamut(ax, rec709_primaries, white, "Rec.709 / sRGB (HDTV/Web)", "blue")

    # axes, ticks, grid
    ax.set_xlim(0.0, 0.80)
    ax.set_ylim(0.0, 0.90)
    ax.set_aspect("equal", adjustable="box")
    ax.xaxis.set_major_locator(tck.MultipleLocator(0.1))
    ax.xaxis.set_minor_locator(tck.MultipleLocator(0.01))
    ax.yaxis.set_major_locator(tck.MultipleLocator(0.1))
    ax.yaxis.set_minor_locator(tck.MultipleLocator(0.01))
    ax.grid(True, which="major", linestyle="--", linewidth=0.8, alpha=0.8)
    ax.grid(True, which="minor", linestyle=":", linewidth=0.6, alpha=0.4)

    # scatter points colored by their RGB
    ax.scatter(xy[:, 0], xy[:, 1], c=rgb, s=14, alpha=0.95, edgecolors="none", zorder=30)

    # labels with small font and white outline for legibility
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

    ax.set_title(f"CIE 1931 – Alle RGB Samples (n={len(rgb)})", fontsize=16)
    ax.set_xlabel("x", fontsize=14)
    ax.set_ylabel("y", fontsize=14)

    plt.tight_layout()
    out_path = Path(output_dir) / filename
    plt.savefig(out_path, dpi=300)
    plt.close(fig)


def _mean_samples_per_temp(rgb_map: Dict[int, List[Tuple[float, float, float]]]) -> Tuple[np.ndarray, np.ndarray]:
    temps, rgbs = [], []
    for t, samples in rgb_map.items():
        arr = np.asarray(samples, dtype=float)
        if arr.size == 0:
            continue
        temps.append(t)
        rgbs.append(arr.mean(axis=0))
    if not temps:
        return np.empty((0,)), np.empty((0, 3))
    T = np.asarray(temps, dtype=float)
    RGB = np.asarray(rgbs, dtype=float)  # shape (n,3)
    # sort by temperature for nicer plots
    idx = np.argsort(T)
    return T[idx], RGB[idx]


def fit_rgb_polynomial(rgb_map: Dict[int, List[Tuple[float, float, float]]], order: int = 7) -> Dict[str, Any]:
    """
    Fit R(T), G(T), B(T) with degree-'order' polynomials.
    Uses a scaled temperature z in [-1, 1] for numerical stability:
      z = (T - t0) / s, where t0 = (Tmin+Tmax)/2, s = (Tmax-Tmin)/2.
    Returns coefficients for R(z), G(z), B(z) plus scaling.
    """
    T, RGB = _mean_samples_per_temp(rgb_map)
    if T.size == 0:
        raise ValueError("No data to fit.")

    tmin, tmax = float(T.min()), float(T.max())
    t0 = 0.5 * (tmin + tmax)
    s = max(1e-9, 0.5 * (tmax - tmin))  # avoid zero division if single T

    z = (T - t0) / s
    R, G, B = RGB[:, 0], RGB[:, 1], RGB[:, 2]

    # polyfit returns highest-order first, for use with np.polyval
    cr = np.polyfit(z, R, deg=order)
    cg = np.polyfit(z, G, deg=order)
    cb = np.polyfit(z, B, deg=order)

    return {
        "order": int(order),
        "t0": float(t0),
        "s": float(s),
        "coeff_r": cr.tolist(),
        "coeff_g": cg.tolist(),
        "coeff_b": cb.tolist(),
        "domain": [tmin, tmax],
        "n_points": int(T.size),
    }


def save_rgb_fit(path: str, fit: Dict[str, Any]) -> None:
    with open(path, "w", encoding="utf-8") as f:
        json.dump(fit, f, ensure_ascii=False, indent=2)


def eval_rgb_fit(fit: Dict[str, Any], T: NDArray[np.floating]) -> np.ndarray:
    """
    Evaluate fitted RGB at temperatures T.
    Returns array shape (len(T), 3). Values are not clipped.
    """
    t0 = fit["t0"]; s = fit["s"]
    z = (np.asarray(T, dtype=float) - t0) / s
    R = np.polyval(np.asarray(fit["coeff_r"], dtype=float), z)
    G = np.polyval(np.asarray(fit["coeff_g"], dtype=float), z)
    B = np.polyval(np.asarray(fit["coeff_b"], dtype=float), z)
    return np.stack([R, G, B], axis=1)


def plot_rgb_fit_3d(
    rgb_map: Dict[int, List[Tuple[float, float, float]]],
    fit: Dict[str, Any],
    output_dir: str,
    filename: str = "all_rgb_3d_fit.png",
    n_curve: int = 200
) -> None:
    """
    3D scatter of samples + fitted 7th-order RGB(T) curve.
    The curve is colorized by its own RGB.
    """
    Path(output_dir).mkdir(parents=True, exist_ok=True)

    # Gather raw points
    pts = [rgb for samples in rgb_map.values() for rgb in samples]
    if pts:
        pts = np.asarray(pts, dtype=float)
    else:
        pts = np.empty((0, 3))

    # Build temperature grid over the observed range
    tmin, tmax = fit["domain"]
    Tgrid = np.linspace(tmin, tmax, n_curve)
    curve = eval_rgb_fit(fit, Tgrid)
    curve_clipped = np.clip(curve, 0, 255)
    curve_colors = (curve_clipped / 255.0).clip(0, 1)

    fig = plt.figure(figsize=(8, 7))
    ax = fig.add_subplot(111, projection="3d")

    # scatter raw points
    if pts.size:
        ax.scatter(pts[:, 0], pts[:, 1], pts[:, 2],
                   c=(pts / 255.0).clip(0, 1),
                   s=16, depthshade=False, alpha=0.6, label="Samples")

    # fitted curve
    ax.plot(curve_clipped[:, 0], curve_clipped[:, 1], curve_clipped[:, 2],
            linewidth=2.0, label=f"Poly fit (deg {fit['order']})", color=None)

    # To color the path by its own RGB, overplot small segments
    for i in range(len(curve_clipped) - 1):
        seg = curve_clipped[i:i+2]
        ax.plot(seg[:, 0], seg[:, 1], seg[:, 2], linewidth=2.0, color=curve_colors[i])

    ax.set_xlabel("R")
    ax.set_ylabel("G")
    ax.set_zlabel("B")
    ax.set_xlim(0, 255); ax.set_ylim(0, 255); ax.set_zlim(0, 255)
    ax.set_box_aspect((1, 1, 1))
    ax.set_title(f"RGB 3D with 7th-order fit (n={fit['n_points']})")
    ax.legend(loc="upper left")

    plt.tight_layout()
    out_path = Path(output_dir) / filename
    plt.savefig(out_path, dpi=300)
    plt.close(fig)


def make_temperature_scale(
    fit: Dict[str, any],
    output_dir: str,
    filename: str = "temperature_scale.png",
    width: int = 1200,
    height: int = 80,
    n_steps: int = 500) -> str:

    Path(output_dir).mkdir(parents=True, exist_ok=True)
    tmin, tmax = float(fit["domain"][0]), float(fit["domain"][1])

    # Sample temperatures and evaluate RGB
    T_steps = np.linspace(tmin, tmax, n_steps)
    rgb_steps = np.clip(eval_rgb_fit(fit, T_steps), 0, 255)

    x_pos = np.linspace(0, n_steps - 1, width)
    r = np.interp(x_pos, np.arange(n_steps), rgb_steps[:, 0])
    g = np.interp(x_pos, np.arange(n_steps), rgb_steps[:, 1])
    b = np.interp(x_pos, np.arange(n_steps), rgb_steps[:, 2])
    row = np.stack([b, g, r], axis=1).astype(np.uint8)  # BGR for OpenCV
    img = np.tile(row[None, :, :], (height, 1, 1))

    out_path = str(Path(output_dir) / filename)
    cv2.imwrite(out_path, img)
    return out_path


def plot_rgb_fit_cie1931(
    rgb_map: Dict[int, List[Tuple[float, float, float]]],
    fit: Dict[str, Any],
    output_dir: str,
    filename: str = "all_rgb_cie1931_with_fit.png",
    n_curve: int = 300
) -> None:
    """
    CIE 1931 plot of sample points + fitted RGB(T) curve coloured by its own RGB.
    """
    Path(output_dir).mkdir(parents=True, exist_ok=True)

    # Samples
    labels, all_rgb = [], []
    for temp, samples in rgb_map.items():
        for rgb in samples:
            labels.append(str(temp))
            all_rgb.append(rgb)

    # Evaluate fit
    tmin, tmax = float(fit["domain"][0]), float(fit["domain"][1])
    Tgrid = np.linspace(tmin, tmax, n_curve)
    curve_rgb = np.clip(eval_rgb_fit(fit, Tgrid), 0, 255)

    # Convert to xy
    if all_rgb:
        rgb_s = (np.asarray(all_rgb, dtype=float) / 255.0).clip(0, 1)
        XYZ_s = colour.sRGB_to_XYZ(rgb_s)
        xy_s = colour.XYZ_to_xy(XYZ_s)
    else:
        xy_s = np.empty((0, 2))

    rgb_c = (curve_rgb / 255.0).clip(0, 1)
    XYZ_c = colour.sRGB_to_XYZ(rgb_c)
    xy_c = colour.XYZ_to_xy(XYZ_c)

    # Plot
    fig, ax = plt.subplots(figsize=(8, 8))
    cl.plot_chromaticity_diagram_CIE1931(
        cmfs="CIE 1931 2 Degree Standard Observer",
        axes=ax, show=False, title=None,
        spectral_locus_colours="RGB", spectral_locus_markers=None,
    )

    # Rec.709 gamut outline
    def plot_gamut(ax_, primaries, white, label, color):
        poly = np.vstack([primaries, primaries[0]])
        ax_.plot(poly[:, 0], poly[:, 1], color=color, linewidth=1.2, label=label, zorder=40)
        ax_.plot(white[0], white[1], "o", color=color, markersize=4, zorder=41)

    rec709_primaries = np.array([[0.640, 0.330],
                                 [0.300, 0.600],
                                 [0.150, 0.060]])
    white = (0.3127, 0.3290)
    plot_gamut(ax, rec709_primaries, white, "Rec.709 / sRGB", "blue")

    # Axes
    ax.set_xlim(0.0, 0.80)
    ax.set_ylim(0.0, 0.90)
    ax.set_aspect("equal", adjustable="box")
    ax.xaxis.set_major_locator(tck.MultipleLocator(0.1))
    ax.xaxis.set_minor_locator(tck.MultipleLocator(0.01))
    ax.yaxis.set_major_locator(tck.MultipleLocator(0.1))
    ax.yaxis.set_minor_locator(tck.MultipleLocator(0.01))
    ax.grid(True, which="major", linestyle="--", linewidth=0.8, alpha=0.8)
    ax.grid(True, which="minor", linestyle=":", linewidth=0.6, alpha=0.4)

    # Samples
    if xy_s.size:
        ax.scatter(xy_s[:, 0], xy_s[:, 1], c=rgb_s, s=14, alpha=0.9, edgecolors="none", zorder=30)
        for (xv, yv), lbl in zip(xy_s, labels):
            ax.text(xv, yv, lbl, fontsize=6, ha="left", va="bottom",
                    clip_on=True, path_effects=[pe.withStroke(linewidth=1, foreground="white")],
                    zorder=99)

    # Fitted curve (colorized segments by its own RGB)
    for i in range(len(xy_c) - 1):
        seg = xy_c[i:i+2]
        ax.plot(seg[:, 0], seg[:, 1], linewidth=2.0, color=rgb_c[i], zorder=60)
    # Optional endpoints markers
    ax.plot(xy_c[[0, -1], 0], xy_c[[0, -1], 1], "o", markersize=3, color="k", zorder=61)

    ax.set_title(f"CIE 1931 – Samples + Fit (deg {fit['order']})", fontsize=16)
    ax.set_xlabel("x", fontsize=14)
    ax.set_ylabel("y", fontsize=14)
    plt.tight_layout()
    out_path = Path(output_dir) / filename
    plt.savefig(out_path, dpi=300)
    plt.close(fig)


def main():
#    input_file = "./bilder_wetterkarten_de_2025/nacht-2025-05-02.webp"
    input_file = "./bilder_wetterkarten_de_2025/tag-2025-02-16.png"
    input_file = "./bilder_wetterkarten_de_2025/tag-2025-07-01.webp"
    input_dir = "./bilder_wetterkarten_de_2025/"
    output_dir = "./output/"

#    img_result, rgb_map = process_file(input_file, output_dir, average_rgb_map=True, debug=True)
#    exit(0)

    if not os.path.exists(os.path.join(output_dir, "aggregated_rgb_map.json")):
        rgb_map = process_folder(input_dir, output_dir, debug=False)
        save_rgb_map(os.path.join(output_dir, "aggregated_rgb_map.json"), rgb_map)
    else:
        rgb_map = load_rgb_map(os.path.join(output_dir, "aggregated_rgb_map.json"))

    for num, samples in sorted(rgb_map.items()):
        s = ", ".join(f"({r:.1f}, {g:.1f}, {b:.1f})" for r, g, b in samples)
        print(f"{num}: [{s}]")

    # 3d Chart with all temp values
    order = 11
    fit = fit_rgb_polynomial(rgb_map, order)
    save_rgb_fit(os.path.join(output_dir, f"all_rgb_fit_deg{order}.json"), fit)
    plot_rgb_fit_3d(rgb_map, fit, output_dir=output_dir, filename=f"all_rgb_3d_deg{order}_fit.png", n_curve=200)
    make_temperature_scale(
        fit,
        output_dir=output_dir,
        filename=f"all_temperature_scale_deg{order}.png",
        width=1200,
        height=80,
        n_steps=500)

    plot_all_rgb_cie1931(rgb_map, output_dir="./output")
    plot_rgb_fit_cie1931(
        rgb_map, fit,
        output_dir=output_dir,
        filename=f"all_rgb_cie1931_with_fit_deg{order}.png",
        n_curve=300
    )

if __name__ == "__main__":
    main()