# Strona premium (styl awwwards) — pełna wersja wielostronicowa

**Status: kompletna, gotowa do przeglądu. Wciąż NIE zastępuje `website/` bez decyzji fundatorki.**

Punkt wyjścia: szablon zaprojektowany przez fundatorkę (GSAP + Three.js, ciemny
motyw, scroll-driven animacje). Rozbity na sześć podstron z odzyskaną strukturą,
którą fundatorka ceniła w pierwszej wersji strony (`website/`), oraz uzupełniony
o wszystkie elementy funkcjonalne.

## Struktura

| Plik | Zawartość |
|---|---|
| `index.html` | Hero, dlaczego to ważne, skala misji (liczniki), CTA |
| `misja.html` | Pełna misja, program szkolenia (4 bloki), mapa rozwoju, standardy ochrony małoletnich |
| `sponsorzy.html` | Korzyści B2B, cennik 4 pakietów, formularz kontaktowy |
| `wsparcie.html` | Moduł wpłat (kwoty/częstotliwość/PayU), przelew tradycyjny, FAQ |
| `zgloszenia.html` | Kroki współpracy, formularz zgłoszeniowy szkół |
| `polityka-prywatnosci.html` | Pełna treść polityki (RODO) w tym samym stylu wizualnym |
| `assets/style.css` | Wspólny arkusz stylów (wyodrębniony z oryginalnego pliku + rozszerzony o moduł wpłat, cennik, FAQ, kroki) |
| `assets/app.js` | Wspólna logika: nav, animacje GSAP/ScrollTrigger, tło Three.js, moduł wpłat, formularze |

## Co zostało zrobione względem oryginalnego szablonu

- Struktura wielostronicowa zamiast jednej długiej strony z kotwicami.
- CSS/JS wydzielone do wspólnych plików (bez duplikowania >1000 linii stylu w każdym pliku).
- Usunięty przełącznik PL/EN (niepotrzebna złożoność na start; strona tylko po polsku).
- Nowe logo (sieć neuronów + dziecko sięgające po iskrę, złoty gradient) w navbarze i stopce.
- Wszystkie treści zgodne z modelem z `ANEKS-01-model-szkolen.md`: intensywne
  szkolenia maks. 2 dni, bez obietnicy przywożenia sprzętu, liczby oparte na
  ~100 uczniach/szkolenie i 50 szkołach w roku 1.
- Prawdziwe dane rejestrowe (KRS/NIP/REGON/adres/konto/e-mail) wszędzie.
- Moduł wpłat z logiką kwot/częstotliwości (PayU — do podpięcia Payment Links po
  aktywacji konta merchant; do tego czasu pokazuje dane do przelewu tradycyjnego).
- Formularze (sponsorzy, zgłoszenia) z etykietami, zgodą RODO i linkiem do polityki
  prywatności — demo `alert()` do czasu podłączenia backendu/umów powierzenia.
- **Odporność:** jeśli CDN z GSAP/Three.js nie odpowie (słaby internet u odbiorcy),
  nawigacja, moduł wpłat i formularze nadal działają — tylko animacje się nie uruchomią.
- Poprawka mobilna: pływające karty w hero (position: absolute) zamienione na
  czytelny pionowy stos poniżej 900px, żeby nie nakładały się na siebie.

## Zweryfikowane wizualnie

Wszystkie strony przetestowane lokalnie w Chromium (desktop 1400px + mobile 390px):
poprawne renderowanie, zero błędów JS w konsoli, cennik/moduł wpłat/FAQ/formularze
działają zgodnie z projektem. Zrzuty z sesji projektowej nie są częścią repo (tylko
do wglądu w rozmowie) — odtwórz je lokalnie: `cd website-premium && python3 -m http.server 8080`.

## Co jeszcze zostaje do decyzji fundatorki (nie blokuje jakości kodu)

1. **Telefon kontaktowy** — świadomie pominięty (tylko e-mail), zgodnie z wolą fundatorki.
2. **Social media** — linki w stopce dodamy, gdy profile powstaną.
3. **PayU Payment Links** — aktywne dopiero po zawarciu umowy z operatorem.
4. **Zdjęcia z warsztatów** — sekcja programów na `misja.html` obecnie bez zdjęć
   (celowo, żeby nie używać stockowych obrazków dzieci); dodać po pierwszych szkoleniach.
5. **Decyzja: `website/` czy `website-premium/` idzie do publikacji** — obie wersje
   są teraz kompletne funkcjonalnie; różnią się stylem wizualnym (klasyczny jasny
   vs. premium ciemny z animacjami).
