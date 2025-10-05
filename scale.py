import cv2
import os
import numpy as np
import easyocr

from typing import Tuple
from cv2.typing import MatLike
from collections import defaultdict
from typing import Dict, List


def pre_process_file(input_file : str, output_dir : str, debug : bool = False) -> Tuple[MatLike, np.ndarray]:
    img : MatLike | None = cv2.imread(input_file)
    if img is None:
        raise FileNotFoundError(f"Input file {input_file} could not be read as an image.")
    
    return img, img


def detect_temp_values(img: np.ndarray, box_scale: float = 0.9):
    """
    OCR via EasyOCR. Returns [{'text','x','y','w','h','conf'}, ...]
    box_scale > 1 enlarges boxes; < 1 shrinks them. Centers stay fixed.
    """
    # grayscale uint8
    g = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY) if img.ndim == 3 else img.astype(np.uint8, copy=False)
    H, W = g.shape[:2]

    # upscale for OCR
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
        if not (-30 <= val <= 45) or score < 0.50:
            continue

        xs = [p[0] for p in bbox]; ys = [p[1] for p in bbox]
        x1, y1, x2, y2 = int(min(xs)), int(min(ys)), int(max(xs)), int(max(ys))
        w_up, h_up = x2 - x1, y2 - y1
        if w_up <= 0 or h_up <= 0 or w_up > 2.5 * h_up:
            continue

        # back-scale to processed image size
        x = int(x1 / scale); y = int(y1 / scale)
        w = int(w_up / scale); h = int(h_up / scale)

        # --- resize box around its center ---
        if box_scale != 1.0:
            cx = x + w / 2.0
            cy = y + h / 2.0
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
        # ------------------------------------

        boxes.append({"text": t, "x": x, "y": y, "w": w, "h": h, "conf": float(score)})

    boxes.sort(key=lambda b: (b["y"] // 10, b["x"]))
    return boxes



def detect_temp_valuessss(img: np.ndarray):
    g = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY) if img.ndim == 3 else img.astype(np.uint8, copy=False)

    scale = 2.0
    g_up = cv2.resize(g, None, fx=scale, fy=scale, interpolation=cv2.INTER_LINEAR)

    rgb = cv2.cvtColor(g_up, cv2.COLOR_GRAY2RGB)

    reader = easyocr.Reader(['en'], gpu=False, verbose=False)

    results = reader.readtext(rgb, detail=1, paragraph=False, min_size=5, low_text=0.3, text_threshold=0.5)

    boxes = []
    for bbox, text, score in results:
        t = text.strip()
        if not t:
            continue

        t = t.replace("−", "-").replace("–", "-").replace("—", "-")
        if not (t.isdigit() or (t.startswith("-") and t[1:].isdigit())):
            continue
        try:
            val = int(t)
        except ValueError:
            continue

        if not (-30 <= val <= 45):
            continue

        if score < 0.50:
            continue

        # bbox is a 4-point polygon [[x1,y1],[x2,y2],[x3,y3],[x4,y4]]
        xs = [p[0] for p in bbox]; ys = [p[1] for p in bbox]
        x1, y1, x2, y2 = int(min(xs)), int(min(ys)), int(max(xs)), int(max(ys))
        w, h = x2 - x1, y2 - y1

        # filter obvious scraps
        if w <= 0 or h <= 0 or w > 2.5 * h:
            continue

        # backscale to processed image size
        x = int(x1 / scale) 
        y = int(y1 / scale)
        w = int(w / scale) 
        h = int(h / scale)

        boxes.append({"text": t, "x": x, "y": y, "w": w, "h": h, "conf": float(score)})

    boxes.sort(key=lambda b: (b["y"] // 10, b["x"]))
    return boxes


def sample_box_rgb(orig_img: np.ndarray, b: dict, offset: int = 0, samples: int = 5) -> Tuple[float, float, float]:
    """
    Sample colors on vertical lines 5 px outside the left/right box edges.
    Take `samples` points evenly spaced along the box height.
    Return mean RGB.
    """
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


def process_file(input_file: str, output_dir: str, debug: bool = False):
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

    return img_result, rgb_map


def process_folder(input_dir: str, output_dir: str, debug: bool = False) -> Dict[int, List[Tuple[float, float, float]]]:
    """
    Process all images in a flat folder. Aggregates {number: [(R,G,B), ...]} over all files.
    """
    exts = {".png", ".jpg", ".jpeg", ".webp", ".bmp", ".tif", ".tiff"}
    os.makedirs(output_dir, exist_ok=True)

    agg: Dict[int, List[Tuple[float, float, float]]] = defaultdict(list)

    for fn in sorted(os.listdir(input_dir)):
        if os.path.splitext(fn.lower())[1] in exts:
            path = os.path.join(input_dir, fn)
            try:
                _, rgb_map = process_file(path, output_dir, debug=debug)
                for k, vlist in rgb_map.items():
                    agg[k].extend(vlist)
            except Exception:
                pass  # ignore unreadable/corrupt files

    return agg


def main():
#    input_file = "./bilder_wetterkarten_de_2025/nacht-2025-05-02.webp"
    input_file = "./bilder_wetterkarten_de_2025/nacht-2025-04-17.png"
    input_dir = "./bilder_wetterkarten_de_2025/"
    output_dir = "./output/"

#    img_result, rgb_map = process_file(input_file, output_dir, debug=True)
   
    rgb_map = process_folder(input_dir, output_dir, debug=False)
    for num, samples in sorted(rgb_map.items()):
        s = ", ".join(f"({r:.1f}, {g:.1f}, {b:.1f})" for r, g, b in samples)
        print(f"{num}: [{s}]")


if __name__ == "__main__":
    main()