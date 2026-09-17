# Mini-CRM Fundacji Szansa AI (`jarvis/crm/`)

Rozszerzenie agentyki Jarvis o pełny CRM: szanse sprzedażowe B2B, baza szkół/GOK-ów,
śledzenie wpłat oraz wysyłka maili sekwencji outreach — **każda mutacja i każda
wysyłka za jawną zgodą operatora `[T/N]`** (ta sama bramka co w Jarvisie: brak
`--yes`, odmowa w środowisku nieinteraktywnym, dziennik audytu).

## Dwa backendy danych

| Tryb | Kiedy | Konfiguracja |
|---|---|---|
| **SQLite** (domyślny) | praca lokalna, start fundacji | nic — współdzieli `data/jarvis.db` z Jarvisem |
| **Postgres na Vercel** | praca zespołowa / produkcja | zmienna `DATABASE_URL` + `pip install "psycopg[binary]"` |

## Szybki start (lokalnie)

```bash
cd jarvis

# pipeline B2B
python3 crm/crm.py opp set --company "TechCorp" --status meeting --value 50000 \
    --package regionalny --contact "Anna Nowak" --email a.nowak@techcorp.pl \
    --next-action "wysłać ofertę PDF" --next-date 2026-09-22
python3 crm/crm.py pipeline          # tabela szans (⚠ = akcja zaległa)
python3 crm/crm.py due               # co jest do zrobienia dziś

# szkoły i GOK-i (zgłoszenia pilotażowe)
python3 crm/crm.py school add --name "SP w Hajnówce" --kind school --town "Hajnówka" \
    --population "10-20k" --contact "Dyr. Jan Kowalski" --email sp@example.pl --children 40
python3 crm/crm.py school list
python3 crm/crm.py school set --id 1 --status pilotaz

# wpłaty i darczyńcy (widok na dane Jarvisa)
python3 crm/crm.py donations

# sekwencja outreach: krok podpowiadany automatycznie (1 → 2 → 3)
python3 crm/crm.py email --company "TechCorp" \
    --hook "czytałem wywiad o brakach kadrowych w regionie — my pracujemy nad tym 10 lat wcześniej" \
    --sender "Jan Kowalski" --region "Podlasia"
python3 crm/crm.py send --id 1       # ponowne [T/N]; SMTP albo eksport do pliku
```

Po zakolejkowaniu maila CRM sam ustawia `sequence_step`, `last_contact` i termin
follow-upu (+4 dni po kroku 1, +6 dni po kroku 2, pauza 60 dni po kroku 3) —
`crm.py due` przypomni, kiedy działać.

## Wysyłka SMTP (opcjonalna)

Bez konfiguracji mail po zatwierdzeniu trafia do pliku w `data/outbox_export/`
(kopiujesz do klienta poczty). Aby wysyłać bezpośrednio, ustaw:

```bash
export SMTP_HOST=smtp.example.pl SMTP_PORT=587
export SMTP_USER=fundacja@... SMTP_PASSWORD=... SMTP_FROM="Fundacja Szansa AI <fundacja@...>"
```

Bramka `[T/N]` obowiązuje niezależnie od kanału — SMTP niczego nie automatyzuje.

## Wdrożenie bazy na Vercel (Postgres)

1. W panelu Vercel: **Storage → Create Database → Postgres** (Neon). Skopiuj
   `DATABASE_URL` (wariant *pooled* do funkcji serverless, *direct* do migracji).
2. Wgraj schemat: `psql "$DATABASE_URL" -f schema_postgres.sql`
3. Lokalnie: `export DATABASE_URL=...` — `crm.py` przełącza się na Postgres
   automatycznie (wymaga `pip install "psycopg[binary]"`).
4. (Opcjonalnie) endpoint statystyk: katalog `vercel/` to gotowy projekt —
   `cd vercel && vercel deploy`, w ustawieniach projektu dodaj `DATABASE_URL`
   oraz `STATS_TOKEN` (endpoint zwraca wyłącznie zagregowane liczby, zero danych
   osobowych; token chroni przed publicznym odpytywaniem).

## RODO — zasady twarde

- Baza zawiera dane osobowe (darczyńcy, kontakty szkół i firm): dostęp imienny,
  po SSL; `data/` w `.gitignore` — nigdy w repozytorium.
- Rejestrujemy **tylko** dane kontaktowe dorosłych; danych dzieci CRM nie
  przechowuje (szacunkowa liczba uczestników to nie dane osobowe).
- Odpowiedź „nie" na outreach → status `declined`, bezterminowo respektowany.
- Endpoint `/api/stats` zwraca wyłącznie agregaty.

## Testy

```bash
cd jarvis && python3 -m unittest discover -s tests
```
