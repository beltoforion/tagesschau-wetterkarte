# rgb_polyfit_pipeline.py
# Lade Punktwolke aus /mnt/data/aggregated_rgb_map.json
# Fit: parametrisches 3D Polynom RGB(t) über Temperatur t
# Outputs: 3D Plot, Koeffizienten, dichte Kurve, 500er Farbskala, CIE1931 xy Pfad

import json, csv, os
import numpy as np
import matplotlib.pyplot as plt

# ---------------- Config ----------------
DATA_PATH = "./output/aggregated_rgb_map.json"
OUT_DIR = "./output"
DEGREE = 7
USE_MEDIAN = False
RIDGE_LAMBDA = 0.0  # >0 für zartere Kurven

# ---------------- Utils ----------------
def ensure_dir(p):
    os.makedirs(p, exist_ok=True)

def poly_fit_ls(t, y, deg, ridge=0.0):
    X = np.vander(t, N=deg+1, increasing=True)
    if ridge > 0:
        XtX = X.T @ X + ridge*np.eye(deg+1)
        Xty = X.T @ y
        c = np.linalg.solve(XtX, Xty)
    else:
        c, *_ = np.linalg.lstsq(X, y, rcond=None)
    return c

def poly_eval(c, t):
    T = np.vander(t, N=len(c), increasing=True)
    return T @ c

def set_axes_equal_3d(ax):
    x_limits = ax.get_xlim3d(); y_limits = ax.get_ylim3d(); z_limits = ax.get_zlim3d()
    x_range = abs(x_limits[1] - x_limits[0]); x_mid = np.mean(x_limits)
    y_range = abs(y_limits[1] - y_limits[0]); y_mid = np.mean(y_limits)
    z_range = abs(z_limits[1] - z_limits[0]); z_mid = np.mean(z_limits)
    r = 0.5 * max([x_range, y_range, z_range])
    ax.set_xlim3d([x_mid - r, x_mid + r])
    ax.set_ylim3d([y_mid - r, y_mid + r])
    ax.set_zlim3d([z_mid - r, z_mid + r])

def srgb_to_linear(c):
    c = c / 255.0
    a = 0.055
    return np.where(c <= 0.04045, c / 12.92, ((c + a) / (1 + a)) ** 2.4)

# sRGB D65 to XYZ
M_SRGB_TO_XYZ = np.array([
    [0.4124564, 0.3575761, 0.1804375],
    [0.2126729, 0.7151522, 0.0721750],
    [0.0193339, 0.1191920, 0.9503041],
], dtype=float)

# ---------------- Load data ----------------
ensure_dir(OUT_DIR)
with open(DATA_PATH, "r", encoding="utf-8") as f:
    data = json.load(f)

temps, ctrl, all_pts = [], [], []
for t_str, rgbs in data.items():
    arr = np.array(rgbs, dtype=float)
    if arr.ndim == 2 and arr.shape[1] >= 3 and len(arr) > 0:
        val = np.median(arr[:, :3], axis=0) if USE_MEDIAN else np.mean(arr[:, :3], axis=0)
        temps.append(float(t_str))
        ctrl.append(val)
        all_pts.append(arr[:, :3])

temps = np.array(temps, dtype=float)
order = np.argsort(temps)
t_ctrl = temps[order]
RGB_ctrl = np.array(ctrl, dtype=float)[order]
all_pts = np.vstack(all_pts)

t_min, t_max = float(t_ctrl.min()), float(t_ctrl.max())

# ---------------- Fit per channel ----------------
cR = poly_fit_ls(t_ctrl, RGB_ctrl[:,0], DEGREE, ridge=RIDGE_LAMBDA)
cG = poly_fit_ls(t_ctrl, RGB_ctrl[:,1], DEGREE, ridge=RIDGE_LAMBDA)
cB = poly_fit_ls(t_ctrl, RGB_ctrl[:,2], DEGREE, ridge=RIDGE_LAMBDA)

# Dense sampling
t_s = np.linspace(t_min, t_max, 1200)
R_s = poly_eval(cR, t_s); G_s = poly_eval(cG, t_s); B_s = poly_eval(cB, t_s)
curve = np.stack([R_s, G_s, B_s], axis=1)

# ---------------- 3D plot ----------------
fig = plt.figure()
ax = fig.add_subplot(111, projection="3d")
ax.scatter(all_pts[:,0], all_pts[:,1], all_pts[:,2], s=6, alpha=0.25)
ax.plot(RGB_ctrl[:,0], RGB_ctrl[:,1], RGB_ctrl[:,2], linewidth=1)
ax.plot(curve[:,0], curve[:,1], curve[:,2], linewidth=2)
ax.set_xlabel("R"); ax.set_ylabel("G"); ax.set_zlabel("B")
ax.set_title(f"3D RGB-Punktwolke + Parametrischer Polynomfit (Grad {DEGREE})  |  t∈[{t_min:.1f},{t_max:.1f}]")
set_axes_equal_3d(ax)
plt.tight_layout()
plot3d_path = os.path.join(OUT_DIR, f"rgb_3d_points_polyfit_deg{DEGREE}.png")
fig.savefig(plot3d_path, dpi=150)
plt.close(fig)

