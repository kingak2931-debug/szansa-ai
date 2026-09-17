# Serwis WWW Fundacji Szansa AI

Statyczna, responsywna strona (HTML/CSS/JS, bez procesu build) — świadomy wybór dla NGO:
darmowy hosting (GitHub Pages / Cloudflare Pages / Netlify), zerowe koszty utrzymania,
łatwe edycje bez wiedzy programistycznej.

## Struktura

| Plik | Rola |
|---|---|
| `index.html` | Strona główna — misja, model działania, CTA |
| `misja.html` | Misja, program nauczania, standardy ochrony małoletnich |
| `sponsorzy.html` | Oferta B2B/CSR: pakiety, korzyści, formularz kontaktowy |
| `wsparcie.html` | Moduł wpłat (jednorazowe/cykliczne) + przelew tradycyjny + FAQ |
| `zgloszenia.html` | Formularz zgłoszeniowy dla szkół/GOK/rodziców |
| `polityka-prywatnosci.html` | Skrót polityki prywatności (pełny wzór w `../legal/`) |

## Uruchomienie lokalne

```bash
cd website && python3 -m http.server 8080
# http://localhost:8080
```

## Wdrożenie płatności (checklista)

1. Po rejestracji fundacji w KRS i otwarciu rachunku: umowa z operatorem
   (rekomendacja: **Stripe** — Payment Links z obsługą BLIK/P24 i płatności cyklicznych,
   lub **PayU Dobroczynność** — preferencyjne stawki dla NGO).
2. Utworzyć Payment Links (jednorazowy + subskrypcyjny) i wpisać adresy
   do `PAYMENT_CONFIG` w `js/main.js` (`oneTimeUrl`, `monthlyUrl`).
3. Uzupełnić prawdziwy numer rachunku w `PAYMENT_CONFIG.bankAccount`.
4. Do czasu integracji strona działa w trybie demonstracyjnym: pokazuje dane do
   przelewu tradycyjnego (bezpieczny fallback, zgodny z prawem od pierwszego dnia).

## Wdrożenie formularzy

Formularze (`data-form`) otwierają obecnie klienta poczty (mailto) — celowo: żadne dane
osobowe nie płyną do zewnętrznych usług przed podpisaniem umów powierzenia (RODO).
Docelowo podpiąć endpoint (własny backend / Formspree z umową powierzenia) w `initForms()`.

## Przed publikacją produkcyjną

- [ ] Zastąpić `kontakt@szansa-ai.example.pl` prawdziwą domeną i skrzynką
- [ ] Uzupełnić KRS/NIP w stopce po rejestracji
- [ ] Opublikować pełną politykę prywatności (z `../legal/`) po weryfikacji prawnej
- [ ] Dodać bannery cookies tylko jeśli dojdą narzędzia analityczne (obecnie brak cookies!)
- [ ] Podpiąć własną domenę + HTTPS
