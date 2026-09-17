# Fundacja „Szansa AI"

**Misja:** nauka dzieci z małych miejscowości (do 20 tys. mieszkańców) odpowiedzialnego,
bezpiecznego i efektywnego wykorzystywania sztucznej inteligencji.

**Cel finansowy na start:** 2 000 000 PLN (18 miesięcy do pełnej operacyjności).

## Zawartość repozytorium

| Katalog / plik | Zawartość |
|---|---|
| [`PLAN.md`](PLAN.md) | **ETAP 1** — pełny plan operacyjny i finansowy: strategia fundraisingu (4 filary), budżet 2 mln PLN, harmonogram, zgodność prawna, KPI, ryzyka |
| [`website/`](website/) | **Moduł 1** — responsywny serwis www: misja, moduł wpłat, oferta sponsorska, formularz zgłoszeniowy |
| [`marketing/`](marketing/) | **Moduł 2** — strategia komunikacji, szablony postów (LinkedIn/FB/IG), kampanie Meta Ads i Google Ad Grants |
| [`fundraising/`](fundraising/) | **Moduł 3** — produkty cegiełkowe: e-book dla rodziców (pełny rękopis), kurs dla nauczycieli, certyfikaty, gadżety |
| [`legal/`](legal/) | **Moduł 4** — wzory dokumentów: statut, polityka prywatności (RODO), standardy ochrony małoletnich (ustawa Kamilka), umowa darowizny B2B, regulamin zbiórki |
| [`jarvis/`](jarvis/) | **ETAP 3** — system zarządzania (CLI, Python): darowizny, pipeline B2B, granty, raporty, propozycje treści — każda akcja za zgodą operatora `[T/N]` |

## Zasady nadrzędne

1. **Zgodność z prawem:** ustawa o fundacjach, ustawa o DPPiW, RODO, ustawa Kamilka
   (standardy ochrony małoletnich), prawo podatkowe, ustawa o zbiórkach publicznych.
   Wzory w `legal/` wymagają weryfikacji przez prawnika przed użyciem.
2. **Bezpieczeństwo dzieci przede wszystkim:** weryfikacja kadry przed dopuszczeniem
   do pracy, SOM przyjęte przed pierwszymi zajęciami, minimalizacja danych dzieci.
3. **Nadzór człowieka nad automatyzacją:** system Jarvis niczego nie wysyła, nie
   publikuje i nie księguje bez jawnego zatwierdzenia operatora.

## Szybki start

```bash
# podgląd strony www
cd website && python3 -m http.server 8080

# system zarządzania
cd jarvis && python3 -m unittest discover -s tests && python3 -m jarvis.cli report full
```
