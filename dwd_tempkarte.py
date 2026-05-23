#!/usr/bin/env python3
"""Erzeugt eine Temperaturkarte für Deutschland aus DWD Open-Data Stationsdaten.

Datenquelle: DWD Climate Data Center (CDC), Tageswerte (KL) der Klimastationen
    https://opendata.dwd.de/climate_environment/CDC/observations_germany/climate/daily/kl/

Pro Station wird das ZIP heruntergeladen, die Tageszeile extrahiert und der
gewünschte Parameter (TMK/TXK/TNK) auf ein reguläres Gitter interpoliert.
Heruntergeladene Beobachtungen werden in cache/ als JSON zwischengespeichert,
sodass weitere Karten mit anderer Farbskala ohne erneuten Download erzeugt werden.

Beispiele:
    python dwd_tempkarte.py 2024-05-23
    python dwd_tempkarte.py 2024-05-23 --param max --output output/tmax_2024-05-23.png
    python dwd_tempkarte.py 2024-05-23 --param max --cmap viridis
    python dwd_tempkarte.py 2024-05-23 --param max --cmap turbo --step 1
"""

from __future__ import annotations

import argparse
import io
import json
import sys
import zipfile
from concurrent.futures import ThreadPoolExecutor, as_completed
from dataclasses import asdict, dataclass
from datetime import date, datetime, timedelta
from pathlib import Path
from typing import Optional
from urllib.error import URLError, HTTPError
from urllib.request import Request, urlopen

import matplotlib.pyplot as plt
import numpy as np
from matplotlib.colors import Normalize
from scipy.interpolate import griddata


CACHE_DIR = Path("cache")

# Deutschland-Polygon (MIT) – isellsoap/deutschlandGeoJSON
GERMANY_OUTLINE_URL = (
    "https://raw.githubusercontent.com/isellsoap/deutschlandGeoJSON/"
    "main/1_deutschland/2_hoch.geo.json"
)
STATES_OUTLINE_URL = (
    "https://raw.githubusercontent.com/isellsoap/deutschlandGeoJSON/"
    "main/2_bundeslaender/2_hoch.geo.json"
)


CDC_BASE = "https://opendata.dwd.de/climate_environment/CDC/observations_germany/climate/daily/kl"
USER_AGENT = "tagesschau-wetterkarte/dwd_tempkarte (https://beltoforion.de)"
RECENT_WINDOW_DAYS = 500  # 'recent' deckt grob die letzten ~1.5 Jahre ab

# DWD-Missing-Value Marker
MISSING = -999

# Parameter -> DWD-Spaltenname und Klartextbeschreibung
PARAM_COLUMNS = {
    "mean": ("TMK", "Tagesmittel der Lufttemperatur (2 m)"),
    "max":  ("TXK", "Tagesmaximum der Lufttemperatur (2 m)"),
    "min":  ("TNK", "Tagesminimum der Lufttemperatur (2 m)"),
}


@dataclass
class Station:
    stid: str       # 5-stellige Stations-ID
    von: date
    bis: date
    hoehe: float
    lat: float
    lon: float
    name: str


def http_get(url: str, timeout: int = 30) -> bytes:
    req = Request(url, headers={"User-Agent": USER_AGENT})
    with urlopen(req, timeout=timeout) as resp:
        return resp.read()


def parse_station_list(text: str) -> list[Station]:
    """Parst die fixed-width Datei KL_Tageswerte_Beschreibung_Stationen.txt.

    Format (Spalten):
        Stations_id von_datum bis_datum Stationshoehe geoBreite geoLaenge Stationsname Bundesland Abgabe
    Trenner sind variable Whitespaces; der Stationsname kann mehrere Wörter enthalten,
    deshalb wird hier maxsplit verwendet und das Bundesland/Abgabe-Suffix abgeschnitten.
    """
    stations: list[Station] = []
    lines = text.splitlines()
    # Kopfzeilen (Header + Trennstrich) überspringen
    for line in lines[2:]:
        if not line.strip():
            continue
        parts = line.split(None, 6)
        if len(parts) < 7:
            continue
        stid, von_s, bis_s, hoehe_s, lat_s, lon_s, rest = parts
        # rest = "<Name ...> <Bundesland> <Abgabe>"
        # Bundesland kann Leerzeichen enthalten ("Nordrhein-Westfalen" nicht, "Schleswig-Holstein" nicht;
        # aber "Mecklenburg-Vorpommern" auch nicht). Wir splitten von rechts: Abgabe + Bundesland.
        rest_tokens = rest.rsplit(None, 2)
        if len(rest_tokens) < 3:
            continue
        name = rest_tokens[0].strip()
        try:
            stations.append(Station(
                stid=stid.zfill(5),
                von=datetime.strptime(von_s, "%Y%m%d").date(),
                bis=datetime.strptime(bis_s, "%Y%m%d").date(),
                hoehe=float(hoehe_s),
                lat=float(lat_s),
                lon=float(lon_s),
                name=name,
            ))
        except ValueError:
            continue
    return stations