# ---------------- Export coefficients and curve ----------------
coeffs_json = {
    "degree": DEGREE,
    "t_min": t_min,
    "t_max": t_max,
    "coefficients": {"R": cR.tolist(), "G": cG.tolist(), "B": cB.tolist()},
    "ridge_lambda": RIDGE_LAMBDA,
    "aggregation": "median" if USE_MEDIAN else "mean",
    "t_variable": "temperature"
}
coeffs_path = os.path.join(OUT_DIR, f"rgb_polyfit_deg{DEGREE}_coeffs.json")
with open(coeffs_path, "w", encoding="utf-8") as f:
    json.dump(coeffs_json, f, indent=2)

curve_path = os.path.join(OUT_DIR, f"rgb_polyfit_deg{DEGREE}_curve.csv")
with open(curve_path, "w", newline="") as f:
    w = csv.writer(f)
    w.writerow(["t","R","G","B"])
    for ti,(r,g,b) in zip(t_s, curve):
        w.writerow([float(ti), float(r), float(g), float(b)])

# ---------------- 500 step color scale from polynomial ----------------
n = 500
t_vals = np.linspace(t_min, t_max, n)
R = poly_eval(cR, t_vals)
G = poly_eval(cG, t_vals)
B = poly_eval(cB, t_vals)
rgb = np.clip(np.stack([R, G, B], axis=1), 0, 255).astype(np.uint8)

H = 60
scale = np.zeros((H, n, 3), dtype=np.uint8)
for i in range(n):
    scale[:, i, :] = rgb[i]

fig = plt.figure(figsize=(10, 1.4), dpi=150)
ax = fig.add_subplot(111)
ax.imshow(scale)
ax.set_axis_off()
fig.subplots_adjust(left=0, right=1, top=1, bottom=0)
scale_png = os.path.join(OUT_DIR, "rgb_scale_500.png")
fig.savefig(scale_png, dpi=150)
plt.close(fig)

scale_csv = os.path.join(OUT_DIR, "rgb_scale_500.csv")
with open(scale_csv, "w", newline="") as f:
    w = csv.writer(f)
    w.writerow(["t", "R", "G", "B"])
    for t, (r,g,b) in zip(t_vals, rgb):
        w.writerow([float(t), int(r), int(g), int(b)])

# ---------------- CIE 1931 xy path of the 500-step scale ----------------
rgb_lin = srgb_to_linear(rgb.astype(float))
XYZ = rgb_lin @ M_SRGB_TO_XYZ.T
sumXYZ = XYZ.sum(axis=1, keepdims=True)
sumXYZ[sumXYZ == 0] = np.nan
xy = XYZ[:, :2] / sumXYZ

fig = plt.figure(figsize=(8, 5), dpi=150)
ax = fig.add_subplot(111)
ax.set_xlim(0.0, 0.8); ax.set_ylim(0.0, 0.9)
ax.grid(True, which="both", linewidth=0.5, alpha=0.5)
ax.set_xlabel("x"); ax.set_ylabel("y")
ax.set_title("CIE 1931 xy Pfad der 500er Farbskala")
ax.plot(xy[:,0], xy[:,1], linewidth=2)
ax.plot(xy[::25,0], xy[::25,1], marker="o", linestyle="None", markersize=3)
ax.annotate(f"t={t_vals[0]:.1f}", xy=(xy[0,0], xy[0,1]), xytext=(5,5), textcoords="offset points", fontsize=8)
ax.annotate(f"t={t_vals[-1]:.1f}", xy=(xy[-1,0], xy[-1,1]), xytext=(5,5), textcoords="offset points", fontsize=8)
plt.tight_layout()
cie_png = os.path.join(OUT_DIR, "cie1931_xy_path_from_poly_scale.png")
fig.savefig(cie_png, dpi=150)
plt.close(fig)

cie_csv = os.path.join(OUT_DIR, "cie1931_xy_path_from_poly_scale.csv")
with open(cie_csv, "w", newline="") as f:
    w = csv.writer(f)
    w.writerow(["t","x","y"])
    for t,(xv,yv) in zip(t_vals, xy):
        w.writerow([float(t), float(xv), float(yv)])

print("Done")
print("3D plot:", plot3d_path)
print("Coeffs:", coeffs_path)
print("Curve:", curve_path)
print("Scale PNG:", scale_png)
print("Scale CSV:", scale_csv)
print("CIE xy PNG:", cie_png)
print("CIE xy CSV:", cie_csv)