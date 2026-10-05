// Zgoda na pliki cookies (RODO / Prawo telekomunikacyjne).
// Strona w obecnej wersji nie używa cookies analitycznych ani marketingowych – baner zbiera
// zgodę z góry, żeby można je było dodać bez zmian w wyglądzie. Kod, który ich potrzebuje,
// sprawdza zgodę: SzansaConsent.get().analytics / .marketing, albo czeka na zdarzenie
// 'szansa:consent' (document). Wybór trzymamy w localStorage przez 12 miesięcy;
// link „Ustawienia cookies” (data-cookie-settings) otwiera baner ponownie.
window.SzansaConsent = (function () {
  const KEY = 'szansa-cookies';
  const VERSION = 1;
  const MAX_AGE = 365 * 24 * 3600 * 1000;
  let box = null;

  function read() {
    try {
      const c = JSON.parse(localStorage.getItem(KEY) || 'null');
      if (c && c.v === VERSION && Date.now() - c.date < MAX_AGE) return c;
    } catch (e) {}
    return null;
  }

  function save(analytics, marketing) {
    const c = { v: VERSION, necessary: true, analytics, marketing, date: Date.now() };
    try { localStorage.setItem(KEY, JSON.stringify(c)); } catch (e) {}
    document.dispatchEvent(new CustomEvent('szansa:consent', { detail: c }));
    hide();
  }

  function build() {
    box = document.createElement('section');
    box.className = 'cookies';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-labelledby', 'cookies-title');
    box.innerHTML = `
      <h2 id="cookies-title">Szanujemy Twoją prywatność</h2>
      <p>Używamy tylko niezbędnych mechanizmów, żeby strona działała. Za Twoją zgodą możemy
        w przyszłości korzystać z plików cookies analitycznych (statystyki odwiedzin) i marketingowych.
        Zgodę możesz w każdej chwili zmienić. Szczegóły: <a href="polityka-prywatnosci.html#cookies">polityka prywatności</a>.</p>
      <div class="cookies-prefs" hidden>
        <label><input type="checkbox" checked disabled> Niezbędne <small>– zawsze włączone</small></label>
        <label><input type="checkbox" data-c="analytics"> Analityczne <small>– anonimowe statystyki odwiedzin</small></label>
        <label><input type="checkbox" data-c="marketing"> Marketingowe <small>– treści dopasowane do zainteresowań</small></label>
      </div>
      <div class="cookies-actions">
        <button type="button" class="btn btn-gold btn-small" data-act="all">Akceptuję wszystkie</button>
        <button type="button" class="btn btn-ghost btn-small" data-act="necessary">Tylko niezbędne</button>
        <button type="button" class="btn btn-ghost btn-small" data-act="prefs">Ustawienia</button>
        <button type="button" class="btn btn-ghost btn-small" data-act="save" hidden>Zapisz wybór</button>
      </div>`;
    const prefs = box.querySelector('.cookies-prefs');
    const toggle = (show) => {
      prefs.hidden = !show;
      box.querySelector('[data-act="prefs"]').hidden = show;
      box.querySelector('[data-act="save"]').hidden = !show;
    };
    box.addEventListener('click', (e) => {
      const act = e.target.dataset && e.target.dataset.act;
      if (act === 'all') save(true, true);
      else if (act === 'necessary') save(false, false);
      else if (act === 'prefs') toggle(true);
      else if (act === 'save') save(box.querySelector('[data-c="analytics"]').checked,
        box.querySelector('[data-c="marketing"]').checked);
    });
    box._toggle = toggle;
    document.body.appendChild(box);
  }

  function show(withPrefs) {
    if (!box) build();
    const c = read();
    box.querySelector('[data-c="analytics"]').checked = !!(c && c.analytics);
    box.querySelector('[data-c="marketing"]').checked = !!(c && c.marketing);
    box._toggle(!!withPrefs);
    box.hidden = false;
    requestAnimationFrame(() => requestAnimationFrame(() => box.classList.add('is-open')));
  }

  function hide() {
    if (!box) return;
    box.classList.remove('is-open');
    setTimeout(() => { box.hidden = true; }, 400);
  }

  document.addEventListener('click', (e) => {
    const link = e.target.closest && e.target.closest('[data-cookie-settings]');
    if (link) { e.preventDefault(); show(true); }
  });

  // Na stronie głównej baner czeka, aż skończy się intro i pokaże się nagłówek hero –
  // nie zasłania filmu ani przejścia.
  if (!read()) {
    const root = document.documentElement;
    const later = () => setTimeout(() => show(false), 2600);
    if (!document.getElementById('intro') || root.classList.contains('intro-done')) later();
    else {
      const mo = new MutationObserver(() => {
        if (root.classList.contains('intro-done')) { mo.disconnect(); later(); }
      });
      mo.observe(root, { attributes: true, attributeFilter: ['class'] });
    }
  }

  return { get: () => read() || { necessary: true, analytics: false, marketing: false }, open: () => show(true) };
})();
