#!/usr/bin/env python3
"""Dane do tła „Droga przez Polskę” (assets/poland-map.json) z otwartych źródeł.

    python3 tools/make_poland_map.py katalog_z_danymi [assets/poland-map.json]

Źródła (pobierz do katalogu_z_danymi):
  ne_10m_admin_0_countries.geojson, ne_10m_roads.geojson,
  ne_10m_rivers_lake_centerlines.geojson, ne_10m_rivers_europe.geojson, ne_10m_lakes.geojson
      – Natural Earth (domena publiczna), github.com/nvkelso/natural-earth-vector/tree/master/geojson
  polska-geojson/wojewodztwa/wojewodztwa-min.geojson
      – github.com/ppatrzyk/polska-geojson (MIT)
  pl_places.json – miejscowości w Polsce ≥ 1000 mieszkańców z liczbą ludności
      – pakiet npm all-the-cities (MIT, dane GeoNames CC BY 4.0), filtr country == 'PL'

Trasa: prawdziwa sieć dróg Natural Earth; między kolejnymi przystankami liczona
najkrótsza droga (Dijkstra). Współrzędne wyjściowe w kilometrach (rzut równoodległościowy
wyśrodkowany na Polsce), y w dół – gotowe do rysowania.
"""
import heapq
import json
import math
import sys
from pathlib import Path

from shapely.geometry import LineString, MultiLineString, Point, shape
from shapely.ops import unary_union

SRC = Path(sys.argv[1])
OUT = Path(sys.argv[2] if len(sys.argv) > 2 else 'assets/poland-map.json')

LON0, LAT0 = 19.2, 52.0
KX, KY = math.cos(math.radians(LAT0)) * 111.32, 110.57


def proj(lon, lat):
    return (round((lon - LON0) * KX, 1), round(-(lat - LAT0) * KY, 1))


# Przystanki – prawdziwe małe miejscowości (< 20 tys. mieszkańców) w różnych regionach.
START = ('Ełganowo', 18.60, 54.235)            # siedziba fundacji (położenie przybliżone)
STOPS = ['Pelplin', 'Lidzbark Warmiński', 'Tykocin', 'Kazimierz Dolny',
         'Chęciny', 'Myślenice', 'Paczków', 'Karpacz']


def load(name):
    return json.load(open(SRC / name))['features']


poland = shape([f for f in load('ne_10m_admin_0_countries.geojson')
                if f['properties']['ADM0_A3'] == 'POL'][0]['geometry'])
area = poland.buffer(0.08)


def lines_of(g):
    if g.is_empty:
        return []
    if isinstance(g, LineString):
        return [g]
    if isinstance(g, MultiLineString):
        return list(g.geoms)
    return [x for part in getattr(g, 'geoms', []) for x in lines_of(part)]


def pline(ls, tol):
    """Linia → uproszczona lista punktów w km."""
    pts = [proj(x, y) for x, y in ls.coords]
    simp = LineString(pts).simplify(tol)
    return [[round(x, 1), round(y, 1)] for x, y in simp.coords]


out = {}

# kontur Polski
outline = max(getattr(poland, 'geoms', [poland]), key=lambda p: p.area)
out['outline'] = pline(outline.exterior, 0.7)

# województwa (granice wewnętrzne – rysujemy cały obrys każdego)
out['voiv'] = []
for f in json.load(open(SRC / 'polska-geojson/wojewodztwa/wojewodztwa-min.geojson'))['features']:
    g = shape(f['geometry'])
    for poly in getattr(g, 'geoms', [g]):
        out['voiv'].append(pline(poly.exterior, 1.0))

# rzeki
out['rivers'] = []
for name in ['ne_10m_rivers_lake_centerlines.geojson', 'ne_10m_rivers_europe.geojson']:
    for f in load(name):
        for ls in lines_of(shape(f['geometry']).intersection(area)):
            if ls.length > 0.05:
                out['rivers'].append(pline(ls, 0.8))
# jeziora (Mazury)
out['lakes'] = []
for f in load('ne_10m_lakes.geojson'):
    g = shape(f['geometry'])
    if g.intersects(area):
        for poly in getattr(g, 'geoms', [g]):
            if poly.area > 0.002:
                out['lakes'].append(pline(poly.exterior, 0.5))

# drogi (do tła) + sieć do wyznaczenia trasy
road_lines = []
for f in load('ne_10m_roads.geojson'):
    if f['properties'].get('type') == 'Ferry Route':
        continue
    for ls in lines_of(shape(f['geometry']).intersection(area)):
        road_lines.append(ls)
out['roads'] = [pline(ls, 1.0) for ls in road_lines]

