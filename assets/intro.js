// Intro → hero.
// Ostatnia klatka filmu to rozmyte tło (to samo co tło hero) z logo na środku.
// Gdy film się kończy, ustawiamy logo z nagłówka dokładnie w miejscu logo z filmu,
// chowamy film (różnicy nie widać), a potem logo płynie do lewego górnego rogu.
(function () {
  const root = document.documentElement;
  const intro = document.getElementById('intro');
  const video = document.getElementById('intro-video');
  const logo = document.getElementById('brand-logo');
  const soundBtn = document.getElementById('intro-sound');

  // Położenie logo w ostatniej klatce filmu 1920x1080 (patrz tools/make_intro.sh).
  const FRAME = { w: 1920, h: 1080 };
  const END_LOGO = { w: 860, cy: 1080 * 0.47 };

  document.getElementById('year').textContent = new Date().getFullYear();

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

  let finished = false;
  function finish(animateLogo) {
    if (finished) return;
    finished = true;
    try { sessionStorage.setItem('szansa-intro-seen', '1'); } catch (e) {}
    scrollTo(0, 0);

    if (animateLogo) {
      // FLIP: logo startuje z pozycji z filmu i płynie na swoje miejsce.
      const to = logo.getBoundingClientRect();
      const from = endLogoRect();
      const k = from.width / to.width;
      logo.style.transition = 'none';
      logo.style.transformOrigin = '0 0';
      logo.style.transform =
        `translate(${from.left - to.left}px, ${from.top - to.top}px) scale(${k})`;
      logo.getBoundingClientRect(); // wymuś zastosowanie stylu
    }

    root.classList.add('intro-done');
    intro.classList.add('is-hidden');
    video.pause();

    requestAnimationFrame(() => requestAnimationFrame(() => {
      logo.style.transition = 'transform 1.3s cubic-bezier(.65,0,.25,1) .35s';
      logo.style.transform = '';
    }));
    setTimeout(() => { intro.hidden = true; }, 900);
  }

  function start() {
    finished = false;
    root.classList.remove('intro-done', 'no-intro');
    intro.hidden = false;
    intro.classList.remove('is-hidden');
    logo.style.transition = 'none';
    logo.style.transform = '';
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
