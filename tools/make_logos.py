#!/usr/bin/env python3
"""Tworzy wszystkie wersje logo z oryginału na białym tle.

    python3 tools/make_logos.py źródło.png [katalog_wyjściowy] [szerokość_web]

Źródło może być oryginałem (642×247) albo jego powiększeniem (np. 4K z upscale AI) –
układ jest liczony względem oryginału, więc wszystkie pliki mają te same proporcje
(logo-on-dark: 580:218, jak zakładają tools/make_intro.sh i assets/sparks.js).

Wynik:
  logo.png          – na jasne tło (przezroczyste tło), szerokość = szerokość_web
  logo-on-dark.png  – na ciemne tło / filmy (z jasnymi refleksami i miękkim cieniem)
  logo-icon.png     – sam znak 512×512, apple-touch-icon.png 180×180, favicon.ico
"""
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter

REF_W = 642                  # szerokość oryginału – do niego odnosimy wszystkie wymiary
CROP = (40, 23, 580, 201)    # kadr logo w oryginale (z marginesem 4 px)
GLOW_PAD = 20                # margines na cień w logo-on-dark (w pikselach oryginału)
ICON_RIGHT = 185             # sam znak: lewa część logo do tej kolumny (od lewej krawędzi oryginału)

src = Path(sys.argv[1])
out = Path(sys.argv[2] if len(sys.argv) > 2 else 'assets')
web_w = int(sys.argv[3]) if len(sys.argv) > 3 else 1400

img = Image.open(src).convert('RGB')
s = img.width / REF_W                              # skala względem oryginału
REF_H = 247
if abs(img.height - REF_H * s) >= 1:               # upscale bywa minimalnie nierówny w pionie
    img = img.resize((img.width, round(REF_H * s)), Image.LANCZOS)
a = np.asarray(img).astype(np.float32)
m = max(1, round(3 * s))                           # oryginał ma artefakty na samej krawędzi
a[:m, :] = 255; a[-m:, :] = 255; a[:, :m] = 255; a[:, -m:] = 255
dist = (255 - a).max(-1)                           # odległość od bieli

box = tuple(round(v * s) for v in CROP)

# Jasne tło: „kolor → przezroczystość” (usuwa biel, zachowuje półprzezroczyste krawędzie).
al = dist / 255
safe = np.where(al > 0, al, 1)[..., None]
rgb = np.clip((a - 255 * (1 - al[..., None])) / safe, 0, 255)
al2 = np.clip(al ** 0.6, 0, 1); al2[al < 0.02] = 0
light = Image.fromarray(np.dstack([rgb, al2 * 255]).astype(np.uint8), 'RGBA').crop(box)

# Ciemne tło: zachowuje jasne refleksy złota; krawędź wygładzona.
ald = np.clip((dist - 6) / 30, 0, 1)
dark = Image.fromarray(np.dstack([a, ald * 255]).astype(np.uint8), 'RGBA').crop(box)
pad = round(GLOW_PAD * s)
canvas = Image.new('RGBA', (dark.width + 2 * pad, dark.height + 2 * pad), (0, 0, 0, 0))
shadow = Image.new('RGBA', dark.size, (0, 0, 0, 255))
shadow.putalpha(dark.getchannel('A').point(lambda v: int(v * 0.55)))
canvas.paste(shadow, (pad, pad), shadow)
canvas = canvas.filter(ImageFilter.GaussianBlur(8 * s))
canvas.alpha_composite(dark, (pad, pad))


def resize_w(im, w):
    return im if im.width == w else im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)


# Ta sama szerokość „tła” w obu wersjach, więc logo na stronie ma identyczną wielkość.
k = web_w / canvas.width
resize_w(canvas, web_w).save(out / 'logo-on-dark.png', optimize=True)
resize_w(light, round(light.width * k)).save(out / 'logo.png', optimize=True)

# Sam znak (postać + sieć)
icon = dark.crop((0, 0, round(ICON_RIGHT * s) - box[0], dark.height))
icon = icon.crop(icon.getchannel('A').point(lambda v: 255 if v > 60 else 0).getbbox())
side = max(icon.size) + round(12 * s)
sq = Image.new('RGBA', (side, side), (0, 0, 0, 0))
sq.alpha_composite(icon, ((side - icon.width) // 2, (side - icon.height) // 2))
sq.resize((512, 512), Image.LANCZOS).save(out / 'logo-icon.png', optimize=True)
sq.resize((180, 180), Image.LANCZOS).save(out / 'apple-touch-icon.png', optimize=True)
sq.resize((256, 256), Image.LANCZOS).save(out.parent / 'favicon.ico' if out.name == 'assets' else out / 'favicon.ico',
                                         sizes=[(16, 16), (32, 32), (48, 48), (64, 64)])

print('skala', round(s, 2), '| logo-on-dark', resize_w(canvas, web_w).size, '| logo', round(light.width * k))