def list_dir(url: str) -> list[str]:
    """Sehr einfache HTML-Verzeichnislisten-Auswertung des Apache-Index."""
    html = http_get(url).decode("utf-8", errors="replace")
    names: list[str] = []
    for token in html.split('href="'):
        end = token.find('"')
        if end <= 0:
            continue
        name = token[:end]
        if name.startswith("?") or name.startswith("/"):
            continue
        names.append(name)
    return names


def find_station_zip(folder_url: str, stid: str, zip_cache: dict[str, list[str]]) -> Optional[str]:
    """Findet den ZIP-Dateinamen für eine Station in dem Verzeichnis (recent oder historical)."""
    if folder_url not in zip_cache:
        zip_cache[folder_url] = [n for n in list_dir(folder_url) if n.endswith(".zip")]
    needle = f"_{stid}_"
    for name in zip_cache[folder_url]:
        if needle in name:
            return name
    return None


def fetch_station_value(folder_url: str, zip_name: str, target: date, col: str) -> Optional[float]:
    """Lädt das Stations-ZIP und liest den Tageswert für `target` aus produkt_klima_tag_*.txt."""
    try:
        data = http_get(folder_url + zip_name, timeout=60)
    except (URLError, HTTPError, TimeoutError):
        return None

    target_key = target.strftime("%Y%m%d")
    try:
        with zipfile.ZipFile(io.BytesIO(data)) as zf:
            prod_name = next((n for n in zf.namelist() if n.startswith("produkt_klima_tag")), None)
            if not prod_name:
                return None
            with zf.open(prod_name) as f:
                raw = f.read().decode("latin-1")
    except (zipfile.BadZipFile, KeyError):
        return None

    lines = raw.splitlines()
    if not lines:
        return None
    header = [h.strip() for h in lines[0].split(";")]
    try:
        col_idx = header.index(col)
        date_idx = header.index("MESS_DATUM")
    except ValueError:
        return None

    for line in lines[1:]:
        fields = [f.strip() for f in line.split(";")]
        if len(fields) <= max(col_idx, date_idx):
            continue
        if fields[date_idx] == target_key:
            try:
                val = float(fields[col_idx])
            except ValueError:
                return None
            if val == MISSING:
                return None
            return val
    return None


def cache_path(target: date, param: str) -> Path:
    return CACHE_DIR / f"obs_{param}_{target.isoformat()}.json"


