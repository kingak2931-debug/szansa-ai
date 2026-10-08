// Formularz „Porozmawiajmy o partnerstwie” (okno nad stroną zamiast od razu poczty).
//
// Strona jest statyczna (bez własnego serwera), więc wiadomość wysyła usługa FormSubmit
// (formsubmit.co) prosto na kontakt@szansaai.pl. Przy pierwszym zgłoszeniu FormSubmit wysyła
// na ten adres e-mail z linkiem aktywacyjnym – trzeba go raz kliknąć. Dopóki formularz nie jest
// aktywny albo gdy usługa nie odpowiada, nic nie ginie: otwieramy program pocztowy
// z gotową, wypełnioną wiadomością.
(function () {
  const TO = 'kontakt@szansaai.pl';
  const ENDPOINT = 'https://formsubmit.co/ajax/' + TO;

  const dialog = document.getElementById('partner-dialog');
  if (!dialog || typeof dialog.showModal !== 'function') return; // stare przeglądarki: zostaje link mailto
  const form = dialog.querySelector('form');
  const status = dialog.querySelector('.form-status');
  const submit = form.querySelector('[type="submit"]');
  const root = document.documentElement;

  function open(e) {
    e.preventDefault();
    dialog.classList.remove('is-sent');
    status.textContent = '';
    dialog.showModal();
    root.classList.add('modal-open');
    requestAnimationFrame(() => dialog.classList.add('is-open'));
    setTimeout(() => form.querySelector('input').focus(), 50);
  }
  function close() {
    dialog.classList.remove('is-open');
    setTimeout(() => { dialog.close(); }, 250);
  }
  dialog.addEventListener('close', () => root.classList.remove('modal-open'));
  dialog.addEventListener('cancel', (e) => { e.preventDefault(); close(); });
  dialog.addEventListener('click', (e) => {
    if (e.target === dialog || e.target.closest('[data-close]')) close(); // klik w tło lub „×”
  });
  document.querySelectorAll('[data-partner-form]').forEach((a) => a.addEventListener('click', open));

  function data() {
    const f = new FormData(form);
    return {
      name: f.get('name').trim(),
      company: f.get('company').trim(),
      email: f.get('email').trim(),
      phone: f.get('phone').trim(),
      type: f.get('type'),
      message: f.get('message').trim(),
    };
  }

  function mailtoFallback(d) {
    const body = [
      `Imię i nazwisko: ${d.name}`, `Firma / instytucja: ${d.company || '—'}`,
      `E-mail: ${d.email}`, `Telefon: ${d.phone || '—'}`, `Forma współpracy: ${d.type}`,
      '', d.message,
    ].join('\n');
    location.href = `mailto:${TO}?subject=${encodeURIComponent('Partnerstwo z Fundacją Szansa AI – ' + (d.company || d.name))}&body=${encodeURIComponent(body)}`;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!form.reportValidity()) return;
    if (form.querySelector('[name="_honey"]').value) return; // pułapka na boty
    const d = data();
    submit.disabled = true;
    status.textContent = 'Wysyłamy…';
    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          _subject: `Partnerstwo – ${d.company || d.name}`,
          _template: 'table',
          _captcha: 'false',
          'Imię i nazwisko': d.name,
          'Firma / instytucja': d.company,
          email: d.email,
          Telefon: d.phone,
          'Forma współpracy': d.type,
          'Wiadomość': d.message,
        }),
      });
      const out = await res.json().catch(() => ({}));
      if (!res.ok || String(out.success) !== 'true') throw new Error(out.message || res.status);
      dialog.classList.add('is-sent');
      form.reset();
    } catch (err) {
      status.textContent = 'Nie udało się wysłać automatycznie – otwieramy Twoją pocztę z gotową wiadomością.';
      mailtoFallback(d);
    } finally {
      submit.disabled = false;
    }
  });
})();
