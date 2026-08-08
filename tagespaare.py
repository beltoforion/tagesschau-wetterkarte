#!/usr/bin/env python3
"""Findet Zwillingstage der Jahre 2025 und 2026 anhand von DWD-Tageswerten.

Bezugsgroesse ist die Tagestemperaturkarte (Tageshoechstwerte TXK): fuer
jeden Tag des Untersuchungszeitraums werden aus den DWD-Klimastationen
(Tageswerte KL) das deutschlandweite Minimum und Maximum der
Tageshoechstwerte sowie deren Spanne bestimmt — also genau die Kennwerte,
die eine Tagestemperaturkarte zeigt. Anschliessend werden Paare aus je
einem 2025er und einem 2026er Tag gesucht. Die Kennwerte (Schwellwert) und
der Datumsabstand im Jahreslauf wirken dabei nur als Vorfilter — das
entscheidende Auswahlkriterium ist die OPTISCHE Aehnlichkeit: fuer alle
Kandidatenpaare wird das mittlere pixelweise CIEDE2000 (ΔE00) der in der
rekonstruierten Tagesschau-Basisskala gerenderten Temperaturfelder
berechnet, und die Paare mit den kleinsten ΔE00-Werten gewinnen. Fuer diese
Paare werden die beiden Tagestemperaturkarten (DWD-Messwerte) nebeneinander
gerendert — beide mit identischer, fest verankerter Skala, sodass gleiches
Wetter auch gleich aussieht.

Anders als dwd_tempkarte.collect_observations() laedt dieses Skript jedes
Stations-ZIP nur EINMAL (recent, bei Bedarf zusaetzlich historical fuer die
Tage vor dem recent-Fenster) und extrahiert daraus alle Tageszeilen des
Zeitraums. Die Rohdaten werden in cache/ als JSON abgelegt.

Aufruf (im Repo-Verzeichnis, venv):
    python tagespaare.py                 # fetch + Analyse + Karten
    python tagespaare.py --no-render     # nur Metriken und Paarliste
    python tagespaare.py --threshold 0.5 --max-pairs 12
"""

from __future__ import annotations

import argparse
import csv
import io
import json
import sys
import zipfile
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import date, datetime, timedelta
from pathlib import Path
from urllib.error import URLError, HTTPError

import colour
import matplotlib.pyplot as plt
import numpy as np
from matplotlib.colors import LinearSegmentedColormap, Normalize
from scipy.interpolate import griddata

import dwd_tempkarte as dwd
from dwd_tagesschau_vergleich import render, germany_mask
from scale import load_rgb_map, compute_color_scale, fit_color_spline_lab

START = date(2025, 1, 1)
END = date(2026, 7, 31)

# Bergstationen verfaelschen die deutschlandweiten Extrema (die Zugspitze
# liefert auch im Hochsommer Frost) — fuer die Tagesmetriken werden nur
# Stationen unterhalb dieser Hoehe beruecksichtigt. Die Karten selbst
# verwenden weiterhin alle Stationen.
MAX_HOEHE_M = 800.0

BULK_CACHE = dwd.CACHE_DIR / f"kl_bulk_{START.isoformat()}_{END.isoformat()}.json"
METRICS_CSV = Path("output/tagespaare/tagesmetriken.csv")
PAIRS_CSV = Path("output/tagespaare/tagespaare.csv")
MAP_DIR = Path("output/tagespaare")


# ----------------------------------------------------------------------
# Datenbeschaffung: ein ZIP je Station statt ein ZIP je Station und Tag
# ----------------------------------------------------------------------

