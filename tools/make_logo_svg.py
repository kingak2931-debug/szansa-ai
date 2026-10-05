#!/usr/bin/env python3
"""Wektorowe logo Fundacji Szansa AI (SVG) – wierne odtworzenie oryginału (assets/logo-original.png).

    python3 tools/make_logo_svg.py [katalog_czcionek] [katalog_wyjściowy]

Napisy to kształty liter (bez zależności od czcionek na stronie):
  „Szansa”            – Noto Serif Italic (najlepsze dopasowanie do oryginału),
  „AI”, „FUNDACJA”    – Gelasio (odpowiednik Georgii).
Każda litera (a „Szansa” jako całe słowo) jest dopasowana do swojego miejsca w oryginale.
Znak (postać, sieć, gwiazdki) jest narysowany z geometrii zmierzonej na oryginale.
Współrzędne = piksele oryginału (642×247), więc SVG pokrywa się z dotychczasowymi PNG.

Czcionki (licencja OFL) z npm: @fontsource/noto-serif, @fontsource/gelasio
(pliki *-latin-400-italic / *-latin-400-normal przekonwertowane do TTF).

Wynik:
  logo.svg          – na jasne tło (kadr jak logo.png)
  logo-on-dark.svg  – na ciemne tło: cienka ciemna obwódka + miękki cień (kadr jak logo-on-dark.png)
  logo-icon.svg     – sam znak (postać + sieć), kwadrat
PNG (do filmu, ikonek, social media) robi z nich tools/render_logos.js.
"""
import sys
from pathlib import Path

import numpy as np
from PIL import Image
from fontTools.pens.boundsPen import BoundsPen
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.ttLib import TTFont

ROOT = Path(__file__).resolve().parent.parent
FONTS = Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT / 'tools' / 'fonts'
OUT = Path(sys.argv[2]) if len(sys.argv) > 2 else ROOT / 'assets'

ITALIC = TTFont(FONTS / 'noto-serif-italic.ttf')
REGULAR = TTFont(FONTS / 'gelasio-normal.ttf')

# ── pomiar położenia liter na oryginale ───────────────────────────────────────
orig = np.asarray(Image.open(ROOT / 'assets' / 'logo-original.png').convert('RGB')).astype(float)
UP = 8
dist = (255 - orig).max(-1)
dist[:3] = 0; dist[-3:] = 0; dist[:, :3] = 0; dist[:, -3:] = 0
big = np.asarray(Image.fromarray(dist.astype(np.uint8)).resize(
    (dist.shape[1] * UP, dist.shape[0] * UP), Image.BILINEAR)).astype(float)


def ink_box(x0, y0, x1, y1):
    """Obrys „atramentu” w prostokącie (piksele oryginału), próg = 50% lokalnego maksimum."""
    r = big[y0 * UP:(y1 + 1) * UP, x0 * UP:(x1 + 1) * UP]
    ys, xs = np.where(r > r.max() * 0.5)
    return (x0 + xs.min() / UP, y0 + ys.min() / UP, x0 + (xs.max() + 1) / UP, y0 + (ys.max() + 1) / UP)


def glyph_run(font, text):
    """Kształt napisu w jednostkach czcionki: [(nazwa glifu, przesunięcie x)], obrys."""
    cmap, gs, hmtx = font.getBestCmap(), font.getGlyphSet(), font['hmtx']
    run, x = [], 0
    bp = BoundsPen(gs)
    for ch in text:
        name = cmap[ord(ch)]
        run.append((name, x))
        gs[name].draw(TransformPen(bp, (1, 0, 0, 1, x, 0)))
        x += hmtx[name][0]
    return run, bp.bounds


def text_path(font, text, box):
    """Ścieżka SVG napisu dopasowana obrysem do box=(x0, y0, x1, y1)."""
    gs = font.getGlyphSet()
    run, (xmin, ymin, xmax, ymax) = glyph_run(font, text)
    sx = (box[2] - box[0]) / (xmax - xmin)
    sy = (box[3] - box[1]) / (ymax - ymin)
    pen = SVGPathPen(gs, ntos=lambda v: ('%.2f' % v).rstrip('0').rstrip('.'))
    for name, dx in run:
        t = (sx, 0, 0, -sy, box[0] + (dx - xmin) * sx, box[3] + ymin * sy)
        gs[name].draw(TransformPen(pen, t))
    return pen.getCommands()


# Litery „FUNDACJA” (kolumny zmierzone na oryginale) i „AI”
FUNDACJA_COLS = [(228, 240), (250, 266), (276, 293), (303, 318), (328, 344), (354, 367), (377, 388), (397, 413)]
fundacja = ' '.join(text_path(REGULAR, ch, ink_box(x0 - 1, 66, x1 + 1, 90))
                    for ch, (x0, x1) in zip('FUNDACJA', FUNDACJA_COLS))