noded = lines_of(unary_union(road_lines))       # podział w miejscach przecięć
graph = {}


def key(x, y):
    return (round(x, 4), round(y, 4))


for ls in noded:
    c = list(ls.coords)
    for a, b in zip(c, c[1:]):
        ka, kb = key(*a), key(*b)
        pa, pb = proj(*a), proj(*b)
        d = math.dist(pa, pb)
        graph.setdefault(ka, []).append((kb, d))
        graph.setdefault(kb, []).append((ka, d))
# sklejanie drobnych przerw: łączymy węzły odległe o < 1,5 km (siatka 2 km)
grid = {}
for k in graph:
    x, y = proj(*k)
    grid.setdefault((int(x // 2), int(y // 2)), []).append((k, (x, y)))
for (gx, gy), items in grid.items():
    near = [it for dx in (-1, 0, 1) for dy in (-1, 0, 1) for it in grid.get((gx + dx, gy + dy), [])]
    for ka, pa in items:
        for kb, pb in near:
            d = math.dist(pa, pb)
            if ka != kb and d < 1.5:
                graph[ka].append((kb, d))
# tylko największa spójna część sieci
seen, best = set(), []
for start in graph:
    if start in seen:
        continue
    comp, stack = [], [start]
    seen.add(start)
    while stack:
        u = stack.pop()
        comp.append(u)
        for v, _ in graph[u]:
            if v not in seen:
                seen.add(v)
                stack.append(v)
    if len(comp) > len(best):
        best = comp
nodes = best
print('sieć dróg:', len(graph), 'węzłów, spójna część:', len(nodes))


def nearest(lon, lat):
    p = proj(lon, lat)
    return min(nodes, key=lambda k: math.dist(proj(*k), p))


def dijkstra(a, b):
    dist, prev, q = {a: 0}, {}, [(0, a)]
    while q:
        d, u = heapq.heappop(q)
        if u == b:
            break
        if d > dist[u]:
            continue
        for v, w in graph[u]:
            nd = d + w
            if nd < dist.get(v, 1e18):
                dist[v], prev[v] = nd, u
                heapq.heappush(q, (nd, v))
    path = [b]
    while path[-1] != a:
        path.append(prev[path[-1]])
    return path[::-1]


places = json.load(open(SRC / 'pl_places.json'))
by_name = {p['n']: p for p in places}
waypoints = [START] + [(n, by_name[n]['lon'], by_name[n]['lat']) for n in STOPS]

route = []
stops_out = []
for i, (name, lon, lat) in enumerate(waypoints):
    here = proj(lon, lat)
    if i == 0:
        route.append(list(here))
    else:
        prev_name, plon, plat = waypoints[i - 1]
        seg = dijkstra(nearest(plon, plat), nearest(lon, lat))
        route += [list(proj(*k)) for k in seg]
        route.append(list(here))
    stops_out.append({'name': name, 'x': here[0], 'y': here[1]})
# uproszczenie i długości narastające (do animacji)
rl = LineString(route).simplify(0.25)
pts = [[round(x, 1), round(y, 1)] for x, y in rl.coords]
acc, total = [0.0], 0.0
for a, b in zip(pts, pts[1:]):
    total += math.dist(a, b)
    acc.append(round(total, 1))
out['route'] = pts
out['routeLen'] = acc
route_ls = LineString(pts)
for s in stops_out:
    s['at'] = round(route_ls.project(Point(s['x'], s['y'])), 1)
out['stops'] = stops_out

# miejscowości do 20 tys. mieszkańców: [x, y, tys. mieszkańców, km trasy, przy którym się zapala (-1 = daleko)]
out['places'] = []
for p in places:
    if p['p'] >= 20000 or not poland.buffer(0.02).contains(Point(p['lon'], p['lat'])):
        continue
    x, y = proj(p['lon'], p['lat'])
    d = route_ls.distance(Point(x, y))
    at = round(route_ls.project(Point(x, y)), 1) if d < 28 else -1
    out['places'].append([x, y, round(p['p'] / 1000, 1), at])

xs = [x for x, _ in out['outline']]
ys = [y for _, y in out['outline']]
out['bounds'] = [min(xs), min(ys), max(xs), max(ys)]
out['sources'] = ('Natural Earth (domena publiczna); polska-geojson (MIT); '
                  'GeoNames przez all-the-cities (CC BY 4.0 / MIT)')
OUT.write_text(json.dumps(out, ensure_ascii=False, separators=(',', ':')))
print('trasa', round(total), 'km |', len(out['places']), 'miejscowości |',
      sum(1 for p in out['places'] if p[3] >= 0), 'przy trasie |', OUT.stat().st_size // 1024, 'KB')
