"""Zeitliche Entwicklung von Farbton und Saettigung der Jahres-Temperaturkarten.

Eingabe: means_hsv.csv (Mittelwerte von H, S, V je Jahreskarte, aus hsv.py)
sowie maximaltemperaturen.txt (Hoechsttemperatur des jeweiligen Jahres).
Ohne die Temperaturangaben waeren Farbton- und Saettigungstrends nicht
interpretierbar — eine roetere Karte kann schlicht einen heisseren Tag
bedeuten. Das oberste Panel zeigt daher die gemessene Hoechsttemperatur
des Jahres, darunter folgen Farbton und Saettigung der zugehoerigen Karte.

Der Farbton wird von [0..1] in Winkelgrade umgerechnet und um den Rot-Wrap
(0°/360°) herum aufgefaltet, so dass Werte knapp unter 360° als negative
Winkel erscheinen — sonst zerreisst der Sprung von 0.99 auf 0.01 die
Zeitreihe optisch.

Aufruf:
    python hsv_trend.py means_hsv.csv maximaltemperaturen.txt out.png
"""

import csv
import re
import colorsys

import matplotlib.pyplot as plt
import matplotlib.ticker as tck


def load_hsv(path: str):
    rows = []
    with open(path, newline="", encoding="utf-8") as f:
        for row in csv.DictReader(f, delimiter=";"):
            year = int(row["filename"][:4])
            h = float(row["H_mean_0to1"])
            s = float(row["S_mean_0to1"])
            v = float(row["V_mean_0to1"])
            rows.append((year, h, s, v))
    rows.sort()
    return rows


def load_tmax(path: str):
    tmax = {}
    pat = re.compile(r"^(\d{4}):\s+\S+\s+([\d,]+)")
    with open(path, encoding="utf-8") as f:
        for line in f:
            m = pat.match(line.strip())
            if m:
                tmax[int(m.group(1))] = float(m.group(2).replace(",", "."))
    return tmax


def main(csv_path: str, tmax_path: str, out_path: str) -> None:
    rows = load_hsv(csv_path)
    tmax = load_tmax(tmax_path)

    years = [r[0] for r in rows]
    hue_deg = [((r[1] * 360.0 + 180.0) % 360.0) - 180.0 for r in rows]
    sat = [r[2] for r in rows]
    temps = [tmax.get(r[0]) for r in rows]
    colors = [colorsys.hsv_to_rgb(r[1], r[2], r[3]) for r in rows]

    fig, (ax_t, ax_h, ax_s) = plt.subplots(
        3, 1, figsize=(10, 10), sharex=True, gridspec_kw={"hspace": 0.15}
    )

    for ax, vals, ylabel in ((ax_t, temps, "Höchsttemperatur [°C]"),
                             (ax_h, hue_deg, "Farbton [°]"),
                             (ax_s, sat, "Sättigung")):
        ax.plot(years, vals, "-", color="0.55", linewidth=1.2, zorder=2)
        ax.scatter(years, vals, c=colors, s=110, edgecolors="black",
                   linewidths=0.8, zorder=3)
        ax.set_ylabel(ylabel, fontsize=12)
        ax.grid(True, linestyle=":", alpha=0.6)

    ax_t.set_title("Gemessene Höchsttemperatur des Jahres (Marker in der mittleren "
                   "Kartenfarbe)", fontsize=11, loc="left")
    ax_t.set_ylim(33, 43)

    ax_h.axhline(0.0, color="firebrick", linestyle="--", linewidth=1.0, zorder=1)
    ax_h.text(years[0] + 1.2, 0.0, "Rot (0°)", va="bottom", ha="left",
              fontsize=9, color="firebrick")
    ax_h.set_title("Mittlerer Farbton der Jahreskarte (positiv: Richtung Orange/Gelb)",
                   fontsize=11, loc="left")
    ax_s.set_title("Mittlere Sättigung der Jahreskarte", fontsize=11, loc="left")

    ax_s.set_xlabel("Jahr", fontsize=12)
    ax_s.xaxis.set_major_locator(tck.MultipleLocator(2))
    ax_s.xaxis.set_minor_locator(tck.MultipleLocator(1))
    ax_s.set_ylim(0.6, 0.95)

    fig.suptitle("Tagesschau-Temperaturkarten am jeweils heißesten Tag des Jahres:\n"
                 "Höchsttemperatur, mittlerer Farbton und Sättigung", fontsize=13)
    fig.align_ylabels()

    plt.savefig(out_path, dpi=300, bbox_inches="tight")
    plt.close(fig)
    print(f"gespeichert: {out_path}")


if __name__ == "__main__":
    import sys
    main(sys.argv[1], sys.argv[2], sys.argv[3])
