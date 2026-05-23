#!/usr/bin/env python3
"""Erzeugt eine Temperaturkarte für Deutschland aus DWD Open-Data Stationsdaten.

Datenquelle: DWD Climate Data Center (CDC), Tageswerte (KL) der Klimastationen
    https://opendata.dwd.de/climate_environment/CDC/observations_germany/climate/daily/kl/

Pro Station wird das ZIP heruntergeladen, die Tageszeile extrahiert und der
gewünschte Parameter (TMK/TXK/TNK) auf ein reguläres Gitter interpoliert.

Beispiele:
    python dwd_tempkarte.py 2024-05-23
    python dwd_tempkarte.py 2024-05-23 --param max --output output/tmax_2024-05-23.png
"""

from __future__ import annotations

import argparse
import io
import sys
import zipfile
from concurrent.futures import ThreadPoolExecutor, as_completed
from dataclasses import dataclass
from datetime import date, datetime, timedelta
from pathlib import Path
from typing import Optional
from urllib.error import URLError, HTTPError
from urllib.request import Request, urlopen

import matplotlib.pyplot as plt
import numpy as np
from matplotlib.colors import BoundaryNorm
from scipy.interpolate import griddata


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


def collect_observations(target: date, param: str, workers: int = 16) -> list[tuple[Station, float]]:
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
    return results


def render_map(observations: list[tuple[Station, float]], target: date, param: str, out_path: Path) -> None:
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
    # Lücken am Rand mit nearest auffüllen, damit Contourf sauber arbeitet
    nearest = griddata((lons, lats), vals, (glon, glat), method="nearest")
    grid = np.where(np.isnan(grid), nearest, grid)

    # Farbskala an die tatsächliche Datenbreite anpassen, aber auf 2°-Schritte gerastert
    vmin = np.floor(vals.min() / 2) * 2
    vmax = np.ceil(vals.max() / 2) * 2
    if vmax - vmin < 4:
        vmax = vmin + 4
    levels = np.arange(vmin, vmax + 2, 2)
    cmap = plt.get_cmap("RdYlBu_r")
    norm = BoundaryNorm(levels, ncolors=cmap.N, clip=True)

    fig, ax = plt.subplots(figsize=(9, 10))
    cf = ax.contourf(glon, glat, grid, levels=levels, cmap=cmap, norm=norm, extend="both")
    ax.contour(glon, glat, grid, levels=levels, colors="black", linewidths=0.3, alpha=0.5)

    # Stationen
    ax.scatter(lons, lats, s=10, c="black", marker="o", zorder=5, linewidths=0)
    for lon, lat, val in zip(lons, lats, vals):
        ax.text(lon, lat, f"{val:.0f}", fontsize=5, ha="center", va="bottom", zorder=6, color="black")

    ax.set_xlim(lon_min, lon_max)
    ax.set_ylim(lat_min, lat_max)
    ax.set_aspect(1.0 / np.cos(np.deg2rad((lat_min + lat_max) / 2)))
    ax.set_xlabel("Längengrad [°O]")
    ax.set_ylabel("Breitengrad [°N]")

    _, label = PARAM_COLUMNS[param]
    ax.set_title(f"{label}\nDeutschland · {target.strftime('%d.%m.%Y')}\nDatenquelle: DWD CDC", fontsize=12)

    cbar = fig.colorbar(cf, ax=ax, orientation="vertical", shrink=0.85, pad=0.02, ticks=levels)
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

    out_path = args.output or Path("output") / f"dwd_{args.param}_{target.isoformat()}.png"

    observations = collect_observations(target, args.param, workers=args.workers)
    render_map(observations, target, args.param, out_path)
    return 0


if __name__ == "__main__":
    sys.exit(main())
