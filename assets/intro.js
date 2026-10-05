// Intro → hero („Złota iskra” z żywym tłem).
// Ostatnia klatka filmu to rozmyte tło (to samo co tło hero) z logo na środku.
// Gdy film się kończy:
//   1. logo staje dokładnie w miejscu logo z filmu, film znika (różnicy nie widać),
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

  // Położenie logo w ostatniej klatce filmu 1920x1080 (patrz tools/make_intro.sh).
  const FRAME = { w: 1920, h: 1080 };
  const END_LOGO = { w: 860, cy: 1080 * 0.47 };

  document.getElementById('year').textContent = new Date().getFullYear();

  // Nagłówek: każde słowo osobno, z kolejnym opóźnieniem.
  const title = document.querySelector('.hero-title');
  title.querySelectorAll('.w').forEach((w, i) => w.style.setProperty('--i', i));

  Sparks.init(document.getElementById('hero-sparks'), hero);

  function endLogoRect() {
    // Film jest wyświetlany jak object-fit: cover.
    const vw = innerWidth, vh = innerHeight;
    const s = Math.max(vw / FRAME.w, vh / FRAME.h);
    const w = END_LOGO.w * s;
    const h = w * (logo.naturalHeight / logo.naturalWidth || 218 / 580);
    return {
      left: (vw - w) / 2,
      top: (vh - FRAME.h * s) / 2 + END_LOGO.cy * s - h / 2,
      width: w,
    };
  }

  // Koniec przelotu: podmieniamy latające logo na logo w nagłówku.
  function landed() {
    logo.style.visibility = '';
    fly.hidden = true;
  }

  function playLive() {
    live.play().catch(() => {});
  }

  let finished = false;
  function finish(fromVideoEnd) {
    if (finished) return;
    finished = true;
    try { sessionStorage.setItem('szansa-intro-seen', '1'); } catch (e) {}
    scrollTo(0, 0);

    const to = logo.getBoundingClientRect();
    let from = { left: to.left, top: to.top, width: to.width };
    if (fromVideoEnd) {
      // Logo „leci” jako osobny obrazek, któremu zmieniamy rozmiar (a nie skalujemy),
      // więc przeglądarka w każdej klatce rysuje je w pełnej rozdzielczości – zostaje ostre.
      from = endLogoRect();
      fly.style.transition = 'none';
      Object.assign(fly.style, {
        left: from.left + 'px', top: from.top + 'px', width: from.width + 'px',
      });
      fly.hidden = false;
      logo.style.visibility = 'hidden';
      fly.getBoundingClientRect(); // wymuś zastosowanie stylu
      requestAnimationFrame(() => requestAnimationFrame(() => {
        const ease = '1.3s cubic-bezier(.65,0,.25,1) .35s';
        fly.style.transition = `left ${ease}, top ${ease}, width ${ease}`;
        Object.assign(fly.style, {
          left: to.left + 'px', top: to.top + 'px', width: to.width + 'px',
        });
      }));
      setTimeout(landed, 1750);
    }

    root.classList.add('intro-done');
    intro.classList.add('is-hidden');
    video.pause();
    playLive();
    Sparks.burst(from);

    setTimeout(() => { intro.hidden = true; }, 900);
  }

  function start() {
    finished = false;
    root.classList.remove('intro-done', 'no-intro');
    Sparks.clear();
    live.pause();
    intro.hidden = false;
    intro.classList.remove('is-hidden');
    landed();
    scrollTo(0, 0);
    video.preload = 'auto';
    video.currentTime = 0;
    video.play().catch(() => finish(false));
  }
  video.addEventListener('ended', () => finish(true));

  if (root.classList.contains('no-intro')) {
    intro.hidden = true;
    video.removeAttribute('autoplay');
    video.preload = 'none';
    root.classList.add('intro-done');
    playLive();
    Sparks.show();
  } else {
    // Błąd dopiero ostatniego źródła oznacza, że filmu nie da się odtworzyć.
    const sources = video.querySelectorAll('source');
    sources[sources.length - 1].addEventListener('error', () => finish(false));
    // Zablokowane autoodtwarzanie – od razu pokaż stronę.
    video.play().catch(() => finish(false));
    // Awaryjnie: jeśli film w ogóle nie ruszył (np. bardzo wolne łącze).
    setTimeout(() => { if (video.currentTime === 0) finish(false); }, 20000);
  }

  document.getElementById('intro-skip').addEventListener('click', () => finish(false));
  document.getElementById('intro-replay').addEventListener('click', start);
  soundBtn.addEventListener('click', () => {
    video.muted = !video.muted;
    soundBtn.setAttribute('aria-pressed', String(!video.muted));
    soundBtn.textContent = video.muted ? '🔈 Włącz dźwięk' : '🔇 Wycisz';
  });
})();
