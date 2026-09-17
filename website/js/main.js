/* Fundacja Szansa AI — logika strony (nawigacja, moduł wpłat, formularze) */
"use strict";

/* ====== KONFIGURACJA PŁATNOŚCI ======
 * Strona jest statyczna — finalizacja płatności wymaga backendu lub linków
 * hostowanych przez operatora. Rekomendowane opcje (wybrać jedną):
 *  1. Stripe Payment Links — utwórz linki w panelu Stripe (jednorazowe i cykliczne)
 *     i wpisz je poniżej. Zero backendu, Stripe obsługuje BLIK/karty/Przelewy24.
 *  2. PayU dla NGO — formularz płatności hostowany przez PayU.
 * Wpisy "null" włączają tryb demonstracyjny (komunikat zamiast przekierowania).
 */
const PAYMENT_CONFIG = {
  // np. "https://buy.stripe.com/XXXX" — osobny link dla każdej kwoty lub jeden z polem kwoty
  oneTimeUrl: null,
  monthlyUrl: null,
  bankAccount: {
    name: "Fundacja Szansa AI",
    // Uzupełnić po otwarciu rachunku:
    iban: "PL00 0000 0000 0000 0000 0000 0000",
    title: "Darowizna na cele statutowe",
  },
};

/* Co daje dana kwota — komunikaty wpływu przy module wpłat */
const IMPACT = [
  [500, "500 zł = pełny udział jednego dziecka w semestrze zajęć AI"],
  [200, "200 zł = miesiąc licencji i narzędzi AI dla całej grupy warsztatowej"],
  [100, "100 zł = jedna godzina warsztatów dla grupy dzieci w małej gminie"],
  [50, "50 zł = materiały edukacyjne dla trójki dzieci"],
  [30, "30 zł = wydrukowany „Bezpieczny AI-Guide” dla jednej rodziny"],
];

document.addEventListener("DOMContentLoaded", () => {
  initNav();
  initDonationWidget();
  initForms();
});

/* ---------- nawigacja mobilna ---------- */
function initNav() {
  const toggle = document.querySelector(".nav-toggle");
  const links = document.querySelector(".nav-links");
  if (!toggle || !links) return;
  toggle.addEventListener("click", () => {
    const open = links.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(open));
  });
}

/* ---------- moduł wpłat ---------- */
function initDonationWidget() {
  const widget = document.querySelector("[data-donation-widget]");
  if (!widget) return;

  const amountBtns = widget.querySelectorAll(".amount[data-amount]");
  const customInput = widget.querySelector("#custom-amount");
  const freqBtns = widget.querySelectorAll(".freq-toggle button");
  const impactLine = widget.querySelector(".impact-line");
  const donateBtn = widget.querySelector("#donate-btn");

  let amount = 100;
  let frequency = "once"; // "once" | "monthly"

  function render() {
    amountBtns.forEach((b) =>
      b.classList.toggle("selected", Number(b.dataset.amount) === amount && !customInput.value)
    );
    const match = IMPACT.find(([threshold]) => amount >= threshold);
    impactLine.textContent = match ? match[1] : "Każda złotówka wspiera edukację AI dzieci z małych miejscowości.";
    donateBtn.textContent =
      frequency === "monthly" ? `Wspieraj kwotą ${amount} zł miesięcznie` : `Przekaż ${amount} zł`;
  }

  amountBtns.forEach((btn) =>
    btn.addEventListener("click", () => {
      amount = Number(btn.dataset.amount);
      customInput.value = "";
      render();
    })
  );

  customInput.addEventListener("input", () => {
    const v = Number(customInput.value);
    if (v > 0) amount = v;
    render();
  });

  freqBtns.forEach((btn) =>
    btn.addEventListener("click", () => {
      frequency = btn.dataset.freq;
      freqBtns.forEach((b) => b.classList.toggle("active", b === btn));
      render();
    })
  );

  donateBtn.addEventListener("click", () => {
    const url = frequency === "monthly" ? PAYMENT_CONFIG.monthlyUrl : PAYMENT_CONFIG.oneTimeUrl;
    if (url) {
      // Payment Link operatora — kwota potwierdzana po stronie operatora płatności.
      window.location.href = url;
      return;
    }
    // Tryb demonstracyjny: pokazujemy dane do przelewu tradycyjnego.
    const { name, iban, title } = PAYMENT_CONFIG.bankAccount;
    alert(
      "Moduł płatności online zostanie aktywowany po podpisaniu umowy z operatorem (Stripe/PayU).\n\n" +
        `Do tego czasu prosimy o przelew tradycyjny:\n${name}\n${iban}\nTytuł: ${title} — ${amount} zł` +
        (frequency === "monthly" ? " (zlecenie stałe)" : "")
    );
  });

  render();
}

/* ---------- formularze (zgłoszenia, kontakt sponsorski) ---------- */
function initForms() {
  document.querySelectorAll("form[data-form]").forEach((form) => {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!form.reportValidity()) return;

      /* Docelowo: endpoint backendu / Formspree / n8n webhook.
       * Do czasu wdrożenia — otwieramy klienta poczty z wypełnioną treścią,
       * żeby żadne dane osobowe nie trafiały do zewnętrznych usług bez umowy powierzenia. */
      const kind = form.dataset.form;
      const data = new FormData(form);
      const lines = [...data.entries()]
        .filter(([k]) => !k.startsWith("consent"))
        .map(([k, v]) => `${k}: ${v}`)
        .join("\n");
      const subject = encodeURIComponent(
        kind === "sponsor" ? "Zapytanie sponsorskie — Szansa AI" : "Zgłoszenie do programu — Szansa AI"
      );
      window.location.href = `mailto:kontakt@szansa-ai.example.pl?subject=${subject}&body=${encodeURIComponent(lines)}`;

      const ok = form.querySelector(".form-success");
      if (ok) ok.hidden = false;
    });
  });
}
