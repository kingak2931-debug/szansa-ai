#!/usr/bin/env python3
"""Logo Fundacji Szansa AI w ostrzejszym, „nagrodzonym” kroju.

Zostawia ten sam znak (dziecko sięgające do konstelacji) i te same słowa,
ale rysuje je tak, żeby były czytelne w nagłówku na ciemnym filmie:
grubszy, jaśniejszy znak, płaska złota „FUNDACJA”, duża kursywa Instrument Serif.

  python3 tools/make_logo_awwwards.py

Wynik: assets/logo.svg, assets/logo-on-dark.svg, assets/logo-icon.svg
"""
from pathlib import Path

from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.ttLib import TTFont

ROOT = Path(__file__).resolve().parent.parent
FONTS = ROOT / 'tools' / 'fonts'
INTER = Path('/usr/share/fonts/truetype/macos/Inter-Medium.ttf')
OUT = ROOT / 'assets'

ITALIC = TTFont(FONTS / 'InstrumentSerif-Italic.ttf')
REGULAR = TTFont(FONTS / 'InstrumentSerif-Regular.ttf')
KICKER = TTFont(INTER)


def f(v):
    return ('%.2f' % v).rstrip('0').rstrip('.')


def text_path(font, text, size, x, baseline, tracking=0):
    gs = font.getGlyphSet()
    cmap = font.getBestCmap()
    upem = font['head'].unitsPerEm
    hmtx = font['hmtx']
    scale = size / upem
    pen = SVGPathPen(gs, ntos=lambda v: ('%.2f' % v).rstrip('0').rstrip('.'))
    cx = x
    for i, ch in enumerate(text):
        name = cmap[ord(ch)]
        gs[name].draw(TransformPen(pen, (scale, 0, 0, -scale, cx, baseline)))
        cx += hmtx[name][0] * scale + (tracking if i < len(text) - 1 else 0)
    return pen.getCommands(), cx


def star(x, y, r):
    k = r * 0.16
    return (f'M{f(x)},{f(y - r)} Q{f(x + k)},{f(y - k)} {f(x + r)},{f(y)} '
            f'Q{f(x + k)},{f(y + k)} {f(x)},{f(y + r)} '
            f'Q{f(x - k)},{f(y + k)} {f(x - r)},{f(y)} '
            f'Q{f(x - k)},{f(y - k)} {f(x)},{f(y - r)}Z')


# Konstelacja z oryginału, powiększona i przesunięta, żeby czytała się obok napisu.
_RAW = [
    (128.46, 65.39, 9.62), (130.69, 34.61, 5.69), (109.01, 46.51, 4.38), (101.97, 72.21, 4.0),
    (151.71, 53.38, 4.88), (156.01, 79.0, 4.12), (111.39, 91.84, 5.25), (141.49, 95.3, 3.75),
]
_EDGES = [(0, 1), (0, 2), (0, 3), (0, 4), (0, 5), (0, 6), (0, 7), (2, 3), (4, 5), (6, 7)]
_STARS = [(88.3, 37.5, 4.2), (165.8, 32.5, 5.2)]
_CX, _CY, _S, _OX, _OY = 128.46, 65.39, 1.28, 132.0, 58.0


def place(x, y, r):
    return (_OX + (x - _CX) * _S, _OY + (y - _CY) * _S, r * _S)


SPHERES = [place(*p) for p in _RAW]
STARS = [place(*p) for p in _STARS]

# Dziecko – grubsze, lekko zaokrąglone kreski; jasny tors; ręka sięga do sieci, ale jej nie dotyka.
FIGURE = f'''
<g class="figure">
  <path d="M30,208 Q60,218 92,206" fill="none" stroke="url(#limb)" stroke-width="1.7" stroke-linecap="round" opacity=".8"/>
  <g fill="none" stroke-linecap="round">
    <path d="M54,170 Q46,190 38,206" stroke="url(#limb)" stroke-width="9"/>
    <path d="M68,170 Q76,190 86,206" stroke="url(#limb)" stroke-width="9"/>
    <path d="M64,146 Q88,124 106,104" stroke="url(#arm)" stroke-width="9.5"/>
  </g>
  <rect x="48" y="132" width="18" height="42" rx="9" fill="url(#torso)"/>
  <circle cx="57" cy="120" r="14.5" fill="url(#head)"/>
  <circle cx="52" cy="115" r="4.2" fill="#fff8e6" opacity=".82"/>
</g>'''

