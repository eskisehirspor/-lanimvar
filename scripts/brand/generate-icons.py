"""Generate PROVISIONAL app icon + splash: the İ-mark in white on ink.

Brand colour is deliberately not applied until the palette is chosen in the
Design Lab.   pip install pillow && python3 scripts/brand/generate-icons.py
"""
import pathlib

from PIL import Image, ImageDraw

ROOT = pathlib.Path(__file__).resolve().parents[2]
OUT = ROOT / "assets" / "brand"
OUT.mkdir(parents=True, exist_ok=True)
INK = (10, 17, 36, 255)
WHITE = (255, 255, 255, 255)
SS = 4


def mark(size, bg, scale):
    S = size * SS
    img = Image.new("RGBA", (S, S), bg)
    d = ImageDraw.Draw(img)
    w = S * 0.13 * scale
    r, gap, stem = w * 0.58, w * 0.42, w * 40 / 14
    top = (S - (r * 2 + gap + stem)) / 2
    cx = S / 2
    d.ellipse([cx - r, top, cx + r, top + 2 * r], fill=WHITE)
    y = top + 2 * r + gap
    d.rounded_rectangle([cx - w / 2, y, cx + w / 2, y + stem], radius=w * 0.09, fill=WHITE)
    return img.resize((size, size), Image.LANCZOS)


mark(1024, INK, 1.0).save(OUT / "icon.png")
mark(1024, (0, 0, 0, 0), 0.72).save(OUT / "adaptive-foreground.png")
mark(1024, (0, 0, 0, 0), 0.72).save(OUT / "adaptive-monochrome.png")
mark(512, (0, 0, 0, 0), 1.3).save(OUT / "splash-mark.png")
mark(64, INK, 1.0).save(OUT / "favicon.png")
print("ok")
