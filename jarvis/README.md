# Jarvis — system zarządzania Fundacji Szansa AI

CLI (Python 3.10+, wyłącznie biblioteka standardowa — zero zależności) do zarządzania
operacjami fundacji: darowizny, pipeline sponsorski B2B, kalendarz grantowy, raporty,
propozycje e-maili i postów.

## Zasada nadrzędna: autonomia z nadzorem

**Żadna akcja mutująca nie wykonuje się automatycznie.** Każdy zapis do bazy,
zakolejkowanie i wysyłka e-maila czy posta najpierw prezentuje pełną propozycję
i czeka na jawną zgodę operatora `[T/N]` (akceptowane też Y/yes/tak).

Gwarancje wbudowane w kod (`jarvis/approval.py`):
- brak flagi `--yes` i trybu wsadowego — celowo nie istnieją;
- środowisko nieinteraktywne (cron, pipe) → odmowa (`NonInteractiveError`), nigdy ciche wykonanie;
- odmowa operatora → `ApprovalDenied`, zero skutków ubocznych;
- **płatności są poza zakresem systemu** — Jarvis tylko raportuje stan środków;
  przelewy autoryzują wyłącznie ludzie w systemie bankowym (zasada dwóch podpisów);
- wysyłka e-maila to DWIE zatwierdzane bramki: (1) treść → kolejka `outbox`,
  (2) `outbox send` → eksport do pliku (integracja SMTP/API wymaga świadomej konfiguracji);
- pełny dziennik audytu (`jarvis audit`) każdej zatwierdzonej operacji.

## Szybki start

```bash
cd jarvis
python3 -m unittest discover -s tests          # testy

# raporty (odczyt — bez zatwierdzania)
python3 -m jarvis.cli report finance
python3 -m jarvis.cli report full

# dane (każda komenda pyta [T/N])
python3 -m jarvis.cli donor add --name "Jan Kowalski" --email jan@example.pl --recurring
python3 -m jarvis.cli donation add --donor-id 1 --amount 250 --channel online --cert
python3 -m jarvis.cli sponsor set --company "TechCorp" --package regionalny \
    --status offer --pledged 50000 --contact "Anna Nowak" --email a.nowak@techcorp.pl
python3 -m jarvis.cli grant add --program "NOWEFIO 2026" --funder "NIW-CRSO" \
    --deadline 2026-11-30 --amount 300000 --status preparing

# propozycje treści (pokazuje pełny draft → [T/N] → kolejka)
python3 -m jarvis.cli propose email sponsor --company TechCorp --contact "Pani Anno" \
    --package regionalny --region "Podlasia" --to a.nowak@techcorp.pl
python3 -m jarvis.cli propose email thanks --donation-id 1
python3 -m jarvis.cli propose post nabor --platform facebook --place "Hajnówka"

# kolejka wychodząca
python3 -m jarvis.cli outbox list
python3 -m jarvis.cli outbox send --id 1     # ponowne [T/N] przed finalizacją
python3 -m jarvis.cli audit                  # dziennik zdarzeń
```

Baza: `data/jarvis.db` (SQLite; nadpisywalne `--db` lub zmienną `JARVIS_DB`).
Katalog `data/` zawiera dane osobowe — jest w `.gitignore` i nigdy nie trafia do repo (RODO).

## Architektura

| Plik | Rola |
|---|---|
| `jarvis/approval.py` | Bramka `[T/N]` — jedyna droga do wykonania mutacji |
| `jarvis/db.py` | SQLite: darczyńcy, darowizny, sponsorzy, granty, outbox, audyt |
| `jarvis/reports.py` | Raporty: finanse vs cel 2 mln, darczyńcy, pipeline, granty |
| `jarvis/proposals.py` | Generatory treści: outreach B2B, podziękowania, posty, certyfikaty |
| `jarvis/cli.py` | Interfejs poleceń spinający całość |

## Roadmapa integracji (każda za świadomą decyzją operatora)

1. SMTP/IMAP (wysyłka po `outbox send` zamiast eksportu do pliku) — po skonfigurowaniu
   skrzynki fundacji; bramka [T/N] pozostaje.
2. Import wyciągów bankowych (MT940/CSV) → propozycje księgowań darowizn (każda [T/N]).
3. Webhook operatora płatności (Stripe/PayU) → automatyczne PROPOZYCJE wpisów, nigdy zapisy.
4. Generator PDF certyfikatów z szablonu HTML.