szansa = text_path(ITALIC, 'Szansa', ink_box(222, 98, 478, 166))
# „A” i „I” – rozdzielone przerwą między kolumnami
ai_box = ink_box(488, 98, 578, 166)
cols = np.where((big[int(ai_box[1] * UP):int(ai_box[3] * UP), 488 * UP:579 * UP] >
                 big.max() * 0.2).any(0))[0]
gap = next(i for i in range(1, len(cols)) if cols[i] - cols[i - 1] > UP)
a_x1 = 488 + (cols[gap - 1] + 1) / UP
i_x0 = 488 + cols[gap] / UP
ai = (text_path(REGULAR, 'A', ink_box(488, 98, int(np.ceil(a_x1)), 166)) + ' ' +
      text_path(REGULAR, 'I', ink_box(int(np.floor(i_x0)), 98, 578, 166)))

# ── znak ─────────────────────────────────────────────────────────────────────
SPHERES = [  # (x, y, promień) – zmierzone na oryginale
    (128.46, 65.39, 9.62), (130.69, 34.61, 5.69), (109.01, 46.51, 4.38), (101.97, 72.21, 4.0),
    (151.71, 53.38, 4.88), (156.01, 79.0, 4.12), (111.39, 91.84, 5.25), (141.49, 95.3, 3.75),
]
EDGES = [(0, 1), (0, 2), (0, 3), (0, 4), (0, 5), (0, 6), (0, 7), (2, 3), (4, 5), (6, 7)]
STARS = [(88.3, 37.5, 3.9), (165.8, 32.5, 5.0)]


def star(x, y, r):
    k = r * 0.12
    return (f'M{x},{y - r} Q{x + k},{y - k} {x + r},{y} Q{x + k},{y + k} {x},{y + r} '
            f'Q{x - k},{y + k} {x - r},{y} Q{x - k},{y - k} {x},{y - r}Z')


def f(v):
    return ('%.2f' % v).rstrip('0').rstrip('.')


lines = ''.join(
    f'<line x1="{f(SPHERES[a][0])}" y1="{f(SPHERES[a][1])}" x2="{f(SPHERES[b][0])}" y2="{f(SPHERES[b][1])}"/>'
    for a, b in EDGES)
spheres = ''.join(f'<circle cx="{f(x)}" cy="{f(y)}" r="{f(r)}"/>' for x, y, r in SPHERES)
stars = ''.join(f'<path d="{star(x, y, r)}"/>' for x, y, r in STARS)

DEFS = '''
  <linearGradient id="g-szansa" gradientUnits="userSpaceOnUse" x1="224" y1="0" x2="476" y2="0">
    <stop offset="0" stop-color="#d09a3e"/><stop offset=".28" stop-color="#e2b65c"/>
    <stop offset=".5" stop-color="#f6e4bb"/><stop offset=".66" stop-color="#d8ab62"/>
    <stop offset="1" stop-color="#a5712e"/>
  </linearGradient>
  <linearGradient id="g-szansa-v" gradientUnits="userSpaceOnUse" x1="0" y1="104" x2="0" y2="161">
    <stop offset="0" stop-color="#fff" stop-opacity=".22"/><stop offset=".55" stop-color="#fff" stop-opacity="0"/>
    <stop offset="1" stop-color="#6b4312" stop-opacity=".18"/>
  </linearGradient>
  <linearGradient id="g-ai" gradientUnits="userSpaceOnUse" x1="0" y1="104" x2="0" y2="161">
    <stop offset="0" stop-color="#dbb26d"/><stop offset=".45" stop-color="#bb7f26"/>
    <stop offset="1" stop-color="#83561a"/>
  </linearGradient>
  <linearGradient id="g-fundacja" gradientUnits="userSpaceOnUse" x1="228" y1="0" x2="414" y2="0">
    <stop offset="0" stop-color="#c49a55"/><stop offset=".3" stop-color="#dcb676"/>
    <stop offset="1" stop-color="#c49a55"/>
  </linearGradient>
  <radialGradient id="g-sphere" cx=".5" cy=".5" r=".5" fx=".34" fy=".3">
    <stop offset="0" stop-color="#fff8de"/><stop offset=".28" stop-color="#f5cd72"/>
    <stop offset=".72" stop-color="#cf922f"/><stop offset="1" stop-color="#94601a"/>
  </radialGradient>
  <linearGradient id="g-head" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#cf9642"/><stop offset=".55" stop-color="#8a5a1e"/>
    <stop offset="1" stop-color="#3f250b"/>
  </linearGradient>
  <linearGradient id="g-arm" gradientUnits="userSpaceOnUse" x1="49.5" y1="153.5" x2="97.5" y2="106.5">
    <stop offset="0" stop-color="#3f250b"/><stop offset=".45" stop-color="#7a4c17"/>
    <stop offset="1" stop-color="#c8903e"/>
  </linearGradient>
  <linearGradient id="g-leg" gradientUnits="userSpaceOnUse" x1="0" y1="159" x2="0" y2="190">
    <stop offset="0" stop-color="#dea64e"/><stop offset=".45" stop-color="#8c5a1c"/>
    <stop offset="1" stop-color="#3a2109"/>
  </linearGradient>
  <linearGradient id="g-base" gradientUnits="userSpaceOnUse" x1="44" y1="0" x2="88" y2="0">
    <stop offset="0" stop-color="#e9cf9c" stop-opacity=".4"/><stop offset=".5" stop-color="#9b6a24"/>
    <stop offset="1" stop-color="#e9cf9c" stop-opacity=".4"/>
  </linearGradient>'''

