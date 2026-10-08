// Formularze w oknach nad stroną: „Porozmawiajmy o partnerstwie” / „Zostań partnerem”
// (#partner-dialog) i „Zgłoś szkołę” (#school-dialog). Otwiera je każdy przycisk
// z atrybutem data-open-form="id-okna" (bez JS zostaje zwykły link mailto).
//
// Strona jest statyczna (bez własnego serwera), więc wiadomość wysyła usługa FormSubmit
// (formsubmit.co) prosto na kontakt@szansaai.pl. Przy pierwszym zgłoszeniu FormSubmit wysyła
// na ten adres e-mail z linkiem aktywacyjnym – trzeba go raz kliknąć. Dopóki formularz nie jest
// aktywny albo gdy usługa nie odpowiada, nic nie ginie: otwieramy program pocztowy
// z gotową, wypełnioną wiadomością.
//
// Pola wysyłamy pod etykietami z atrybutu data-label; temat to data-subject okna
// + wartość pola wskazanego w data-subject-field (np. nazwa firmy albo szkoły).
(function () {
  const TO = 'kontakt@szansaai.pl';
  const ENDPOINT = 'https://formsubmit.co/ajax/' + TO;
  const root = document.documentElement;
  if (typeof HTMLDialogElement !== 'function') return; // stare przeglądarki: zostają linki mailto

  function open(dialog) {
    dialog.classList.remove('is-sent');
    dialog.querySelector('.form-status').textContent = '';
    dialog.showModal();
    root.classList.add('modal-open');
    requestAnimationFrame(() => dialog.classList.add('is-open'));
    setTimeout(() => dialog.querySelector('input').focus(), 50);
  }
  function close(dialog) {
    dialog.classList.remove('is-open');
    setTimeout(() => dialog.close(), 250);
  }

  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-open-form]');
    const dialog = btn && document.getElementById(btn.dataset.openForm);
    if (dialog) { e.preventDefault(); open(dialog); }
  });

  document.querySelectorAll('dialog.form-dialog').forEach((dialog) => {
    const form = dialog.querySelector('form');
    const status = dialog.querySelector('.form-status');
    const submit = form.querySelector('[type="submit"]');

    dialog.addEventListener('close', () => root.classList.remove('modal-open'));
    dialog.addEventListener('cancel', (e) => { e.preventDefault(); close(dialog); });
    dialog.addEventListener('click', (e) => {
      if (e.target === dialog || e.target.closest('[data-close]')) close(dialog); // klik w tło lub „×”
    });

    // [etykieta, wartość] dla wszystkich opisanych pól
    function fields() {
      return [...form.elements]
        .filter((el) => el.dataset.label)
        .map((el) => [el.dataset.label, el.value.trim()]);
    }
    function subject() {
      const key = form.elements[dialog.dataset.subjectField];
      const who = (key && key.value.trim()) || form.elements.name.value.trim();
      return `${dialog.dataset.subject} – ${who}`;
    }
    function mailtoFallback() {
      const body = fields().map(([k, v]) => `${k}: ${v || '—'}`).join('\n');
      location.href = `mailto:${TO}?subject=${encodeURIComponent(subject())}&body=${encodeURIComponent(body)}`;
    }

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!form.reportValidity()) return;
      if (form.elements._honey.value) return; // pułapka na boty
      submit.disabled = true;
      status.textContent = 'Wysyłamy…';
      try {
        const payload = { _subject: subject(), _template: 'table', _captcha: 'false', email: form.elements.email.value.trim() };
        for (const [k, v] of fields()) payload[k] = v;
        const res = await fetch(ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(payload),
        });
        const out = await res.json().catch(() => ({}));
        if (!res.ok || String(out.success) !== 'true') throw new Error(out.message || res.status);
        dialog.classList.add('is-sent');
        form.reset();
        status.textContent = '';
      } catch (err) {
        status.textContent = 'Nie udało się wysłać automatycznie – otwieramy Twoją pocztę z gotową wiadomością.';
        mailtoFallback();
      } finally {
        submit.disabled = false;
      }
    });
  });
})();
