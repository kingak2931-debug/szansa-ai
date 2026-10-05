#!/usr/bin/env python3
"""Logo „lustrzane złoto” – pliki dla strony z obrazu z Higgsfield.

    python3 tools/make_logo_gold.py up.png [katalog_wyjściowy]

up.png – logo na czarnym tle, powiększone do 4K (Higgsfield: gpt_image_2_5, wersja A,
job 0a1a1fbf-c682-4aca-9c14-99fb2183e6bd → upscale afc0237e-be46-42ea-b68b-d0499b968151).

Tło jest czysto czarne, więc przezroczystość liczymy z jasności (jak „kolor → alfa”):
ciemne piksele krawędzi stają się półprzezroczyste, a ich kolor jest odpowiednio rozjaśniany,
dzięki czemu logo na dowolnym tle wygląda tak jak na czerni, bez ciemnej obwódki.
  logo-gold.*        – na ciemne tła (nagłówek, intro)
  logo-gold-light.*  – na jasne tła (stopka, polityka prywatności): łagodniejsze krawędzie
  logo-icon.*        – sam znak (ludzik + sieć), favicon-16/32.png, apple-touch-icon.png
  og-image.jpg       – podgląd do social media (1200×630)
Wypisuje też położenie kul sieci (dla assets/sparks.js).
"""
import sys
from pathlib import Path

import numpy as np
from PIL import Image

SRC = sys.argv[1]
OUT = Path(sys.argv[2] if len(sys.argv) > 2 else '.')
W = 2400

im = np.asarray(Image.open(SRC).convert('RGB')).astype(np.float32)
L = im.max(axis=2)
ys, xs = np.where(L > 14)
pad = int((xs.max() - xs.min()) * 0.012)
BOX = (max(0, xs.min() - pad), max(0, ys.min() - pad),
       min(im.shape[1], xs.max() + pad + 1), min(im.shape[0], ys.max() + pad + 1))


def make(lo, hi, name):
    a = np.clip((L - lo) / (hi - lo), 0, 1)
    rgb = np.clip(im / np.maximum(a[..., None], 1e-3), 0, 255) * (a[..., None] > 0)
    img = Image.fromarray(np.dstack([rgb, a * 255]).astype(np.uint8), 'RGBA').crop(BOX)
    img = img.resize((W, round(img.height * W / img.width)), Image.LANCZOS)
    img.save(OUT / f'{name}.png', optimize=True)
    img.save(OUT / f'{name}.webp', quality=92, method=6)
    return img


dark = make(12, 40, 'logo-gold')
make(14, 110, 'logo-gold-light')
print('logo', dark.size)

# Znak: wszystko na lewo od początku napisu. Napis zaczyna się tam, gdzie w pasie „Szansa”
# (55–80% wysokości) pojawia się treść na prawo od ludzika.
al = np.asarray(dark)[..., 3] > 20
band = al[int(dark.height * 0.55):int(dark.height * 0.8)].any(axis=0)
text_x = next(x for x in range(int(W * 0.2), W) if band[x])
ic = dark.crop((0, 0, text_x - 6, dark.height))
yy, xx = np.where(np.asarray(ic)[..., 3] > 20)
ic = ic.crop((xx.min(), yy.min(), xx.max() + 1, yy.max() + 1))
s = max(ic.size)
m = int(s * 0.05)
sq = Image.new('RGBA', (s + 2 * m, s + 2 * m), (0, 0, 0, 0))
sq.paste(ic, ((s + 2 * m - ic.width) // 2, (s + 2 * m - ic.height) // 2), ic)
icon = sq.resize((512, 512), Image.LANCZOS)
icon.save(OUT / 'logo-icon.png', optimize=True)
icon.save(OUT / 'logo-icon.webp', quality=92, method=6)
for n in (32, 16):
    sq.resize((n, n), Image.LANCZOS).save(OUT / f'favicon-{n}.png')
bg = Image.new('RGBA', (180, 180), (20, 15, 9, 255))
t = sq.resize((156, 156), Image.LANCZOS)
bg.paste(t, (12, 12), t)
bg.convert('RGB').save(OUT / 'apple-touch-icon.png')
print('icon', ic.size, 'text_x', text_x)

og = Image.new('RGBA', (1200, 630), (20, 15, 9, 255))
t = dark.resize((1000, round(dark.height * 1000 / dark.width)), Image.LANCZOS)
og.alpha_composite(t, (100, (630 - t.height) // 2))
og.convert('RGB').save(OUT / 'og-image.jpg', quality=90)

# Kule sieci: po „ścienieniu” maski (MinFilter) cienkie linie znikają, zostają kule.
# Środki w skali 580 px szerokości logo (tak liczy assets/sparks.js).
from PIL import ImageFilter
alpha = dark.getchannel('A').crop((0, 0, text_x, int(dark.height * 0.55)))
core = np.asarray(alpha.filter(ImageFilter.MinFilter(17))) > 128
seen = np.zeros_like(core)
nodes = []
for y0, x0 in zip(*np.where(core)):
    if seen[y0, x0]:
        continue
    stack, pts = [(y0, x0)], []
    seen[y0, x0] = True
    while stack:
        y, x = stack.pop()
        pts.append((y, x))
        for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            ny, nx = y + dy, x + dx
            if 0 <= ny < core.shape[0] and 0 <= nx < core.shape[1] and core[ny, nx] and not seen[ny, nx]:
                seen[ny, nx] = True
                stack.append((ny, nx))
    if len(pts) > 40:
        p = np.array(pts)
        nodes.append((len(pts), p[:, 1].mean() * 580 / W, p[:, 0].mean() * 580 / W))
nodes.sort(reverse=True)
print('ratio', round(dark.height / dark.width, 4))
print('nodes', [[round(x, 1), round(y, 1)] for _, x, y in nodes])
