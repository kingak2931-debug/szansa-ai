// „Złota iskra”: złote punkty odrywają się od sieci w logo i rozlatują po sekcji hero,
// gdzie tworzą delikatną, żywą konstelację (lekko dryfuje i odsuwa się od kursora).
window.Sparks = (function () {
  // Środki kul i gwiazdek sieci w logo przeskalowanym do 580 px szerokości
  // (kule wykrywa tools/make_logo_gold.py, gwiazdki odczytane z obrazu).
  const LOGO_W = 580;
  const LOGO_NODES = [
    [108, 58.8], [109.7, 18], [137.9, 42.8], [84.7, 33.7], [144.9, 77.1],
    [126.9, 96.8], [90.2, 90.2], [76.4, 66.5], [59.7, 24.4], [155.4, 17.4],
  ];
  const GOLD = '243,217,160';      // --gold-light
  const GOLD_DEEP = '200,149,63';  // --gold
  const FLIGHT = 1700;             // ms – lot iskry z logo na miejsce w konstelacji

  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let canvas, ctx, hero, W = 0, H = 0, dpr = 1;
  let nodes = [], running = false, visible = true, raf = 0, t0 = 0;
  const mouse = { x: -1e4, y: -1e4 };

  const ease = (p) => 1 - Math.pow(1 - p, 3);
  const rand = (a, b) => a + Math.random() * (b - a);

  function init(canvasEl, heroEl) {
    canvas = canvasEl; hero = heroEl; ctx = canvas.getContext('2d');
    resize();
    addEventListener('resize', resize);
    hero.addEventListener('pointermove', (e) => {
      const r = canvas.getBoundingClientRect();
      mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
    });
    hero.addEventListener('pointerleave', () => { mouse.x = mouse.y = -1e4; });
    new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible && running && !raf) raf = requestAnimationFrame(frame);
    }).observe(hero);
  }

  function resize() {
    const r = canvas.getBoundingClientRect();
    const oldW = W || r.width, oldH = H || r.height;
    dpr = Math.min(devicePixelRatio || 1, 2);
    W = r.width; H = r.height;
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    for (const n of nodes) { n.tx *= W / oldW; n.ty *= H / oldH; }
    if (!running) draw(performance.now());
  }

  // Miejsce w konstelacji: cały kadr, ale rzadziej w lewym dolnym rogu (tam jest tekst).
  function target() {
    for (let i = 0; i < 12; i++) {
      const x = rand(0.03, 0.97) * W, y = rand(0.1, 0.92) * H;
      const inText = x < W * 0.55 && y > H * 0.5;
      if (!inText || Math.random() < 0.25) return [x, y];
    }
    return [rand(0.55, 0.97) * W, rand(0.1, 0.6) * H];
  }

  function makeNode(fromX, fromY, delay, fromLogo) {
    const [tx, ty] = target();
    return {
      sx: fromX, sy: fromY, tx, ty, delay, fromLogo,
      r: fromLogo ? rand(2.2, 3.4) : rand(1.1, 2.4),
      phase: rand(0, Math.PI * 2), speed: rand(0.00025, 0.0006),
      ox: 0, oy: 0,
    };
  }

  // logoRect: położenie logo na ekranie (left, top, width) w chwili startu.
  function burst(logoRect) {
    nodes = [];
    const hr = canvas.getBoundingClientRect();
    const k = logoRect.width / LOGO_W;
    LOGO_NODES.forEach(([x, y], i) => {
      nodes.push(makeNode(logoRect.left - hr.left + x * k, logoRect.top - hr.top + y * k,
        150 + i * 45, true));
    });
    const extra = Math.max(14, Math.min(34, Math.round((W * H) / 42000)));
    for (let i = 0; i < extra; i++) nodes.push(makeNode(null, null, rand(700, 2600), false));
    start();
  }

  // Bez intro: konstelacja po prostu łagodnie się pojawia.
  function show() {
    nodes = [];
    const n = Math.max(20, Math.min(44, Math.round((W * H) / 36000)));
    for (let i = 0; i < n; i++) nodes.push(makeNode(null, null, rand(0, 900), i < 10));
    start();
  }

  function start() {
    t0 = performance.now();
    if (reduceMotion) { running = false; draw(t0 + 1e5); return; }
    running = true;
    if (!raf) raf = requestAnimationFrame(frame);
  }

  function clear() {
    running = false; nodes = [];
    if (raf) cancelAnimationFrame(raf); raf = 0;
    ctx && ctx.clearRect(0, 0, W, H);
  }

  function frame(now) {
    raf = 0;
    draw(now);
    if (running && visible) raf = requestAnimationFrame(frame);
  }

  function draw(now) {
    if (!ctx) return;
    const t = now - t0;
    ctx.clearRect(0, 0, W, H);
    const pts = [];

    for (const n of nodes) {
      const lt = t - n.delay;
      if (lt < 0) continue;
      // dryf + odsuwanie od kursora
      const dx = Math.sin(now * n.speed + n.phase) * 10;
      const dy = Math.cos(now * n.speed * 0.8 + n.phase) * 8;
      let x, y, a, trail = null;
      if (n.fromLogo && n.sx !== null) {
        const p = Math.min(1, lt / FLIGHT), e = ease(p);
        x = n.sx + (n.tx - n.sx) * e + dx * e;
        y = n.sy + (n.ty - n.sy) * e + dy * e;
        a = 1;
        if (p < 1) {
          const e2 = ease(Math.max(0, p - 0.12));
          trail = [n.sx + (n.tx - n.sx) * e2, n.sy + (n.ty - n.sy) * e2, 1 - p];
        }
      } else {
        x = n.tx + dx; y = n.ty + dy;
        a = Math.min(1, lt / 1200);
      }
      const mdx = x - mouse.x, mdy = y - mouse.y, md = Math.hypot(mdx, mdy);
      const push = md < 140 ? (1 - md / 140) * 26 : 0;
      n.ox += ((md ? mdx / md : 0) * push - n.ox) * 0.08;
      n.oy += ((md ? mdy / md : 0) * push - n.oy) * 0.08;
      x += n.ox; y += n.oy;
      const tw = 0.75 + 0.25 * Math.sin(now * 0.002 + n.phase * 3);
      pts.push({ x, y, a: a * tw, r: n.r, trail });
    }

    // połączenia – cienkie złote linie między bliskimi punktami
    const D = Math.max(130, Math.min(220, W / 7));
    ctx.lineWidth = 0.8;
    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        const p = pts[i], q = pts[j];
        const d = Math.hypot(p.x - q.x, p.y - q.y);
        if (d > D) continue;
        const al = (1 - d / D) * 0.32 * Math.min(p.a, q.a);
        ctx.strokeStyle = `rgba(${GOLD_DEEP},${al})`;
        ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
      }
    }

    // iskry
    for (const p of pts) {
      if (p.trail) {
        const [tx, ty, ta] = p.trail;
        const g = ctx.createLinearGradient(tx, ty, p.x, p.y);
        g.addColorStop(0, `rgba(${GOLD},0)`); g.addColorStop(1, `rgba(${GOLD},${0.7 * ta})`);
        ctx.strokeStyle = g; ctx.lineWidth = p.r * 1.2;
        ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(p.x, p.y); ctx.stroke();
      }
      const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 5);
      glow.addColorStop(0, `rgba(${GOLD},${0.55 * p.a})`);
      glow.addColorStop(1, `rgba(${GOLD},0)`);
      ctx.fillStyle = glow;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = `rgba(255,244,214,${p.a})`;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
    }
  }

  return { init, burst, show, clear };
})();