ARTWORK = f'''
  <g class="mark">
    <g stroke="#f6e3bb" stroke-width="9.2" stroke-linecap="round" fill="none" opacity=".85">
      <line x1="49.5" y1="153.5" x2="97.5" y2="106.5"/>
      <line x1="65.6" y1="161" x2="54.5" y2="188.4"/><line x1="66.4" y1="161" x2="77.9" y2="188.4"/>
    </g>
    <rect x="61" y="130" width="10" height="33" rx="3" fill="#f8e8c4"/>
    <circle cx="65.6" cy="124.3" r="9.1" fill="url(#g-head)" stroke="#e8b54a" stroke-width=".7"/>
    <g stroke-linecap="round" fill="none" stroke-width="6.2">
      <line x1="65.6" y1="161" x2="54.5" y2="188.4" stroke="url(#g-leg)"/>
      <line x1="66.4" y1="161" x2="77.9" y2="188.4" stroke="url(#g-leg)"/>
      <line x1="49.5" y1="153.5" x2="97.5" y2="106.5" stroke="url(#g-arm)" stroke-width="6.6"/>
    </g>
    <path d="M44.5,193.2 Q66,198.8 87.5,192.2" stroke="url(#g-base)" stroke-width="1.4" fill="none" stroke-linecap="round"/>
    <g stroke="#d6b176" stroke-width="1.3" stroke-linecap="round">{lines}</g>
    <g fill="url(#g-sphere)">{spheres}</g>
    <g fill="#f3dca8">{stars}</g>
  </g>
  <path fill="url(#g-fundacja)" d="{fundacja}"/>
  <path fill="url(#g-szansa)" d="{szansa}"/>
  <path fill="url(#g-szansa-v)" d="{szansa}"/>
  <path fill="url(#g-ai)" d="{ai}"/>'''


def svg(viewbox, body, extra_defs='', title='Fundacja Szansa AI'):
    x, y, w, h = viewbox
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{x} {y} {w} {h}" '
            f'width="{w}" height="{h}" role="img" aria-label="{title}">\n'
            f'<title>{title}</title>\n<defs>{DEFS}{extra_defs}\n</defs>{body}\n</svg>\n')


# Na jasne tło: kadr jak logo.png (40, 23, 580, 201)
(OUT / 'logo.svg').write_text(svg((40, 23, 540, 178), ARTWORK))

# Na ciemne tło: kadr jak logo-on-dark.png (z marginesem 20 na cień),
# cienka ciemna obwódka (wariant C) + miękki cień pod spodem.
DARK_DEFS = '''
  <filter id="outline" x="-5%" y="-10%" width="110%" height="120%" color-interpolation-filters="sRGB">
    <feMorphology in="SourceAlpha" operator="dilate" radius="1.5" result="thick"/>
    <feFlood flood-color="#150d05"/>
    <feComposite in2="thick" operator="in" result="ring"/>
    <feGaussianBlur in="SourceAlpha" stdDeviation="7" result="blur"/>
    <feFlood flood-color="#000" flood-opacity=".55"/>
    <feComposite in2="blur" operator="in" result="shadow"/>
    <feMerge><feMergeNode in="shadow"/><feMergeNode in="ring"/><feMergeNode in="SourceGraphic"/></feMerge>
  </filter>'''
(OUT / 'logo-on-dark.svg').write_text(
    svg((20, 3, 580, 218), f'\n<g filter="url(#outline)">{ARTWORK}\n</g>', DARK_DEFS))
# Sam znak (ikona, awatar): kwadratowy kadr wokół postaci i sieci
(OUT / 'logo-icon.svg').write_text(svg((22, 18, 184, 184), ARTWORK.split('<path fill="url(#g-fundacja)"')[0]))
print('zapisano', OUT / 'logo.svg', OUT / 'logo-on-dark.svg', OUT / 'logo-icon.svg')