def parse_product_rows(raw: str, lo: date, hi: date) -> dict[str, dict[str, float]]:
    """Extrahiert TXK/TNK aller Tage in [lo, hi] aus einer produkt_klima_tag-Datei.

    Returns:
        {"TXK": {iso_datum: wert}, "TNK": {...}} — fehlende Werte (-999)
        werden ausgelassen.
    """
    out: dict[str, dict[str, float]] = {"TXK": {}, "TNK": {}}
    lines = raw.splitlines()
    if not lines:
        return out
    header = [h.strip() for h in lines[0].split(";")]
    try:
        date_idx = header.index("MESS_DATUM")
        cols = {"TXK": header.index("TXK"), "TNK": header.index("TNK")}
    except ValueError:
        return out

    lo_key, hi_key = lo.strftime("%Y%m%d"), hi.strftime("%Y%m%d")
    for line in lines[1:]:
        fields = [f.strip() for f in line.split(";")]
        if len(fields) <= max(cols.values()):
            continue
        key = fields[date_idx]
        if not (lo_key <= key <= hi_key):
            continue
        iso = f"{key[:4]}-{key[4:6]}-{key[6:]}"
        for col, idx in cols.items():
            try:
                val = float(fields[idx])
            except ValueError:
                continue
            if val != dwd.MISSING:
                out[col][iso] = val
    return out


def read_station_zip(url: str, lo: date, hi: date) -> dict[str, dict[str, float]] | None:
    try:
        data = dwd.http_get(url, timeout=120)
        with zipfile.ZipFile(io.BytesIO(data)) as zf:
            prod = next((n for n in zf.namelist()
                         if n.startswith("produkt_klima_tag")), None)
            if not prod:
                return None
            with zf.open(prod) as f:
                raw = f.read().decode("latin-1")
    except (URLError, HTTPError, TimeoutError, zipfile.BadZipFile, KeyError):
        return None
    return parse_product_rows(raw, lo, hi)


def fetch_bulk(workers: int = 16) -> dict:
    """Laedt TXK/TNK aller Stationen fuer [START, END] und cached als JSON.

    Struktur des Ergebnisses:
        {"stations": {stid: {hoehe, lat, lon, name}},
         "TXK": {stid: {datum: wert}}, "TNK": {...}}
    """
    if BULK_CACHE.exists():
        print(f"[i] Bulk-Cache vorhanden: {BULK_CACHE}", file=sys.stderr)
        return json.loads(BULK_CACHE.read_text(encoding="utf-8"))

    recent_url = f"{dwd.CDC_BASE}/recent/"
    hist_url = f"{dwd.CDC_BASE}/historical/"

    print("[i] Lade Stationsliste (recent) …", file=sys.stderr)
    stations = dwd.parse_station_list(
        dwd.http_get(recent_url + "KL_Tageswerte_Beschreibung_Stationen.txt").decode("latin-1"))
    stations = [s for s in stations if s.bis >= START and s.von <= END]
    print(f"[i] {len(stations)} Stationen mit Daten im Zeitraum", file=sys.stderr)

    print("[i] Lese ZIP-Verzeichnisse (recent, historical) …", file=sys.stderr)
    zips = {
        recent_url: [n for n in dwd.list_dir(recent_url) if n.endswith(".zip")],
        hist_url: [n for n in dwd.list_dir(hist_url) if n.endswith(".zip")],
    }

    def find_zip(folder: str, stid: str) -> str | None:
        needle = f"_{stid}_"
        return next((n for n in zips[folder] if needle in n), None)

    result = {"stations": {}, "TXK": {}, "TNK": {}}

    def task(s: dwd.Station):
        name = find_zip(recent_url, s.stid)
        if not name:
            return s, None
        rows = read_station_zip(recent_url + name, START, END)
        if rows is None:
            return s, None
        # Tage vor dem recent-Fenster (~500 Tage) aus historical ergaenzen
        have = set(rows["TXK"]) | set(rows["TNK"])
        first = min(have) if have else END.isoformat()
        if first > START.isoformat():
            hist_name = find_zip(hist_url, s.stid)
            if hist_name:
                gap_hi = date.fromisoformat(first) - timedelta(days=1)
                hist = read_station_zip(hist_url + hist_name, START, gap_hi)
                if hist:
                    for col in ("TXK", "TNK"):
                        rows[col].update(hist[col])
        return s, rows

    done = 0
    with ThreadPoolExecutor(max_workers=workers) as ex:
        futures = [ex.submit(task, s) for s in stations]
        for fut in as_completed(futures):
            s, rows = fut.result()
            done += 1
            if done % 25 == 0:
                print(f"[i] {done}/{len(stations)} Stationen geladen …", file=sys.stderr)
            if rows and (rows["TXK"] or rows["TNK"]):
                result["stations"][s.stid] = {
                    "hoehe": s.hoehe, "lat": s.lat, "lon": s.lon, "name": s.name}
                result["TXK"][s.stid] = rows["TXK"]
                result["TNK"][s.stid] = rows["TNK"]

    print(f"[i] {len(result['stations'])} Stationen mit Daten", file=sys.stderr)
    BULK_CACHE.parent.mkdir(parents=True, exist_ok=True)
    BULK_CACHE.write_text(json.dumps(result), encoding="utf-8")
    print(f"[i] Bulk-Cache geschrieben: {BULK_CACHE}", file=sys.stderr)
    return result