LINES = ''.join(
    f'<line x1="{f(SPHERES[a][0])}" y1="{f(SPHERES[a][1])}" x2="{f(SPHERES[b][0])}" y2="{f(SPHERES[b][1])}"/>'
    for a, b in _EDGES)
GLOW_X, GLOW_Y, GLOW_R = SPHERES[0]
BALLS = ''.join(f'<circle cx="{f(x)}" cy="{f(y)}" r="{f(r)}"/>' for x, y, r in SPHERES)
HIGHLIGHTS = ''.join(
    f'<circle cx="{f(x - r * 0.34)}" cy="{f(y - r * 0.36)}" r="{f(r * 0.30)}" fill="#fff" opacity=".78"/>'
    for x, y, r in SPHERES)
STAR_PATHS = ''.join(f'<path d="{star(x, y, r)}"/>' for x, y, r in STARS)

KICKER_D, kicker_end = text_path(KICKER, 'FUNDACJA', 17.5, 216, 102, 11.4)
SZANSA_D, szansa_end = text_path(ITALIC, 'Szansa', 84, 210, 188, 0.15)
AI_D, ai_end = text_path(REGULAR, 'AI', 70, szansa_end + 14, 186, 0.4)

VB_W = int(round(ai_end + 28))
VB_H = 224

DEFS_COMMON = f'''
  <radialGradient id="head" cx=".5" cy=".5" r=".55" fx=".32" fy=".28">
    <stop offset="0" stop-color="#fff4d4"/>
    <stop offset=".38" stop-color="#f0c36a"/>
    <stop offset="1" stop-color="#a8742e"/>
  </radialGradient>
  <linearGradient id="torso" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#fffaf0"/>
    <stop offset=".55" stop-color="#f4ddb0"/>
    <stop offset="1" stop-color="#e2c07a"/>
  </linearGradient>
  <linearGradient id="arm" gradientUnits="userSpaceOnUse" x1="64" y1="146" x2="106" y2="104">
    <stop offset="0" stop-color="#c8923e"/>
    <stop offset=".45" stop-color="#f0cb78"/>
    <stop offset="1" stop-color="#fff6df"/>
  </linearGradient>
  <linearGradient id="limb" gradientUnits="userSpaceOnUse" x1="0" y1="150" x2="0" y2="210">
    <stop offset="0" stop-color="#f2d08a"/>
    <stop offset="1" stop-color="#b8833a"/>
  </linearGradient>
  <radialGradient id="sphere" cx=".5" cy=".5" r=".5" fx=".32" fy=".30">
    <stop offset="0" stop-color="#fffdf6"/>
    <stop offset=".22" stop-color="#ffe3a4"/>
    <stop offset=".62" stop-color="#e2ae4e"/>
    <stop offset="1" stop-color="#a56d28"/>
  </radialGradient>
  <radialGradient id="coreglow" cx=".5" cy=".5" r=".5">
    <stop offset="0" stop-color="#fff4d2" stop-opacity=".55"/>
    <stop offset="1" stop-color="#fff4d2" stop-opacity="0"/>
  </radialGradient>
'''

FOIL_DARK = '''
  <linearGradient id="foil" gradientUnits="userSpaceOnUse" x1="210" y1="108" x2="530" y2="198">
    <stop offset="0" stop-color="#fff3d8"/>
    <stop offset=".4" stop-color="#f0c56e"/>
    <stop offset=".58" stop-color="#f8e2b0"/>
    <stop offset="1" stop-color="#d09a45"/>
  </linearGradient>
  <linearGradient id="sheen" gradientUnits="userSpaceOnUse" x1="0" y1="112" x2="0" y2="192">
    <stop offset="0" stop-color="#fff" stop-opacity=".2"/>
    <stop offset=".46" stop-color="#fff" stop-opacity="0"/>
  </linearGradient>
'''

