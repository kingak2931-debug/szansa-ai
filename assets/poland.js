// „Droga przez Polskę” – tło sekcji pod hero.
// Prawdziwa mapa (kontur, województwa, rzeki, jeziora, drogi, miejscowości do 20 tys. mieszkańców)
// i prawdziwa trasa po drogach: z Ełganowa (siedziba fundacji) przez kolejne regiony aż do Karkonoszy.
// Dane: assets/poland-map.json (tools/make_poland_map.py). Mapa jest przypięta do ekranu,
// a przewijanie prowadzi iskrę po trasie; kamera podąża za nią jak w nawigacji:
//   start – zbliżenie na wieś (kościół z zegarem na 16:00, jak w intro),
//   przystanki – widok regionu, „Skala misji” i meta – cała Polska, zapalają się wszystkie miejscowości.
// Sekcje (.stop) to przystanki: dostają klasę .reached, gdy iskra do nich dojedzie.
(function () {
  const journey = document.querySelector('.journey');
  const canvas = journey && journey.querySelector('.poland-map');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const stopsEl = [...journey.querySelectorAll('.stop:not(.stop-partners)')];
  const partners = journey.querySelector('.stop-partners');      // karta o partnerach – tu Polska się chowa
  const finale = document.querySelector('.finale');               // pełnoekranowe „Zgłoś szkołę”

  // sieć z logo (środek = duża kula); współrzędne jak w logo, skalowane do ekranu
  const NET = [[0, 0, 9.6], [2.2, -30.8, 5.7], [-19.5, -18.9, 4.4], [-26.5, 6.8, 4], [23.2, -12, 4.9],
    [27.6, 13.6, 4.1], [-17.1, 26.4, 5.3], [13, 29.9, 3.8]];
  const NET_E = [[0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [0, 6], [0, 7], [2, 3], [4, 5], [6, 7]];
  // węzły partnerów dołączające do sieci: [x, y, do której kuli, podpis]
  const PARTNERS = [[46, -40, 4, ''], [-50, 40, 6, ''], [40, 46, 5, 'Miejsce dla Twojej firmy']];
  let sTop = 0, net = { x: 0, y: 0, k: 1 };

  let D = null, W = 0, H = 0, dpr = 1, mobile = false;
  let keys = [], center = [0, 0], fullZoom = 1;
  let lastLen = -1, animUntil = 0, raf = 0;
  const litAt = new Map();            // miejscowość → czas zapalenia (do płynnego rozbłysku)
  let allLitAt = 0;                   // „Skala misji”: zapalają się wszystkie

  // wieś z intro (kreska), współrzędne w metrach względem punktu startu
  const VILLAGE = [
    // kościół z zegarem na 16:00
    'M-30,0 V-46 L-18,-70 L-6,-46 V0 Z', 'M-18,-70 V-80 M-22,-76 H-14',
    'M-18,-43 m-7,0 a7,7 0 1,0 14,0 a7,7 0 1,0 -14,0', 'M-18,-43 V-49 M-18,-43 L-12.8,-40',
    'M-6,0 V-24 L22,-24 L22,0 Z M-6,-24 L8,-36 L22,-24',
    // domy
    'M40,0 V-17 L55,-30 L70,-17 V0 Z M51,0 V-10 H59 V0', 'M-80,0 V-15 L-67,-26 L-54,-15 V0 Z M-71,0 V-8 H-63 V0',
    'M90,4 V-12 L102,-22 L114,-12 V4 Z',
    // drzewa
    'M-100,0 V-14 M-100,-24 m-11,0 a11,11 0 1,0 22,0 a11,11 0 1,0 -22,0',
    'M130,2 V-10 M130,-10 C122,-18 123,-40 130,-52 C137,-40 138,-18 130,-10 Z',
  ].map((d) => new Path2D(d));

  fetch('assets/poland-map.json').then((r) => r.json()).then((data) => {
    D = data;
    const [x0, y0, x1, y1] = D.bounds;
    center = [(x0 + x1) / 2, (y0 + y1) / 2];
    D.places.forEach((p, i) => {
      p.r = 1.1 + Math.sqrt(p[2]) * 0.55;
      // dokąd leci iskra tej miejscowości przy „splocie”: do jednej z kul sieci
      p.t = i % NET.length; p.ang = Math.random() * 6.283; p.rad = Math.random() * 0.8; p.del = Math.random() * 0.35;
    });
    layout();
    addEventListener('scroll', schedule, { passive: true });
    addEventListener('resize', () => { layout(); schedule(); });
    if (window.ResizeObserver) new ResizeObserver(() => { layout(); schedule(); }).observe(journey);
  }).catch(() => journey.classList.add('no-map'));

  function layout() {
    if (!D) return;
    const r = canvas.getBoundingClientRect();
    dpr = Math.min(devicePixelRatio || 1, mobile ? 1.5 : 2);
    W = r.width; H = r.height; mobile = W < 760;
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    const [x0, y0, x1, y1] = D.bounds;
    fullZoom = Math.min(W / (x1 - x0), H / (y1 - y0)) * 0.86;
    const region = H / (mobile ? 360 : 420);
    const village = H / 1.4;
    // klucze: [pozycja przewinięcia (środek ekranu), km trasy, zoom, strona karty (-1 lewa / 1 prawa)]
    const jTop = journey.getBoundingClientRect().top + scrollY;
    // wieś trzymamy, aż mapa przypnie się do ekranu (środek ekranu = góra sekcji + pół ekranu), potem oddalenie
    keys = [[jTop + H * 0.5, 0, village, 0], [jTop + H * 0.8, 0, village * 0.55, 0], [jTop + H * 1.05, 0, region * 2.2, 0]];
    stopsEl.forEach((el, i) => {
      const s = D.stops[i + 1];
      if (!s) return;
      const c = el.querySelector('.stop-card').getBoundingClientRect();
      const y = c.top + scrollY + Math.min(c.height / 2, 160);
      const wide = el.id === 'skala' || el.classList.contains('stop-final');
      keys.push([y, s.at, wide ? fullZoom : region, el.dataset.side === 'right' ? 1 : -1]);
      s.el = el;
    });
    // przed kartą o partnerach: cała trasa przejechana, widok całej Polski
    if (partners) {
      sTop = partners.getBoundingClientRect().top + scrollY;
      keys.push([sTop - H * 0.2, D.routeLen[D.routeLen.length - 1], fullZoom, 0]);
    }
    net = mobile ? { x: W * 0.5, y: H * 0.22, k: Math.min(W, H) / 160 } : { x: W * 0.7, y: H * 0.47, k: Math.min(W, H) / 132 };
  }

  const lerp = (a, b, t) => a + (b - a) * t;
  const smooth = (t) => t * t * (3 - 2 * t);

  // stan dla danej pozycji przewinięcia
  function stateAt(scrollMid) {
    if (reduceMotion) return { len: D.routeLen[D.routeLen.length - 1], zoom: fullZoom, side: 0 };
    if (scrollMid <= keys[0][0]) return { len: 0, zoom: keys[0][2], side: 0 };
    for (let i = 0; i < keys.length - 1; i++) {
      const a = keys[i], b = keys[i + 1];
      if (scrollMid <= b[0]) {
        const t = smooth((scrollMid - a[0]) / Math.max(1, b[0] - a[0]));
        return { len: lerp(a[1], b[1], t), zoom: Math.exp(lerp(Math.log(a[2]), Math.log(b[2]), t)), side: lerp(a[3], b[3], t) };
      }
    }
    const k = keys[keys.length - 1];
    return { len: D.routeLen[D.routeLen.length - 1], zoom: k[2], side: 0 };
  }

  function pointAt(len) {
    const R = D.route, L = D.routeLen;
    let lo = 0, hi = L.length - 1;
    while (hi - lo > 1) { const m = (lo + hi) >> 1; if (L[m] <= len) lo = m; else hi = m; }
    const t = L[hi] > L[lo] ? (len - L[lo]) / (L[hi] - L[lo]) : 0;
    return [lerp(R[lo][0], R[hi][0], Math.max(0, Math.min(1, t))), lerp(R[lo][1], R[hi][1], Math.max(0, Math.min(1, t))), lo];
  }

  function schedule() {
    if (!raf) raf = requestAnimationFrame(draw);
  }

  function draw(now) {
    raf = 0;
    if (!D || !W) return;
    const st = stateAt(scrollY + innerHeight / 2);
    const [sx, sy, idx] = pointAt(st.len);
    // kamera: iskra po przeciwnej stronie niż karta; przy pełnym widoku – środek Polski
    const f = Math.max(0, Math.min(1, (Math.log(H / 420) - Math.log(st.zoom)) / (Math.log(H / 420) - Math.log(fullZoom) || 1)));
    const z = st.zoom;
    const cx = lerp(sx, center[0], f), cy = lerp(sy, center[1], f);
    const screenX = mobile ? W * 0.5 : W * (0.5 - st.side * 0.22 * (1 - f));
    const ox = screenX - cx * z, oy = H * 0.5 - cy * z;
    const X = (x) => x * z + ox, Y = (y) => y * z + oy;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    ctx.lineJoin = ctx.lineCap = 'round';

    // „splot”: gdy wjeżdża karta o partnerach, Polska gaśnie, a iskry miejscowości lecą do sieci z logo
    const clamp = (v) => Math.max(0, Math.min(1, v));
    const c = partners && !reduceMotion ? clamp((scrollY - (sTop - H)) / (H * 0.9)) : (partners && reduceMotion && scrollY > sTop - H * 0.5 ? 1 : 0);
    const mapA = clamp(1 - c * 1.7);
    ctx.globalAlpha = mapA;

    const line = (pts, close) => {
      ctx.beginPath();
      for (let i = 0; i < pts.length; i++) {
        const p = pts[i];
        if (i) ctx.lineTo(X(p[0]), Y(p[1])); else ctx.moveTo(X(p[0]), Y(p[1]));
      }
      if (close) ctx.closePath();
    };

    // kontur Polski z delikatnym wypełnieniem
    line(D.outline, true);
    ctx.fillStyle = 'rgba(255,252,243,.55)'; ctx.fill();
    // jeziora
    ctx.fillStyle = 'rgba(150,182,180,.35)';
    D.lakes.forEach((l) => { line(l, true); ctx.fill(); });
    // województwa
    ctx.setLineDash([4, 5]); ctx.lineWidth = 1; ctx.strokeStyle = 'rgba(184,135,62,.28)';
    D.voiv.forEach((l) => { line(l); ctx.stroke(); });
    ctx.setLineDash([]);
    // drogi
    if (!(mobile && f > 0.5)) {
      ctx.lineWidth = 0.8; ctx.strokeStyle = 'rgba(184,135,62,.22)';
      D.roads.forEach((l) => { line(l); ctx.stroke(); });
    }
    // rzeki
    ctx.lineWidth = 1.2; ctx.strokeStyle = 'rgba(110,145,150,.5)';
    D.rivers.forEach((l) => { line(l); ctx.stroke(); });
    // kontur
    line(D.outline, true); ctx.lineWidth = 1.8; ctx.strokeStyle = 'rgba(168,118,49,.85)'; ctx.stroke();
    ctx.globalAlpha = 1;

    // miejscowości do 20 tys.: zapalają się, gdy mija je iskra (albo wszystkie przy „Skali misji”)
    const skala = D.stops.find((s) => s.el && s.el.id === 'skala');
    if (skala && st.len >= skala.at - 0.5 && !allLitAt) allLitAt = now;
    if (skala && st.len < skala.at - 0.5) allLitAt = 0;
    let animating = false;
    const dotScale = Math.max(0.55, Math.min(1.6, z / (H / 420)));
    for (const p of D.places) {
      let px = X(p[0]), py = Y(p[1]);
      if (c > 0) {
        const cc = smooth(clamp((c - p.del) / 0.6));
        if (cc >= 1) continue;                        // już wtopiona w kulę
        const n = NET[p.t];
        const tx = net.x + n[0] * net.k + Math.cos(p.ang) * n[2] * net.k * p.rad;
        const ty = net.y + n[1] * net.k + Math.sin(p.ang) * n[2] * net.k * p.rad;
        px = lerp(px, tx, cc); py = lerp(py, ty, cc);
      }
      if (px < -10 || py < -10 || px > W + 10 || py > H + 10) continue;
      let lit = 0;
      const nearRoute = p[3] >= 0 && st.len >= p[3];
      if (nearRoute) {
        if (!litAt.has(p)) litAt.set(p, now);
        lit = Math.min(1, (now - litAt.get(p)) / 700);
      } else litAt.delete(p);
      if (allLitAt) lit = Math.max(lit, Math.min(1, (now - allLitAt - (p[0] - D.bounds[0]) * 1.2) / 700));
      if (lit < 1 && (nearRoute || allLitAt)) animating = true;
      const r = p.r * dotScale;
      if (lit > 0) {
        ctx.fillStyle = `rgba(243,205,114,${0.28 * lit})`;
        ctx.beginPath(); ctx.arc(px, py, r * 2.6, 0, 7); ctx.fill();
      }
      ctx.fillStyle = lit > 0 ? `rgba(${lerp(184, 214, lit)},${lerp(135, 150, lit)},${lerp(62, 50, lit)},${0.45 + 0.55 * lit})` : 'rgba(184,135,62,.35)';
      ctx.beginPath(); ctx.arc(px, py, lit > 0 ? r : r * 0.8, 0, 7); ctx.fill();
    }

    ctx.globalAlpha = mapA;
    // wieś z intro przy starcie – widoczna tylko z bliska
    const villageAlpha = Math.max(0, Math.min(1, (Math.log(z) - Math.log(H / 40)) / (Math.log(H / 1.4) - Math.log(H / 40))));
    if (villageAlpha > 0.01) {
      const s0 = D.stops[0];
      const k = z / 1000 * 2.2;          // „metry” rysunku → piksele (wieś ma ok. 0,5 km)
      ctx.save();
      ctx.translate(X(s0.x), Y(s0.y) + 4);
      ctx.scale(k, k);
      ctx.globalAlpha = villageAlpha * mapA;
      ctx.lineWidth = 1.5 / k; ctx.strokeStyle = '#a87631';
      VILLAGE.forEach((p) => ctx.stroke(p));
      ctx.restore();
    }

    // trasa: cała – kropkami, przejechana – złotem z poświatą
    line(D.route); ctx.setLineDash([1, 7]); ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(138,90,28,.45)'; ctx.stroke(); ctx.setLineDash([]);
    if (st.len > 0) {
      ctx.beginPath();
      ctx.moveTo(X(D.route[0][0]), Y(D.route[0][1]));
      for (let i = 1; i <= idx; i++) ctx.lineTo(X(D.route[i][0]), Y(D.route[i][1]));
      ctx.lineTo(X(sx), Y(sy));
      ctx.lineWidth = 9; ctx.strokeStyle = 'rgba(226,182,92,.25)'; ctx.stroke();
      ctx.lineWidth = 3.2; ctx.strokeStyle = '#c8953f'; ctx.stroke();
    }

    // przystanki: kule jak w logo + nazwa miejscowości
    ctx.font = `italic ${mobile ? 12 : 14}px Georgia, serif`;
    D.stops.forEach((s, i) => {
      const px = X(s.x), py = Y(s.y), on = st.len >= s.at - 0.5;
      const g = ctx.createRadialGradient(px - 2, py - 2, 0, px, py, 7);
      g.addColorStop(0, '#fff8de'); g.addColorStop(0.3, '#f5cd72'); g.addColorStop(0.75, '#cf922f'); g.addColorStop(1, '#94601a');
      ctx.beginPath(); ctx.arc(px, py, on ? 7 : 5, 0, 7);
      ctx.fillStyle = on ? g : 'rgba(251,246,236,.9)'; ctx.fill();
      ctx.lineWidth = 1.4; ctx.strokeStyle = '#a87631'; ctx.stroke();
      if (f < 0.6 || i === 0) {
        ctx.globalAlpha = (i === 0 ? Math.max(0.6, 1 - f) : 1 - f / 0.6) * mapA;
        const label = i === 0 ? `${s.name} · siedziba fundacji` : s.name;
        // przy zbliżeniu na wieś napis pod rysunkiem, dalej – obok kuli
        const under = i === 0 && villageAlpha > 0.3;
        const lx = under ? px - ctx.measureText(label).width / 2 : px + 11, ly = under ? py + 30 : py - 9;
        ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(251,246,236,.9)'; ctx.strokeText(label, lx, ly);
        ctx.fillStyle = '#7a4e17'; ctx.fillText(label, lx, ly);
        ctx.globalAlpha = mapA;
      }
      if (s.el) {
        s.el.classList.toggle('reached', on);
        if (on && !s.el.dataset.counted) { s.el.dataset.counted = '1'; countUp(s.el); }
      }
    });

    // iskra
    if (st.len > 0 && st.len < D.routeLen[D.routeLen.length - 1] - 0.5) {
      const g = ctx.createRadialGradient(X(sx), Y(sy), 0, X(sx), Y(sy), 16);
      g.addColorStop(0, 'rgba(255,246,220,1)'); g.addColorStop(0.35, 'rgba(243,217,160,.8)'); g.addColorStop(1, 'rgba(243,217,160,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(X(sx), Y(sy), 16, 0, 7); ctx.fill();
    }
    ctx.globalAlpha = 1;

    // sieć z logo, która powstaje ze „splotu”, i węzły partnerów
    if (c > 0.45) animating = drawNetwork(clamp((c - 0.45) / 0.55), now) || animating;
    if (partners) partners.classList.toggle('reached', c > 0.5);
    updateFinale();

    if (st.len !== lastLen) { lastLen = st.len; animUntil = now + 900; }
    if (animating || now < animUntil) schedule();
  }

  function sphere(x, y, r, a) {
    const g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.35, 0, x, y, r);
    g.addColorStop(0, '#fff8de'); g.addColorStop(0.28, '#f5cd72'); g.addColorStop(0.72, '#cf922f'); g.addColorStop(1, '#94601a');
    ctx.globalAlpha = a * 0.35; ctx.fillStyle = '#f3cd72';
    ctx.beginPath(); ctx.arc(x, y, r * 2, 0, 7); ctx.fill();
    ctx.globalAlpha = a; ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill();
  }

  function drawNetwork(a, now) {
    const { x, y, k } = net;
    const P = NET.map(([nx, ny, r]) => [x + nx * k, y + ny * k, r * k]);
    // linie rysują się od środka
    ctx.lineWidth = Math.max(1.5, k * 0.45); ctx.strokeStyle = '#d6b176';
    NET_E.forEach(([i, j]) => {
      ctx.globalAlpha = a;
      ctx.beginPath(); ctx.moveTo(P[i][0], P[i][1]);
      ctx.lineTo(lerp(P[i][0], P[j][0], a), lerp(P[i][1], P[j][1], a)); ctx.stroke();
    });
    P.forEach(([px, py, r]) => sphere(px, py, r * (0.6 + 0.4 * a), a));
    // partnerzy dołączają przy dalszym przewijaniu (gdy karta o partnerach jest na ekranie)
    const pp = Math.max(0, Math.min(1, (scrollY - (sTop - H * 0.15)) / (H * 0.55)));
    let pulsing = false;
    PARTNERS.forEach(([nx, ny, to, label], i) => {
      const t = Math.max(0, Math.min(1, (pp - i / 3) * 3)) * a;
      if (t <= 0) return;
      const px = x + nx * k, py = y + ny * k, [fx, fy] = P[to];
      ctx.globalAlpha = t; ctx.setLineDash([3, 5]); ctx.lineWidth = 1.5; ctx.strokeStyle = '#c8953f';
      ctx.beginPath(); ctx.moveTo(fx, fy); ctx.lineTo(lerp(fx, px, t), lerp(fy, py, t)); ctx.stroke(); ctx.setLineDash([]);
      const r = 4.2 * k;
      if (label) {
        // pusty, pulsujący węzeł czeka na partnera
        const pulse = 0.5 + 0.5 * Math.sin(now / 420);
        ctx.globalAlpha = t * (0.35 + 0.4 * pulse); ctx.strokeStyle = '#e2b65c'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(px, py, r * (1.25 + 0.35 * pulse), 0, 7); ctx.stroke();
        ctx.globalAlpha = t; ctx.fillStyle = 'rgba(251,246,236,.9)'; ctx.strokeStyle = '#c8953f'; ctx.setLineDash([3, 3]);
        ctx.beginPath(); ctx.arc(px, py, r, 0, 7); ctx.fill(); ctx.stroke(); ctx.setLineDash([]);
        ctx.font = `italic ${mobile ? 13 : 16}px Georgia, serif`; ctx.fillStyle = '#7a4e17';
        const w = ctx.measureText(label).width;
        ctx.fillText(label, Math.min(W - w - 12, px - w / 2), py + r + 22);
        pulsing = true;
      } else sphere(px, py, r * 0.85, t);
    });
    ctx.globalAlpha = 1;
    return pulsing && scrollY < sTop + H * 2;   // pulsujemy tylko, gdy sieć jest jeszcze widoczna
  }

  // pełnoekranowe „Zgłoś szkołę”: złote światło rozszerza się ze środkowej kuli sieci
  function updateFinale() {
    if (!finale) return;
    const r = finale.getBoundingClientRect();
    const k = reduceMotion ? 1 : Math.max(0, Math.min(1, -r.top / (H * 0.85)));
    const e = k * k * (3 - 2 * k);
    finale.style.setProperty('--ix', `${net.x}px`);
    finale.style.setProperty('--iy', `${net.y}px`);
    finale.style.setProperty('--iris', `${(e * Math.hypot(W, H) * 1.05).toFixed(1)}px`);
    finale.classList.toggle('open', k > 0.65);
  }

  // liczniki („Skala misji”) zliczają się od zera, gdy iskra dojedzie do przystanku
  function countUp(stop) {
    stop.querySelectorAll('[data-count]').forEach((elm) => {
      const target = +elm.dataset.count, suffix = elm.dataset.suffix || '';
      const fmt = (v) => Math.round(v).toLocaleString('pl-PL') + suffix;
      if (reduceMotion) { elm.textContent = fmt(target); return; }
      const t0 = performance.now(), dur = 1600;
      const step = (now) => {
        const p = Math.min(1, (now - t0) / dur);
        elm.textContent = fmt(target * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
  }
  if (!reduceMotion) journey.querySelectorAll('[data-count]').forEach((e) => { e.textContent = '0' + (e.dataset.suffix || ''); });
})();