# ----------------------------------------------------------------------
# Tagesmetriken und Paarsuche
# ----------------------------------------------------------------------

def daily_metrics(bulk: dict) -> dict[str, dict]:
    """Kennwerte der Tagestemperaturkarte je Tag: Min/Max/Spanne der TXK.

    tmin und tmax sind das deutschlandweite Minimum bzw. Maximum der
    Tageshoechstwerte — die Werte, die auf einer Tagestemperaturkarte als
    kleinste und groesste Zahl stehen. Tage mit auffaellig wenigen
    Stationsmeldungen (unter 80 % des Medians) werden verworfen — dort
    waeren die Extrema nicht belastbar.
    """
    flach = {stid for stid, m in bulk["stations"].items()
             if m["hoehe"] <= MAX_HOEHE_M}

    per_day: dict[str, dict] = {}
    d = START
    while d <= END:
        iso = d.isoformat()
        tx = [v[iso] for stid, v in bulk["TXK"].items() if stid in flach and iso in v]
        if tx:
            per_day[iso] = {
                "tmax": max(tx), "tmin": min(tx),
                "spanne": max(tx) - min(tx),
                "tmittel": sum(tx) / len(tx),
                "n_txk": len(tx),
            }
        d += timedelta(days=1)

    counts = sorted(m["n_txk"] for m in per_day.values())
    if not counts:
        return {}
    median_n = counts[len(counts) // 2]
    kept = {iso: m for iso, m in per_day.items()
            if m["n_txk"] >= 0.8 * median_n}
    dropped = len(per_day) - len(kept)
    if dropped:
        print(f"[i] {dropped} Tage wegen zu geringer Stationszahl verworfen",
              file=sys.stderr)
    return kept


def doy_distance(a: str, b: str) -> int:
    """Abstand zweier Daten im Jahreslauf in Tagen (zirkular, jahresunabhaengig)."""
    da = date.fromisoformat(a).timetuple().tm_yday
    db = date.fromisoformat(b).timetuple().tm_yday
    diff = abs(da - db)
    return min(diff, 365 - diff)


def candidate_pairs(metrics: dict[str, dict], threshold: float,
                    max_day_diff: int = 0,
                    mean_range: tuple[float, float] | None = None,
                    ) -> list[tuple[float, str, str]]:
    """Vorfilter fuer 2025↔2026-Paare: Chebyshev-Abstand ueber
    (tmin, tmax, spanne, tmittel) hoechstens `threshold`, Datumsabstand im
    Jahreslauf hoechstens `max_day_diff` Tage (0 = keine Einschraenkung).
    Mit `mean_range` kommen nur Tage infrage, deren deutschlandweites
    TXK-Mittel innerhalb des Bereichs liegt.

    Ohne die Datumsschranke gewinnen regelmaessig saisonfremde
    Kombinationen (Herbst ↔ Fruehjahr), weil Min/Max/Spanne die
    Jahreszeit kaum verraten. Die endgueltige Auswahl trifft
    select_pairs_visual() anhand der optischen Aehnlichkeit.
    """
    def in_range(iso: str) -> bool:
        if mean_range is None:
            return True
        return mean_range[0] <= metrics[iso]["tmittel"] <= mean_range[1]

    days25 = [iso for iso in metrics if iso.startswith("2025") and in_range(iso)]
    days26 = [iso for iso in metrics if iso.startswith("2026") and in_range(iso)]
    if mean_range is not None:
        print(f"[i] Mittelwert-Filter {mean_range[0]:g}–{mean_range[1]:g} °C: "
              f"{len(days25)} Tage 2025, {len(days26)} Tage 2026", file=sys.stderr)

    candidates = []
    for a in days25:
        ma = metrics[a]
        for b in days26:
            if max_day_diff > 0 and doy_distance(a, b) > max_day_diff:
                continue
            mb = metrics[b]
            dist = max(abs(ma["tmin"] - mb["tmin"]),
                       abs(ma["tmax"] - mb["tmax"]),
                       abs(ma["spanne"] - mb["spanne"]),
                       abs(ma["tmittel"] - mb["tmittel"]))
            if dist <= threshold:
                candidates.append((dist, a, b))
    candidates.sort()
    return candidates


# ----------------------------------------------------------------------
# Karten
# ----------------------------------------------------------------------

def base_cmap(json_path: str = "output_2025-2026/aggregated_rgb_map.json"):
    """Rekonstruierte Tagesschau-Basisskala als fest verankerte Colormap."""
    rgb_map = load_rgb_map(json_path)
    temps, scale_rgb = compute_color_scale(rgb_map)
    t_fine, rgb_fine = fit_color_spline_lab(temps, scale_rgb)
    cmap = LinearSegmentedColormap.from_list(
        "tagesschau_basis", np.clip(rgb_fine / 255.0, 0, 1), N=512)
    return cmap, float(t_fine.min()), float(t_fine.max())


def observations_for(bulk: dict, iso: str, col: str):
    """Beobachtungsliste im Format von dwd.collect_observations()."""
    obs = []
    for stid, vals in bulk[col].items():
        if iso not in vals:
            continue
        m = bulk["stations"][stid]
        obs.append((dwd.Station(stid=stid, von=START, bis=END, hoehe=m["hoehe"],
                                lat=m["lat"], lon=m["lon"], name=m["name"]),
                    vals[iso]))
    return obs


def render_pairs(bulk: dict, pairs: list[dict]) -> None:
    cmap, t_min, t_max = base_cmap()
    print(f"[i] Basisskala deckt {t_min:.1f} bis {t_max:.1f} °C ab", file=sys.stderr)

    for k, p in enumerate(pairs, start=1):
        for col, param, label in (("TXK", "max", "Tageshöchstwerte"),):
            for iso, partner in ((p["tag_2025"], p["tag_2026"]),
                                 (p["tag_2026"], p["tag_2025"])):
                target = date.fromisoformat(iso)
                obs = observations_for(bulk, iso, col)
                out = MAP_DIR / f"paar{k:02d}_{param}_{iso}.png"
                title = (f"{label} (DWD) · {target.strftime('%d.%m.%Y')} · "
                         f"Zwillingstag von {date.fromisoformat(partner).strftime('%d.%m.%Y')}\n"
                         f"rekonstruierte Tagesschau-Basisskala")
                render(obs, target, cmap, t_min, t_max, out, title=title)


# ----------------------------------------------------------------------
# Optische Aehnlichkeit und kombinierte Paar-Bilder
# ----------------------------------------------------------------------

GRID_SHAPE = (280, 320)
LON_RANGE = (5.5, 15.5)
LAT_RANGE = (47.0, 55.5)


def compute_grid(bulk: dict, iso: str, col: str):
    """Interpoliertes Temperaturfeld eines Tages, ausserhalb Deutschlands NaN."""
    obs = observations_for(bulk, iso, col)
    lats = np.array([s.lat for s, _ in obs])
    lons = np.array([s.lon for s, _ in obs])
    vals = np.array([v for _, v in obs])

    glon, glat = np.meshgrid(np.linspace(*LON_RANGE, GRID_SHAPE[1]),
                             np.linspace(*LAT_RANGE, GRID_SHAPE[0]))
    grid = griddata((lons, lats), vals, (glon, glat), method="cubic")
    nearest = griddata((lons, lats), vals, (glon, glat), method="nearest")
    grid = np.where(np.isnan(grid), nearest, grid)
    grid = np.where(germany_mask(glon, glat), grid, np.nan)
    return glon, glat, grid


def visual_delta(grid_a: np.ndarray, grid_b: np.ndarray, cmap, norm) -> float:
    """Mittlerer Farbabstand ΔE00 der beiden gerenderten Felder.

    Beide Tage werden mit derselben fest verankerten Skala eingefaerbt;
    der pixelweise CIEDE2000-Abstand ueber der Landesflaeche misst damit,
    wie aehnlich die Karten fuer einen Betrachter tatsaechlich aussehen.
    """
    valid = ~np.isnan(grid_a) & ~np.isnan(grid_b)
    rgb_a = np.asarray(cmap(norm(grid_a[valid])))[:, :3]
    rgb_b = np.asarray(cmap(norm(grid_b[valid])))[:, :3]
    lab_a = colour.XYZ_to_Lab(colour.sRGB_to_XYZ(rgb_a))
    lab_b = colour.XYZ_to_Lab(colour.sRGB_to_XYZ(rgb_b))
    de = colour.delta_E(lab_a, lab_b, method="CIE 2000")
    return float(np.mean(de))


def select_pairs_visual(bulk: dict, metrics: dict[str, dict],
                        candidates: list[tuple[float, str, str]],
                        max_pairs: int) -> list[dict]:
    """Waehlt aus den Kandidaten die optisch aehnlichsten Paare aus.

    Fuer jeden in den Kandidaten vorkommenden Tag wird das Temperaturfeld
    einmal interpoliert, in der Basisskala eingefaerbt und nach CIELab
    konvertiert. Anschliessend wird fuer JEDES Kandidatenpaar das mittlere
    ΔE00 berechnet; die Auswahl erfolgt greedy nach aufsteigendem ΔE00
    (jeder Tag hoechstens einmal). Die Kennwert-Aehnlichkeit ist damit nur
    noch Vorbedingung, die optische Aehnlichkeit das Entscheidungskriterium.
    """
    cmap, t_min, t_max = base_cmap()
    norm = Normalize(vmin=t_min, vmax=t_max)

    days = sorted({d for _, a, b in candidates for d in (a, b)})
    print(f"[i] {len(candidates)} Kandidatenpaare, "
          f"interpoliere Felder für {len(days)} Tage …", file=sys.stderr)

    # Die Deutschland-Maske ist fuer alle Tage identisch (innerhalb der
    # Landesflaeche gibt es nach dem nearest-Fill keine Luecken) — die
    # Lab-Vektoren aller Tage sind daher pixelweise deckungsgleich.
    lab: dict[str, np.ndarray] = {}
    mask = None
    for i, iso in enumerate(days, start=1):
        _, _, grid = compute_grid(bulk, iso, "TXK")
        if mask is None:
            mask = ~np.isnan(grid)
        rgb = np.asarray(cmap(norm(grid[mask])))[:, :3]
        lab[iso] = colour.XYZ_to_Lab(colour.sRGB_to_XYZ(rgb)).astype(np.float32)
        if i % 25 == 0:
            print(f"[i] {i}/{len(days)} Felder berechnet …", file=sys.stderr)

    scored = []
    for i, (dist, a, b) in enumerate(candidates, start=1):
        de = float(np.mean(colour.delta_E(lab[a], lab[b], method="CIE 2000")))
        scored.append((de, dist, a, b))
        if i % 200 == 0:
            print(f"[i] {i}/{len(candidates)} Paare verglichen …", file=sys.stderr)
    scored.sort()

    used: set[str] = set()
    pairs = []
    for de, dist, a, b in scored:
        if a in used or b in used:
            continue
        used.update((a, b))
        pairs.append({"tag_2025": a, "tag_2026": b, "dist": dist,
                      "datumsabstand": doy_distance(a, b), "de00": de,
                      **{f"{k}_2025": metrics[a][k]
                         for k in ("tmin", "tmax", "spanne", "tmittel")},
                      **{f"{k}_2026": metrics[b][k]
                         for k in ("tmin", "tmax", "spanne", "tmittel")}})
        if len(pairs) >= max_pairs:
            break
    return pairs


def _draw_panel(ax, glon, glat, grid, cmap, norm, title: str) -> None:
    """Ein Kartenfeld als Subplot (wie dwd_tagesschau_vergleich.render)."""
    mesh = ax.pcolormesh(glon, glat, grid, cmap=cmap, norm=norm,
                         shading="auto", zorder=1)
    finite = grid[~np.isnan(grid)]
    levels = np.arange(np.floor(finite.min()), np.ceil(finite.max()) + 1.0, 1.0)
    cs = ax.contour(glon, glat, grid, levels=levels, colors="black",
                    linewidths=0.3, alpha=0.4, zorder=2)
    ax.clabel(cs, levels=levels[::2], inline=True, fontsize=5, fmt="%g°")
    dwd.draw_overlay(ax, with_states=False)
    ax.set_xlim(*LON_RANGE)
    ax.set_ylim(*LAT_RANGE)
    ax.set_aspect(1.0 / np.cos(np.deg2rad(sum(LAT_RANGE) / 2)))
    ax.set_xticks([])
    ax.set_yticks([])
    ax.set_title(title, fontsize=11)
    return mesh


def render_pair_figures(bulk: dict, pairs: list[dict]) -> list[dict]:
    """Je Paar ein Bild mit den beiden Tagestemperaturkarten und ΔE00.

    Returns:
        pairs, je Eintrag ergaenzt um de00 (mittlerer Farbabstand der
        beiden gerenderten Tagestemperaturkarten, klein = aehnlich).
    """
    cmap, t_min, t_max = base_cmap()
    norm = Normalize(vmin=t_min, vmax=t_max)
    print(f"[i] Basisskala deckt {t_min:.1f} bis {t_max:.1f} °C ab", file=sys.stderr)

    for k, p in enumerate(pairs, start=1):
        d25, d26 = p["tag_2025"], p["tag_2026"]
        grids = {iso: compute_grid(bulk, iso, "TXK") for iso in (d25, d26)}
        if "de00" not in p:
            p["de00"] = visual_delta(grids[d25][2], grids[d26][2], cmap, norm)

        fig, axes = plt.subplots(1, 2, figsize=(11, 7.5))
        mesh = None
        for ax, iso in zip(axes, (d25, d26)):
            glon, glat, grid = grids[iso]
            mesh = _draw_panel(
                ax, glon, glat, grid, cmap, norm,
                f"Tagestemperaturkarte · {date.fromisoformat(iso).strftime('%d.%m.%Y')}")

        fig.suptitle(
            f"Zwillingstage {date.fromisoformat(d25).strftime('%d.%m.%Y')} ↔ "
            f"{date.fromisoformat(d26).strftime('%d.%m.%Y')} "
            f"(DWD-Tageshöchstwerte)\n"
            f"Min {p['tmin_2025']:.1f} / {p['tmin_2026']:.1f} °C · "
            f"Max {p['tmax_2025']:.1f} / {p['tmax_2026']:.1f} °C · "
            f"Mittel {p['tmittel_2025']:.1f} / {p['tmittel_2026']:.1f} °C · "
            f"Spanne {p['spanne_2025']:.1f} / {p['spanne_2026']:.1f} K · "
            f"ΔE₀₀ = {p['de00']:.2f}",
            fontsize=13)
        cbar = fig.colorbar(mesh, ax=list(axes), orientation="vertical",
                            shrink=0.8, pad=0.02)
        cbar.set_label("Temperatur [°C] · rekonstruierte Tagesschau-Basisskala")

        out = MAP_DIR / f"paar{k:02d}_{d25}_{d26}.png"
        out.parent.mkdir(parents=True, exist_ok=True)
        plt.savefig(out, dpi=150, bbox_inches="tight")
        plt.close(fig)
        print(f"[i] Paar-Bild gespeichert: {out}", file=sys.stderr)
    return pairs


# ----------------------------------------------------------------------

def main() -> int:
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("--threshold", type=float, default=1.0,
                   help="max. Abweichung je Kenngroesse in °C (Default: 1.0)")
    p.add_argument("--max-pairs", type=int, default=12,
                   help="max. Anzahl Paare (Default: 12)")
    p.add_argument("--max-datumsabstand", type=int, default=30,
                   help="max. Datumsabstand der Paare im Jahreslauf in Tagen; "
                        "0 = keine Einschraenkung (Default: 30)")
    p.add_argument("--tmittel-min", type=float, default=None,
                   help="min. deutschlandweites TXK-Mittel beider Tage in °C")
    p.add_argument("--tmittel-max", type=float, default=None,
                   help="max. deutschlandweites TXK-Mittel beider Tage in °C")
    p.add_argument("--workers", type=int, default=16)
    p.add_argument("--no-render", action="store_true",
                   help="nur Metriken und Paarliste, keine Karten")
    p.add_argument("--einzelkarten", action="store_true",
                   help="zusaetzlich Einzelkarten je Tag und Parameter rendern")
    args = p.parse_args()

    bulk = fetch_bulk(workers=args.workers)
    metrics = daily_metrics(bulk)

    n25 = sum(1 for d in metrics if d.startswith("2025"))
    n26 = sum(1 for d in metrics if d.startswith("2026"))
    print(f"[i] Tagesmetriken: {n25} Tage 2025, {n26} Tage 2026", file=sys.stderr)

    METRICS_CSV.parent.mkdir(parents=True, exist_ok=True)
    with METRICS_CSV.open("w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["datum", "tmin", "tmax", "spanne", "tmittel", "n_txk"])
        for iso in sorted(metrics):
            m = metrics[iso]
            w.writerow([iso, m["tmin"], m["tmax"], round(m["spanne"], 1),
                        round(m["tmittel"], 1), m["n_txk"]])
    print(f"[i] Tagesmetriken: {METRICS_CSV}", file=sys.stderr)

    mean_range = None
    if args.tmittel_min is not None or args.tmittel_max is not None:
        mean_range = (args.tmittel_min if args.tmittel_min is not None else -99.0,
                      args.tmittel_max if args.tmittel_max is not None else 99.0)

    candidates = candidate_pairs(metrics, args.threshold,
                                 max_day_diff=args.max_datumsabstand,
                                 mean_range=mean_range)
    pairs = select_pairs_visual(bulk, metrics, candidates, args.max_pairs)

    print(f"\nZwillingstage 2025 ↔ 2026, ausgewählt nach optischer Ähnlichkeit "
          f"(Vorfilter: Kennwerte ≤ {args.threshold} °C, "
          f"Datumsabstand ≤ {args.max_datumsabstand} Tage):")
    for p_ in pairs:
        print(f"  {p_['tag_2025']}  ↔  {p_['tag_2026']}   "
              f"ΔE00 {p_['de00']:5.2f}   "
              f"Tmin {p_['tmin_2025']:5.1f}/{p_['tmin_2026']:5.1f}  "
              f"Tmax {p_['tmax_2025']:5.1f}/{p_['tmax_2026']:5.1f}  "
              f"Mittel {p_['tmittel_2025']:5.1f}/{p_['tmittel_2026']:5.1f}  "
              f"Spanne {p_['spanne_2025']:4.1f}/{p_['spanne_2026']:4.1f}  "
              f"({p_['datumsabstand']} Tage auseinander)")
    if not pairs:
        print("  keine Paare unterhalb des Schwellwerts gefunden")

    if pairs and not args.no_render:
        pairs = render_pair_figures(bulk, pairs)
        if args.einzelkarten:
            render_pairs(bulk, pairs)

    with PAIRS_CSV.open("w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["tag_2025", "tag_2026", "dist", "datumsabstand",
                    "tmin_2025", "tmax_2025", "spanne_2025", "tmittel_2025",
                    "tmin_2026", "tmax_2026", "spanne_2026", "tmittel_2026",
                    "de00"])
        for p_ in pairs:
            w.writerow([p_["tag_2025"], p_["tag_2026"], round(p_["dist"], 2),
                        p_["datumsabstand"],
                        p_["tmin_2025"], p_["tmax_2025"], round(p_["spanne_2025"], 1),
                        round(p_["tmittel_2025"], 1),
                        p_["tmin_2026"], p_["tmax_2026"], round(p_["spanne_2026"], 1),
                        round(p_["tmittel_2026"], 1),
                        round(p_.get("de00", float("nan")), 2)])
    print(f"[i] Paarliste: {PAIRS_CSV}", file=sys.stderr)
    return 0


if __name__ == "__main__":
    sys.exit(main())
