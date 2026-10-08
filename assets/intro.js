// Intro → hero („Złota iskra” z żywym tłem).
// Logo (wektor) jest nad filmem przez całe intro: w rogu, potem wyjeżdża na środek.
// Gdy obraz jest już rozmyty (ostatnia klatka = tło hero), intro gaśnie i:
//   1. to samo logo zostaje na ekranie – nic się nie podmienia,
//   2. z sieci w logo wylatują złote iskry i tworzą konstelację (assets/sparks.js),
//   3. logo płynie do lewego górnego rogu,
//   4. rozmyte tło wyostrza się w żywą pętlę z dziećmi przy komputerach,
//   5. nagłówek pojawia się słowo po słowie, po „szansę” przechodzi złoty połysk.
(function () {
  const root = document.documentElement;
  const intro = document.getElementById('intro');
  const video = document.getElementById('intro-video');
  const logo = document.getElementById('brand-logo');
  const soundBtn = document.getElementById('intro-sound');
  const hero = document.querySelector('.hero');
  const live = document.getElementById('hero-live');
  const fly = document.getElementById('fly-logo');

  // Logo nie jest wtopione w film (tools/make_intro.sh) – rysujemy je tutaj, jako wektor nad filmem,
  // więc jest ostre i zawsze w całości na ekranie, niezależnie od proporcji ekranu.
  // Czasy w sekundach filmu: pojawienie się w rogu, przejazd na środek, koniec intro.
  const SHOW = [0.4, 0.8], MOVE = [10.2, 1.3];
  const END_AT = 12.4;  // od ~11,9 s film to już tylko nieruchome rozmyte tło – nie czekamy do 15 s
  const LOGO_RATIO = 948 / 2400;  // proporcje logo (tools/make_logo_gold.py)
  const shade = document.querySelector('.intro-shade');
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  document.getElementById('year').textContent = new Date().getFullYear();

  // Nagłówek: każde słowo osobno, z kolejnym opóźnieniem.
  const title = document.querySelector('.hero-title');
  title.querySelectorAll('.w').forEach((w, i) => w.style.setProperty('--i', i));

  Sparks.init(document.getElementById('hero-sparks'), hero);

  function cornerRect() {
    const vw = innerWidth, vh = innerHeight;
    return { left: clamp(vw * 0.025, 14, 40), top: clamp(vh * 0.03, 12, 32), width: clamp(vw * 0.2, 150, 360) };
  }
  function centerRect() {
    const vw = innerWidth, vh = innerHeight;
    const width = Math.min(vw * 0.84, Math.max(300, vw * 0.42), 880, vh * 0.9 / LOGO_RATIO);
    return { left: (vw - width) / 2, top: vh * 0.47 - width * LOGO_RATIO / 2, width };
  }
  function place(r) {
    fly.style.left = r.left.toFixed(1) + 'px';
    fly.style.top = r.top.toFixed(1) + 'px';
    fly.style.width = r.width.toFixed(1) + 'px';
  }

  // W trakcie intro: logo w rogu, potem przejazd na środek – zsynchronizowane z czasem filmu.
  // Strażnik: intro nigdy nie może zatrzymać strony. Jeśli film nie rusza (8 s), stoi w miejscu
  // (wolne łącze – 4 s bez postępu) albo trwa za długo (24 s), pokazujemy stronę od razu.
  const STALL_MS = 4000, NO_START_MS = 8000, MAX_MS = 24000;
  let raf = 0, liveStarted = false, t0 = 0, lastT = -1, lastMove = 0;
  function tick(now) {
    raf = 0;
    if (finished) return;
    const t = video.currentTime;
    if (!t0) { t0 = lastMove = now; }
    if (t !== lastT) { lastT = t; lastMove = now; }
    if (now - t0 > MAX_MS || (t === 0 && now - t0 > NO_START_MS) ||
        (t > 0 && !video.paused && now - lastMove > STALL_MS)) { finish(); return; }
    const p = clamp((t - MOVE[0]) / MOVE[1], 0, 1), e = p * p * (3 - 2 * p);
    const a = cornerRect(), b = centerRect();
    place({
      left: a.left + (b.left - a.left) * e,
      top: a.top + (b.top - a.top) * e,
      width: a.width + (b.width - a.width) * e,
    });
    fly.style.opacity = clamp((t - SHOW[0]) / SHOW[1], 0, 1).toFixed(3);
    if (shade) shade.style.opacity = (1 - e).toFixed(3);
    // żywe tło hero: pobieramy w połowie intro, rusza wcześniej (pod intro), żeby przejście się nie zacięło
    if (t > 5 && live.preload === 'none') warm(live);
    if (!liveStarted && t > 9) { liveStarted = true; playLive(); }
    if (t >= END_AT) { finish(); return; }
    raf = requestAnimationFrame(tick);
  }
  function startTicking() {
    t0 = 0; lastT = -1;
    fly.style.transition = 'none';
    fly.hidden = false;
    fly.classList.add('in-intro');
    if (!raf) raf = requestAnimationFrame(tick);
  }

  // Koniec przelotu: podmieniamy latające logo na logo w nagłówku.
  function landed() {
    logo.style.visibility = '';
    fly.hidden = true;
  }

  function playLive() {
    live.play().catch(() => {});
  }

  let finished = false, landTimer = 0;
  function finish() {
    if (finished) return;
    finished = true;
    if (raf) cancelAnimationFrame(raf); raf = 0;
    try { sessionStorage.setItem('szansa-intro-seen', '1'); } catch (e) {}
    scrollTo(0, 0);

    const to = logo.getBoundingClientRect();
    // Logo leci z miejsca, w którym właśnie jest (środek, róg albo w połowie drogi).
    const shown = !fly.hidden && parseFloat(fly.style.opacity || '0') > 0.05;
    let from = { left: to.left, top: to.top, width: to.width };
    if (shown) {
      const r = fly.getBoundingClientRect();
      from = { left: r.left, top: r.top, width: r.width };
      fly.style.opacity = '1';
      fly.classList.remove('in-intro');
      logo.style.visibility = 'hidden';
      // Zmieniamy rozmiar (a nie skalujemy), więc wektorowe logo jest ostre w każdej klatce.
      requestAnimationFrame(() => requestAnimationFrame(() => {
        const ease = '1.3s cubic-bezier(.65,0,.25,1) .35s';
        fly.style.transition = `left ${ease}, top ${ease}, width ${ease}`;
        place({ left: to.left, top: to.top, width: to.width });
      }));
      landTimer = setTimeout(landed, 1750);
    } else {
      landed();
    }

    root.classList.add('intro-done');
    intro.classList.add('is-hidden');
    // Wyciszone intro zatrzymujemy od razu; z dźwiękiem – muzyka wybrzmiewa do końca filmu.
    if (video.muted) video.pause();
    playLive();
    Sparks.burst(from);

    setTimeout(() => { intro.hidden = true; }, 900);
    loadRest();
  }

  function warm(v) {
    v.preload = 'auto';
    if (v.readyState === 0) v.load();
  }

  // Filmy dalszych sekcji (neuron w karcie partnerów) pobieramy dopiero po intro.
  let restLoaded = false;
  function loadRest() {
    if (restLoaded) return;
    restLoaded = true;
    setTimeout(() => {
      document.querySelectorAll('video.neuron').forEach(warm);
    }, 2500);
  }

  function start() {
    finished = false;
    clearTimeout(landTimer);
    root.classList.remove('intro-done', 'no-intro');
    Sparks.clear();
    live.pause();
    intro.hidden = false;
    intro.classList.remove('is-hidden');
    landed();
    scrollTo(0, 0);
    video.preload = 'auto';
    if (!video.getAttribute('src')) video.src = window.szansaIntroSrc();
    video.currentTime = 0;
    liveStarted = false;
    startTicking();
    video.play().catch(() => finish());
  }
  video.addEventListener('ended', () => { finish(); video.pause(); });

  if (root.classList.contains('no-intro')) {
    intro.hidden = true;
    video.removeAttribute('autoplay');
    video.preload = 'none';
    root.classList.add('intro-done');
    warm(live);
    playLive();
    Sparks.show();
    loadRest();
  } else {
    video.addEventListener('error', () => finish());
    startTicking();
    // Zablokowane autoodtwarzanie – od razu pokaż stronę.
    video.play().catch(() => finish());
  }

  document.getElementById('intro-skip').addEventListener('click', () => finish());
  document.getElementById('intro-replay').addEventListener('click', start);
  soundBtn.addEventListener('click', () => {
    video.muted = !video.muted;
    soundBtn.setAttribute('aria-pressed', String(!video.muted));
    soundBtn.textContent = video.muted ? '🔈 Włącz dźwięk' : '🔇 Wycisz';
  });
})();
