# Fundacja „Szansa AI" — kontekst projektu dla Claude

Ten plik jest przekazaniem kontekstu z sesji chmurowej (claude.ai/code), w której
powstał cały projekt. Czytasz go najpewniej w lokalnej sesji Claude Code na
komputerze użytkownika — kontynuuj pracę zgodnie z poniższymi zasadami.

## Czym jest ten projekt

Kompletny plan operacyjny i zasoby polskiej fundacji uczącej dzieci z miejscowości
do 20 tys. mieszkańców odpowiedzialnego, bezpiecznego i efektywnego korzystania z AI.
Cel finansowy: 2 mln PLN w 18 miesięcy. Fundacja jest zarejestrowana formalnie.

**Model szkoleniowy (ANEKS-01, ma pierwszeństwo przed starszymi zapisami):**
jedna szkoła = jedno szkolenie, maks. 2 dni po 2–3 h, **ok. 100 uczniów na szkołę**;
rok 1: ~50 szkół = ~5 000 dzieci; konwersja ~10% na subskrypcję ≤19 zł/mies.;
rynek: ~9,5–10 tys. szkół podstawowych w miejscowościach ≤20 tys. (GUS 2024/25);
część szkoleń możliwa online dla kilku szkół naraz. BEZ obietnicy przywożenia
sprzętu (sala/pracownia szkoły lub wariant bez komputerów; mobilne pracownie to CEL
zbiórek). Przeliczniki pakietów sponsorskich = ROBOCZE, do ustalenia z fundatorką
przy przebudowie strony. Długoterminowo fundacja powoła spółkę „Szkoła AI" (subskrypcja) —
strona na razie tego nie sprzedaje. Statut w legal/ to WZÓR — obowiązuje statut
złożony w sądzie (do podmiany, gdy użytkowniczka go dostarczy). Przebudowa strony
w stylu awwwards (animacje/3D/scrub scroll) = faza 2, po starcie.

## Mapa repozytorium

| Ścieżka | Zawartość |
|---|---|
| `PLAN.md` | Plan operacyjno-finansowy: 4 filary fundraisingu, budżet, harmonogram, KPI, ryzyka |
| `website/` | Statyczna strona www (HTML/CSS/JS, bez builda — celowo); moduł wpłat w trybie demo |
| `marketing/` | Strategia komunikacji, szablony postów, Meta Ads + Google Ad Grants |
| `fundraising/` | Produkty cegiełkowe; pełny rękopis e-booka dla rodziców; certyfikaty |
| `legal/` | WZORY dokumentów (statut, RODO, SOM/ustawa Kamilka, umowa darowizny, zbiórki) — zawsze z dopiskiem o weryfikacji prawnej |
| `jarvis/` | CLI zarządzania (Python, stdlib-only): darowizny, granty, raporty, outbox |
| `jarvis/crm/` | Mini-CRM: pipeline B2B, szkoły/GOK, sekwencja outreach; SQLite lub Postgres (`DATABASE_URL`), schemat pod Vercel |
| `execution/` | Go-To-Market: 10 scenariuszy rolek, strategia IG, 10 wpisów LinkedIn, kalendarz FB 30 dni, oferta sponsorska (Brązowy 10k/Srebrny 50k/Złoty 100k), cold outreach, scenariusz warsztatów, harmonogram 30 dni |
| `narzedzia/sync-pulpit.py` | Buduje/odświeża `Pulpit/Fundacja_Szansa_AI` w układzie folderów 01–07 |

## Zasady twarde (nie zmieniaj bez wyraźnej prośby użytkownika)

1. **Bramka [T/N]:** żadna akcja Jarvisa/CRM (zapis do bazy, mail, post) nie wykonuje
   się bez jawnej zgody operatora. Nie dodawaj flagi `--yes` ani trybu wsadowego —
   to celowa decyzja projektowa. Płatności są poza zakresem systemu.
2. **Zgodność prawna:** RODO (minimalizacja danych, dane dzieci tylko za zgodą
   rodziców), ustawa Kamilka (SOM przed pracą z dziećmi), rozdział darowizna vs
   sponsoring (VAT). Wzory prawne zawsze z zastrzeżeniem weryfikacji przez prawnika.
3. **Rzetelność komunikacji:** w postach i ofertach tylko prawdziwe liczby (ze
   sprawozdań/ewaluacji); wpisy wymagające danych z pilotażu są oznaczone i czekają.
4. **Katalog `jarvis/data/` (bazy, eksporty maili) nigdy nie trafia do gita** (RODO).
5. Język projektu i komunikacji z użytkownikiem: **polski**.

## Konwencje pracy

- Gałąź robocza: `claude/szansa-ai-operational-plan-ccet8b` (sesja chmurowa pushuje
  na nią; lokalnie rób `git pull` przed pracą, by uniknąć rozjazdu).
- Testy: `cd jarvis && python3 -m unittest discover -s tests` (18 testów, wszystkie
  muszą przechodzić; do nowych funkcji Jarvisa/CRM dopisuj testy).
- Po zmianach użytkownik chce mieć aktualny Pulpit: uruchom
  `python3 narzedzia/sync-pulpit.py` (lokalna sesja MOŻE pisać na Pulpit bezpośrednio —
  to było niewykonalne z chmury i jest głównym powodem przejścia na sesję lokalną).
- Placeholdery do uzupełnienia danymi rzeczywistymi (szukaj `[…]`, `example.pl`,
  `PL00 0000`): domena i e-mail, numer rachunku, KRS/NIP w stopkach, linki Payment
  Links operatora w `website/js/main.js` (`PAYMENT_CONFIG`), dane SMTP dla CRM.

## Stan na moment przekazania (2026-09-17)

- Zrobione: Moduły 1–4, Jarvis, Moduł 6 (GTM + CRM), skrypt sync-pulpit; strona ma
  prywatny podgląd online (artefakt); wszystko zacommitowane i wypchnięte.
- Naturalne następne kroki (użytkownik nie zlecił ich jeszcze wprost):
  1. Synchronizacja Pulpitu lokalnie (`narzedzia/sync-pulpit.py`) — pierwsza rzecz,
     o którą prosił, a której chmura nie mogła zrobić.
  2. Hosting produkcyjny strony (GitHub Pages / Cloudflare Pages) + domena.
  3. Konfiguracja SMTP i ewentualnie `DATABASE_URL` (Vercel Postgres) dla CRM.
  4. Pull request z gałęzi roboczej do `main`, gdy użytkownik zdecyduje.
