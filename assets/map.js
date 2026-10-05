// „Mapa drogi” – tło strony pod sekcją hero.
// Kreskowa, złota mapa okolicy (wieś z kościołem i zegarem na 16:00, pola, drzewa, gniazdo bociana,
// świetlica, a na końcu sieć z logo – przyszłość). Przez mapę wije się droga od wsi do świetlicy:
// rysuje się złotem w trakcie przewijania, a na jej czubku idzie iskra (ta sama, co w hero).
// Sekcje strony (.stop) są przystankami – ich węzły zapalają się, gdy dotrze do nich iskra,
// a elementy mapy „rysują się”, gdy iskra je mija. Wszystko liczone od układu strony,
// więc mapa dopasowuje się do szerokości ekranu i długości treści.
(function () {
  const journey = document.querySelector('.journey');
  const svg = journey && journey.querySelector('.journey-map');
  if (!svg) return;

  const NS = 'http://www.w3.org/2000/svg';
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const TOP = 300;          // wysokość pasa „horyzontu” nad pierwszym przystankiem (patrz CSS)

  // ── rysunki (kreska, współrzędne względem punktu stania obiektu: (0,0) = środek podstawy) ──
  const ART = {
    house: (s = 1) => `
      <path d="M-15,0 V-17 L0,-30 L15,-17 V0 Z"/><path d="M-4,0 V-10 H4 V0"/>
      <path d="M8,-24 V-31 H12 V-20"/><rect x="-11" y="-14" width="5" height="5"/>`,
    church: () => `
      <path d="M-12,0 V-46 L0,-70 L12,-46 V0 Z"/><path d="M0,-70 V-80 M-4,-76 H4"/>
      <circle cx="0" cy="-36" r="7"/>
      <path d="M0,-36 V-42 M0,-36 L5.2,-33"/>
      <path d="M12,0 V-24 L40,-24 L40,0 Z M12,-24 L26,-36 L40,-24"/><path d="M-5,0 V-10 Q0,-15 5,-10 V0"/>`,
    tree: () => `<path d="M0,0 V-14"/><circle cx="0" cy="-24" r="11"/><path d="M-5,-25 Q0,-31 5,-25"/>`,
    poplar: () => `<path d="M0,0 V-10"/><path d="M0,-10 C-8,-18 -7,-40 0,-52 C7,-40 8,-18 0,-10 Z"/>`,
    bush: () => `<path d="M-14,0 Q-14,-10 -6,-10 Q-4,-16 2,-14 Q10,-16 12,-8 Q16,-4 14,0 Z"/>`,
    field: () => {
      let d = 'M-60,0 L-40,-38 L60,-38 L40,0 Z';
      for (let i = 1; i < 8; i++) {
        const t = i / 8;
        d += ` M${-60 + 100 * t},0 L${-40 + 100 * t},-38`;
      }
      return `<path d="${d}"/>`;
    },
    stork: () => `
      <path d="M0,0 V-60"/><path d="M-12,-60 Q0,-54 12,-60 Q0,-66 -12,-60 Z"/>
      <path d="M-3,-63 Q-2,-74 4,-76 Q8,-77 9,-74 L14,-73 L9,-72 Q6,-70 5,-64"/>
      <path d="M2,-63 L-1,-72"/>`,
    fence: () => `<path d="M-30,0 V-12 M-15,0 V-12 M0,0 V-12 M15,0 V-12 M30,0 V-12 M-32,-5 H32 M-32,-10 H32"/>`,
    swietlica: () => `
      <path d="M-46,0 V-38 H46 V0 Z"/><path d="M-52,-38 L0,-64 L52,-38"/>
      <path d="M-6,0 V-22 H6 V0"/>
      <rect class="glow" x="-38" y="-30" width="16" height="12" rx="1"/>
      <rect class="glow" x="22" y="-30" width="16" height="12" rx="1"/>
      <circle cx="0" cy="-48" r="6"/><path d="M0,-48 V-52 M0,-48 L3.5,-46"/>`,
    // sieć z logo (te same kule i połączenia), środek w (0,-45)
    network: () => {
      const P = [[0, 0, 9.6], [2.2, -30.8, 5.7], [-19.5, -18.9, 4.4], [-26.5, 6.8, 4], [23.2, -12, 4.9],
        [27.6, 13.6, 4.1], [-17.1, 26.4, 5.3], [13, 29.9, 3.8]];
      const E = [[0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [0, 6], [0, 7], [2, 3], [4, 5], [6, 7]];
      const k = 1.6, oy = -45;
      return E.map(([a, b]) => `<path d="M${P[a][0] * k},${P[a][1] * k + oy} L${P[b][0] * k},${P[b][1] * k + oy}"/>`).join('') +
        P.map(([x, y, r]) => `<circle class="node" cx="${x * k}" cy="${y * k + oy}" r="${r * k}"/>`).join('');
    },
  };

  // deterministyczny „los”, żeby mapa wyglądała tak samo przy każdym wejściu
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;

  let roadLen = 0, road, glowRoad, walker, samples = [], decos = [], nodes = [];

  function el(name, attrs, parent = svg) {
    const e = document.createElementNS(NS, name);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    parent.appendChild(e);
    return e;
  }

  // gładka krzywa przez punkty (Catmull-Rom → Bézier)
  function smoothPath(pts) {
    let d = `M${pts[0][0]},${pts[0][1]}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
      const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
      const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
      d += ` C${c1[0].toFixed(1)},${c1[1].toFixed(1)} ${c2[0].toFixed(1)},${c2[1].toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
    }
    return d;
  }

  function addDeco(kind, x, y, scale = 1, extraClass = '') {
    const g = el('g', { class: `deco deco-${kind} ${extraClass}`, transform: `translate(${x.toFixed(1)},${y.toFixed(1)}) scale(${scale})` });
    g.innerHTML = ART[kind]();
    g.querySelectorAll('path,circle,rect,line').forEach((s) => s.setAttribute('pathLength', '1'));
    decos.push({ g, y: y - 40 * scale });
    return g;
  }

  function build() {
    svg.innerHTML = '';
    decos = []; nodes = []; seed = 7;
    const W = journey.clientWidth, H = journey.scrollHeight;
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    const mobile = W < 760;
    const jr = journey.getBoundingClientRect();

    el('defs', {}).innerHTML = `
      <linearGradient id="road-gold" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#f3d9a0"/><stop offset=".5" stop-color="#c8953f"/><stop offset="1" stop-color="#e2b65c"/>
      </linearGradient>
      <radialGradient id="node-gold" fx=".35" fy=".3">
        <stop offset="0" stop-color="#fff8de"/><stop offset=".3" stop-color="#f5cd72"/>
        <stop offset=".75" stop-color="#cf922f"/><stop offset="1" stop-color="#94601a"/>
      </radialGradient>
      <filter id="spark-glow" x="-200%" y="-200%" width="500%" height="500%">
        <feGaussianBlur stdDeviation="5"/>
      </filter>`;

    // przystanki: węzeł drogi obok karty
    const stops = [...journey.querySelectorAll('.stop')].map((s) => {
      const c = s.querySelector('.stop-card').getBoundingClientRect();
      const left = s.dataset.side !== 'right';
      const cy = c.top - jr.top + Math.min(70, c.height / 2);
      const x = mobile ? 30 : (left ? Math.min(c.right - jr.left + 70, W * 0.62) : Math.max(c.left - jr.left - 70, W * 0.38));
      return { s, card: { l: c.left - jr.left, r: c.right - jr.left, t: c.top - jr.top, b: c.bottom - jr.top },
        left, x, y: cy, place: s.dataset.place };
    });

    // punkty drogi: start pod hero → meandry między przystankami → koniec
    const pts = [[mobile ? 30 : W / 2, 0], [mobile ? 30 : W / 2, TOP * 0.55]];
    stops.forEach((st, i) => {
      const prev = pts[pts.length - 1];
      const midY = (prev[1] + st.y) / 2;
      const swing = mobile ? 30 + (i % 2 ? 10 : -6) : (st.left ? W * 0.8 : W * 0.2);
      if (!mobile) pts.push([swing * 0.6 + prev[0] * 0.4, midY]);
      pts.push([st.x, st.y]);
    });
    const last = stops[stops.length - 1];
    pts.push([mobile ? 30 : W / 2, Math.min(H - 60, last.card.b + 120)]);

    const d = smoothPath(pts);
    // „wydrukowana” ścieżka (kropki) + szeroki pas drogi + złota droga rysowana przy przewijaniu
    el('path', { d, class: 'road-trail' });
    glowRoad = el('path', { d, class: 'road-band' });
    road = el('path', { d, class: 'road-gold', stroke: 'url(#road-gold)' });
    roadLen = road.getTotalLength();
    [road, glowRoad].forEach((p) => { p.style.strokeDasharray = `${roadLen} ${roadLen}`; });
    samples = [];
    for (let l = 0; l <= roadLen; l += 6) samples.push([l, road.getPointAtLength(l)]);

    // ── mapa ──
    const deco = el('g', { class: 'decos' });
    const place = (kind, x, y, s, cls) => {
      const g = addDeco(kind, x, y, s, cls); deco.appendChild(g); return g;
    };
    // horyzont: wieś z kościołem (zegar na 16:00)
    const hy = TOP * 0.72;
    if (mobile) {
      place('church', W * 0.55, hy, 0.8); place('house', W * 0.3, hy, 0.8); place('house', W * 0.78, hy, 0.75);
      place('tree', W * 0.9, hy, 0.8);
    } else {
      place('field', W * 0.12, hy, 1); place('house', W * 0.27, hy, 1); place('tree', W * 0.33, hy, 0.9);
      place('house', W * 0.39, hy - 4, 0.9); place('church', W * 0.61, hy, 1.1); place('house', W * 0.7, hy, 1);
      place('poplar', W * 0.76, hy, 1); place('house', W * 0.82, hy - 3, 0.85); place('field', W * 0.92, hy, 0.9);
    }
    // miejsca przy przystankach: świetlica i sieć (przyszłość) po drugiej stronie drogi niż karta
    stops.forEach((st) => {
      if (!st.place) return;
      const side = mobile ? null : (st.left ? 1 : -1);
      const x = mobile ? W - 70 : st.x + side * Math.min(200, W * 0.15);
      const y = mobile ? st.card.t - 16 : st.y + 40;
      if (st.place === 'swietlica') place('swietlica', x, y, mobile ? 0.7 : 1.15, 'deco-place');
      if (st.place === 'przyszlosc') place('network', x, y + (mobile ? -8 : 20), mobile ? 0.6 : 1.3, 'deco-place deco-future');
    });
    // reszta mapy: pola, drzewa, bocian, płoty – w wolnych miejscach (z dala od drogi i kart)
    const busy = (x, y, r) => {
      if (y < TOP + 10 || y > H - 40) return true;
      for (const st of stops) {
        const c = st.card;
        if (x > c.l - r - 20 && x < c.r + r + 20 && y > c.t - r - 30 && y < c.b + r + 30) return true;
      }
      for (const [, p] of samples) if (Math.abs(p.x - x) < r + 34 && Math.abs(p.y - y) < r + 34) return true;
      for (const g of decos) {
        const t = g.g.transform.baseVal.consolidate().matrix;
        if (Math.hypot(t.e - x, t.f - y) < r + 40) return true;
      }
      return false;
    };
    // Okolica jak na prawdziwej mapie: zagajniki, pasy pól, rzędy topoli, płoty, bociany.
    const groups = {
      grove(x, y, k) {          // 3–6 drzew w kępie
        const n = 3 + Math.floor(rnd() * 4), out = [];
        for (let i = 0; i < n; i++) {
          out.push(['tree', x + (rnd() - 0.5) * 70 * k, y + (rnd() - 0.5) * 34 * k, (0.75 + rnd() * 0.35) * k]);
        }
        return { r: 55 * k, items: out.sort((a, b) => a[2] - b[2] || a[1] - b[1]) };
      },
      fields(x, y, k) {         // 2–3 pola obok siebie
        const n = 2 + Math.floor(rnd() * 2), out = [];
        for (let i = 0; i < n; i++) out.push(['field', x + (i - (n - 1) / 2) * 104 * k, y + (i % 2) * 6 * k, k]);
        return { r: 60 * n * k, items: out };
      },
      poplars(x, y, k) {        // rząd topoli wzdłuż miedzy
        const out = [];
        for (let i = 0; i < 4; i++) out.push(['poplar', x + (i - 1.5) * 24 * k, y, k]);
        return { r: 60 * k, items: out };
      },
      farm(x, y, k) {           // zagroda: dom, płot, drzewo
        return { r: 60 * k, items: [['house', x, y, k], ['fence', x + 52 * k, y + 4 * k, 0.8 * k], ['tree', x - 34 * k, y + 2 * k, 0.9 * k]] };
      },
      stork(x, y, k) { return { r: 30 * k, items: [['stork', x, y, k]] }; },
      bush(x, y, k) { return { r: 25 * k, items: [['bush', x, y, k], ['bush', x + 22 * k, y + 5 * k, 0.7 * k]] }; },
    };
    const plan = ['grove', 'fields', 'grove', 'bush', 'fields', 'poplars', 'farm', 'grove', 'stork', 'fields', 'bush'];
    const tries = mobile ? 0 : Math.round((W * H) / 14000);
    let storks = 0;
    for (let i = 0; i < tries; i++) {
      const x = 40 + rnd() * (W - 80), y = TOP + 30 + rnd() * (H - TOP - 60);
      let kind = plan[Math.floor(rnd() * plan.length)];
      if (kind === 'stork' && storks >= 2) kind = 'grove';
      const k = 0.85 + rnd() * 0.35;
      const grp = groups[kind](x, y, k);
      if (busy(x, y, grp.r)) continue;
      if (kind === 'stork') storks++;
      grp.items.forEach(([kd, ix, iy, ik]) => place(kd, ix, iy, ik));
    }

    // węzły przystanków (jak kule z logo) + odgałęzienie do karty
    stops.forEach((st) => {
      const cardEdge = mobile ? st.card.l : (st.left ? st.card.r : st.card.l);
      el('path', { class: 'stop-branch', d: `M${st.x},${st.y} H${cardEdge}` });
      const g = el('g', { class: 'stop-node', transform: `translate(${st.x},${st.y})` });
      g.innerHTML = '<circle class="ring" r="15"/><circle class="ball" r="9"/>';
      let best = 0, bd = 1e9;
      for (const [l, p] of samples) { const dd = Math.hypot(p.x - st.x, p.y - st.y); if (dd < bd) { bd = dd; best = l; } }
      nodes.push({ g, len: best, stop: st.s });
    });

    // iskra na czubku drogi
    walker = el('g', { class: 'walker' });
    walker.innerHTML = '<circle r="11" class="walker-glow" filter="url(#spark-glow)"/><circle r="4.5" class="walker-core"/>';

    update();
  }

  // ── przewijanie: ile drogi już przeszliśmy ──
  function update() {
    if (!road) return;
    const jr = journey.getBoundingClientRect();
    const tipY = reduceMotion ? 1e9 : innerHeight * 0.62 - jr.top;   // czubek drogi na ~60% wysokości ekranu
    let len = 0;
    for (const [l, p] of samples) { if (p.y <= tipY) len = l; else break; }
    if (tipY >= samples[samples.length - 1][1].y) len = roadLen;
    const off = roadLen - len;
    road.style.strokeDashoffset = off;
    glowRoad.style.strokeDashoffset = off;
    const p = road.getPointAtLength(len);
    walker.setAttribute('transform', `translate(${p.x.toFixed(1)},${p.y.toFixed(1)})`);
    walker.classList.toggle('hidden', len <= 0 || len >= roadLen - 1);
    for (const n of nodes) {
      const on = len >= n.len - 2;
      n.g.classList.toggle('on', on);
      n.stop.classList.toggle('reached', on);
    }
    for (const dd of decos) dd.g.classList.toggle('on', reduceMotion || dd.y < tipY + 60);
  }

  let ticking = false;
  addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { ticking = false; update(); });
  }, { passive: true });

  let rt;
  const rebuild = () => { clearTimeout(rt); rt = setTimeout(build, 150); };
  addEventListener('resize', rebuild);
  if (window.ResizeObserver) new ResizeObserver(rebuild).observe(journey);
  if (document.fonts) document.fonts.ready.then(rebuild);
  build();
})();