FOIL_LIGHT = '''
  <linearGradient id="foil" gradientUnits="userSpaceOnUse" x1="210" y1="100" x2="520" y2="200">
    <stop offset="0" stop-color="#e8c27a"/>
    <stop offset=".42" stop-color="#b58134"/>
    <stop offset=".52" stop-color="#f3ddb0"/>
    <stop offset="1" stop-color="#7a4e16"/>
  </linearGradient>
  <linearGradient id="sheen" gradientUnits="userSpaceOnUse" x1="0" y1="110" x2="0" y2="190">
    <stop offset="0" stop-color="#fff" stop-opacity=".45"/>
    <stop offset=".5" stop-color="#fff" stop-opacity="0"/>
  </linearGradient>
'''


def body(kicker_fill, line, star):
    return f'''
  <g class="mark">
    {FIGURE}
    <circle cx="{f(GLOW_X)}" cy="{f(GLOW_Y)}" r="{f(GLOW_R * 2.15)}" fill="url(#coreglow)"/>
    <g stroke="{line}" stroke-width="1.85" stroke-linecap="round" fill="none">{LINES}</g>
    <g fill="url(#sphere)">{BALLS}</g>
    <g>{HIGHLIGHTS}</g>
    <g fill="{star}">{STAR_PATHS}</g>
  </g>
  <path fill="{kicker_fill}" d="{KICKER_D}"/>
  <path fill="url(#foil)" d="{SZANSA_D} {AI_D}"/>
  <path fill="url(#sheen)" d="{SZANSA_D} {AI_D}"/>
'''


def svg(defs, inner, extra_attr=''):
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {VB_W} {VB_H}" '
        f'width="{VB_W}" height="{VB_H}" role="img" aria-label="Fundacja Szansa AI"{extra_attr}>\n'
        f'<title>Fundacja Szansa AI</title>\n<defs>{defs}\n</defs>\n{inner}\n</svg>\n'
    )


light = svg(DEFS_COMMON + FOIL_LIGHT, body('#8d5e24', '#b07d32', '#c9953f'))
dark_inner = body('#f4e4c4', '#f4e4c2', '#fff6df')
dark = svg(
    DEFS_COMMON + FOIL_DARK + '''
  <filter id="soft" x="-8%" y="-12%" width="116%" height="130%">
    <feDropShadow dx="0" dy="1.2" stdDeviation="1.1" flood-color="#140c06" flood-opacity=".55"/>
  </filter>''',
    f'<g filter="url(#soft)">{dark_inner}</g>',
)

# Sam znak, kwadratowy kadr.
icon = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="18 2 176 214" width="176" height="214" role="img" aria-label="Fundacja Szansa AI">
<title>Fundacja Szansa AI</title>
<defs>{DEFS_COMMON}
</defs>
  <g class="mark">
    {FIGURE}
    <circle cx="{f(GLOW_X)}" cy="{f(GLOW_Y)}" r="{f(GLOW_R * 2.15)}" fill="url(#coreglow)"/>
    <g stroke="#c4964a" stroke-width="1.85" stroke-linecap="round" fill="none">{LINES}</g>
    <g fill="url(#sphere)">{BALLS}</g>
    <g>{HIGHLIGHTS}</g>
    <g fill="#e8c27a">{STAR_PATHS}</g>
  </g>
</svg>
'''

(OUT / 'logo.svg').write_text(light)
(OUT / 'logo-on-dark.svg').write_text(dark)
(OUT / 'logo-icon.svg').write_text(icon)
print(f'viewBox 0 0 {VB_W} {VB_H}')
print('nodes', [(round(x, 1), round(y, 1)) for x, y, _ in SPHERES + STARS])
print('wrote', VB_W, 'x', VB_H)