def load_cached(target: date, param: str) -> Optional[list[tuple[Station, float]]]:
    p = cache_path(target, param)
    if not p.exists():
        return None
    try:
        data = json.loads(p.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return None
    out: list[tuple[Station, float]] = []
    for row in data:
        s = row["station"]
        out.append((Station(
            stid=s["stid"],
            von=datetime.strptime(s["von"], "%Y-%m-%d").date(),
            bis=datetime.strptime(s["bis"], "%Y-%m-%d").date(),
            hoehe=s["hoehe"], lat=s["lat"], lon=s["lon"], name=s["name"],
        ), row["value"]))
    return out


def save_cache(target: date, param: str, observations: list[tuple[Station, float]]) -> None:
    CACHE_DIR.mkdir(parents=True, exist_ok=True)
    serialized = []
    for s, v in observations:
        d = asdict(s)
        d["von"] = s.von.isoformat()
        d["bis"] = s.bis.isoformat()
        serialized.append({"station": d, "value": v})
    cache_path(target, param).write_text(
        json.dumps(serialized, ensure_ascii=False, indent=1), encoding="utf-8"
    )


def collect_observations(target: date, param: str, workers: int = 16,
                         use_cache: bool = True) -> list[tuple[Station, float]]:
    if use_cache:
        cached = load_cached(target, param)
        if cached is not None:
            print(f"[i] {len(cached)} Stationen aus Cache geladen "
                  f"({cache_path(target, param)})", file=sys.stderr)
            return cached

    col, _ = PARAM_COLUMNS[param]
    today = date.today()
    use_recent = (today - target).days <= RECENT_WINDOW_DAYS

    folder = "recent" if use_recent else "historical"
    folder_url = f"{CDC_BASE}/{folder}/"
    stations_url = folder_url + "KL_Tageswerte_Beschreibung_Stationen.txt"

    print(f"[i] Lade Stationsliste ({folder}) …", file=sys.stderr)
    stations_text = http_get(stations_url).decode("latin-1")
    stations = parse_station_list(stations_text)
    stations = [s for s in stations if s.von <= target <= s.bis]
    print(f"[i] {len(stations)} Stationen mit Messzeitraum am {target.isoformat()}", file=sys.stderr)

    zip_cache: dict[str, list[str]] = {}
    # In 'historical' liegen alle ZIPs in einem Verzeichnis; in 'recent' ebenso.
    list_dir(folder_url)  # Cache befüllen (über Seiteneffekt im find_station_zip)

    def task(s: Station) -> Optional[tuple[Station, float]]:
        zip_name = find_station_zip(folder_url, s.stid, zip_cache)
        if not zip_name:
            return None
        val = fetch_station_value(folder_url, zip_name, target, col)
        if val is None:
            return None
        return (s, val)

    results: list[tuple[Station, float]] = []
    with ThreadPoolExecutor(max_workers=workers) as ex:
        futures = [ex.submit(task, s) for s in stations]
        done = 0
        for fut in as_completed(futures):
            done += 1
            if done % 25 == 0:
                print(f"[i] {done}/{len(futures)} Stationen abgefragt …", file=sys.stderr)
            r = fut.result()
            if r is not None:
                results.append(r)

    print(f"[i] {len(results)} Stationen mit gültigem {col}-Wert", file=sys.stderr)
    if use_cache and results:
        save_cache(target, param, results)
    return results


def _load_geojson(url: str, cache_name: str) -> Optional[dict]:
    CACHE_DIR.mkdir(parents=True, exist_ok=True)
    cache_file = CACHE_DIR / cache_name
    if cache_file.exists():
        try:
            return json.loads(cache_file.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError):
            pass
    try:
        data = http_get(url, timeout=60)
    except (URLError, HTTPError, TimeoutError) as e:
        print(f"[!] Konnte {url} nicht laden: {e}", file=sys.stderr)
        return None
    cache_file.write_bytes(data)
    return json.loads(data.decode("utf-8"))


def _iter_rings(geom: dict):
    """Liefert (lon[], lat[]) für jeden äußeren/inneren Ring von Polygon/MultiPolygon."""
    if geom["type"] == "Polygon":
        polys = [geom["coordinates"]]
    elif geom["type"] == "MultiPolygon":
        polys = geom["coordinates"]
    else:
        return
    for poly in polys:
        for ring in poly:
            arr = np.asarray(ring)
            yield arr[:, 0], arr[:, 1]


def draw_overlay(ax, with_states: bool) -> None:
    germany = _load_geojson(GERMANY_OUTLINE_URL, "germany_outline.geojson")
    if germany:
        for feat in germany.get("features", [germany]):
            geom = feat.get("geometry", feat)
            for lon, lat in _iter_rings(geom):
                ax.plot(lon, lat, color="black", linewidth=1.4, zorder=4)

    if with_states:
        states = _load_geojson(STATES_OUTLINE_URL, "states_outline.geojson")
        if states:
            for feat in states.get("features", []):
                geom = feat.get("geometry", {})
                for lon, lat in _iter_rings(geom):
                    ax.plot(lon, lat, color="black", linewidth=0.5, alpha=0.6, zorder=3)


def render_map(observations: list[tuple[Station, float]], target: date, param: str,
               out_path: Path, cmap_name: str = "RdYlBu_r", step: float = 1.0,
               show_states: bool = False, show_stations: bool = True) -> None:
    if len(observations) < 5:
        raise RuntimeError(f"Zu wenige Datenpunkte ({len(observations)}) für eine sinnvolle Karte.")

    lats = np.array([s.lat for s, _ in observations])
    lons = np.array([s.lon for s, _ in observations])
    vals = np.array([v for _, v in observations])

    # Gitter über Deutschland
    lon_min, lon_max = 5.5, 15.5
    lat_min, lat_max = 47.0, 55.5
    grid_lon = np.linspace(lon_min, lon_max, 320)
    grid_lat = np.linspace(lat_min, lat_max, 280)
    glon, glat = np.meshgrid(grid_lon, grid_lat)

    grid = griddata((lons, lats), vals, (glon, glat), method="cubic")
    # Lücken am Rand mit nearest auffüllen, damit das Bild flächendeckend ist
    nearest = griddata((lons, lats), vals, (glon, glat), method="nearest")
    grid = np.where(np.isnan(grid), nearest, grid)

    # Farbskala: kontinuierlich (glatte Übergänge), Konturlinien auf `step`-Raster
    vmin = float(np.floor(vals.min() / step) * step)
    vmax = float(np.ceil(vals.max() / step) * step)
    if vmax - vmin < 2 * step:
        vmax = vmin + 2 * step
    cmap = plt.get_cmap(cmap_name)
    norm = Normalize(vmin=vmin, vmax=vmax)

    fig, ax = plt.subplots(figsize=(9, 10))
    mesh = ax.pcolormesh(glon, glat, grid, cmap=cmap, norm=norm, shading="auto", zorder=1)

    # Konturlinien (feine Stufen)
    levels = np.arange(vmin, vmax + step, step)
    cs = ax.contour(glon, glat, grid, levels=levels, colors="black",
                    linewidths=0.4, alpha=0.5, zorder=2)
    # Beschriftung nur auf jeder n-ten Linie, damit es nicht überladen wirkt
    label_stride = max(1, int(round(2.0 / step)))
    ax.clabel(cs, levels=levels[::label_stride], inline=True, fontsize=6, fmt="%g°")

    # Deutschland-Overlay
    draw_overlay(ax, with_states=show_states)

    # Stationen
    if show_stations:
        ax.scatter(lons, lats, s=8, c="black", marker="o", zorder=5, linewidths=0)
        for lon, lat, val in zip(lons, lats, vals):
            ax.text(lon, lat, f"{val:.0f}", fontsize=5, ha="center", va="bottom",
                    zorder=6, color="black")

    ax.set_xlim(lon_min, lon_max)
    ax.set_ylim(lat_min, lat_max)
    ax.set_aspect(1.0 / np.cos(np.deg2rad((lat_min + lat_max) / 2)))
    ax.set_xlabel("Längengrad [°O]")
    ax.set_ylabel("Breitengrad [°N]")

    _, label = PARAM_COLUMNS[param]
    ax.set_title(f"{label}\nDeutschland · {target.strftime('%d.%m.%Y')}\nDatenquelle: DWD CDC", fontsize=12)

    # Colorbar-Ticks auf ein lesbares Raster (mindestens 1 °C, jeder n-te level)
    tick_stride = max(1, int(round(max(1.0, step) / step)))
    cbar = fig.colorbar(mesh, ax=ax, orientation="vertical", shrink=0.85, pad=0.02,
                        ticks=levels[::tick_stride])
    cbar.set_label("Temperatur [°C]")

    out_path.parent.mkdir(parents=True, exist_ok=True)
    plt.tight_layout()
    plt.savefig(out_path, dpi=200)
    plt.close(fig)
    print(f"[i] Karte gespeichert: {out_path}", file=sys.stderr)


def parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser(description="DWD Temperaturkarte für Deutschland (Tageswert).")
    p.add_argument("datum", help="Datum im Format YYYY-MM-DD")
    p.add_argument("--param", choices=list(PARAM_COLUMNS), default="mean",
                   help="Welcher Tageswert: mean=TMK, max=TXK, min=TNK (Default: mean)")
    p.add_argument("--output", "-o", type=Path, default=None,
                   help="Pfad der Ausgabedatei (PNG). Default: output/dwd_<param>_<datum>.png")
    p.add_argument("--workers", type=int, default=16, help="Parallele Downloads (Default: 16)")
    p.add_argument("--cmap", default="RdYlBu_r",
                   help="Matplotlib-Colormap (z.B. RdYlBu_r, viridis, turbo, coolwarm, plasma, "
                        "inferno, Spectral_r). Default: RdYlBu_r")
    p.add_argument("--step", type=float, default=1.0,
                   help="Stufenweite der Konturlinien/Colorbar in °C (Default: 1.0). "
                        "Die Farbfläche selbst ist immer kontinuierlich.")
    p.add_argument("--states", action="store_true",
                   help="Bundesländer-Grenzen mit anzeigen")
    p.add_argument("--no-stations", action="store_true",
                   help="Stationspunkte und -beschriftungen ausblenden")
    p.add_argument("--no-cache", action="store_true",
                   help="Cache ignorieren und Daten neu vom DWD laden")
    return p.parse_args()


def main() -> int:
    args = parse_args()
    try:
        target = datetime.strptime(args.datum, "%Y-%m-%d").date()
    except ValueError:
        print(f"Ungültiges Datum: {args.datum!r}. Erwartet YYYY-MM-DD.", file=sys.stderr)
        return 2

    if target >= date.today():
        print("Hinweis: Tageswerte aus CDC sind für heute/Zukunft noch nicht verfügbar.", file=sys.stderr)
        return 2

    out_path = args.output or (
        Path("output") / f"dwd_{args.param}_{target.isoformat()}_{args.cmap}.png"
    )

    observations = collect_observations(
        target, args.param, workers=args.workers, use_cache=not args.no_cache
    )
    render_map(observations, target, args.param, out_path,
               cmap_name=args.cmap, step=args.step,
               show_states=args.states, show_stations=not args.no_stations)
    return 0


if __name__ == "__main__":
    sys.exit(main())
