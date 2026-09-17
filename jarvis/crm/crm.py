#!/usr/bin/env python3
"""Mini-CRM Fundacji Szansa AI (moduł agentyki Jarvis).

Zakres:
- szanse sprzedażowe B2B (status, wartość, ostatni kontakt, następna akcja),
- baza szkół i GOK-ów (zgłoszenia na zajęcia pilotażowe),
- śledzenie wpłat i darczyńców (współdzielone tabele Jarvisa),
- wysyłka generowanych maili sekwencji outreach — ZAWSZE za zgodą [T/N].

Backendy danych:
- lokalnie: SQLite (ta sama baza co Jarvis — data/jarvis.db),
- produkcyjnie: Postgres (Vercel Postgres/Neon) przez zmienną DATABASE_URL
  i sterownik psycopg; schemat: schema_postgres.sql.

Model bezpieczeństwa identyczny jak w Jarvisie: każda mutacja i każda wysyłka
przechodzi przez bramkę zatwierdzenia operatora (jarvis.approval) — brak trybu
wsadowego i flagi --yes, odmowa w środowisku nieinteraktywnym.
"""

from __future__ import annotations

import argparse
import os
import sys
from datetime import date, datetime

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
from jarvis import db as jdb  # noqa: E402
from jarvis.approval import ApprovalDenied, NonInteractiveError, Proposal, confirm  # noqa: E402

CRM_SCHEMA_SQLITE = """
CREATE TABLE IF NOT EXISTS schools (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,                        -- nazwa szkoły / GOK
    kind TEXT NOT NULL DEFAULT 'school' CHECK (kind IN ('school', 'gok', 'library', 'municipality')),
    town TEXT NOT NULL,
    population_band TEXT CHECK (population_band IN ('<5k', '5-10k', '10-20k', '>20k')),
    contact_name TEXT,
    contact_email TEXT,
    status TEXT NOT NULL DEFAULT 'zgloszenie'  -- zgloszenie | rozmowa | porozumienie | pilotaz | semestr | odrzucone
        CHECK (status IN ('zgloszenie', 'rozmowa', 'porozumienie', 'pilotaz', 'semestr', 'odrzucone')),
    children_estimate INTEGER,
    notes TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);
"""

def _migrate(conn) -> None:
    """Dokłada tabele/kolumny CRM do bazy Jarvisa (idempotentnie)."""
    conn.executescript(CRM_SCHEMA_SQLITE)
    existing = {row["name"] for row in conn.execute("PRAGMA table_info(sponsors)")}
    for col, ddl in (("last_contact", "TEXT"), ("next_action", "TEXT"),
                     ("next_action_date", "TEXT"), ("sequence_step", "INTEGER NOT NULL DEFAULT 0")):
        if col not in existing:
            conn.execute(f"ALTER TABLE sponsors ADD COLUMN {col} {ddl}")
    conn.commit()


def connect(path: str | None = None):
    """Zwraca połączenie: Postgres gdy DATABASE_URL ustawione, inaczej SQLite Jarvisa."""
    url = os.environ.get("DATABASE_URL")
    if url:
        try:
            import psycopg
            from psycopg.rows import dict_row
        except ImportError:
            sys.exit("DATABASE_URL ustawione, ale brak sterownika: pip install psycopg[binary]")
        conn = psycopg.connect(url, row_factory=dict_row)
        conn.autocommit = True
        # W Postgresie schemat zakłada schema_postgres.sql (wdrożony przy deployu);
        # translacja placeholderów: ten moduł używa stylu qmark tylko dla SQLite,
        # więc dla Postgresa opakowujemy execute.
        return _PgAdapter(conn)
    conn = jdb.connect(path)
    _migrate(conn)
    return conn


class _PgAdapter:
    """Minimalny adapter: styl '?' → '%s', interfejs zbliżony do sqlite3."""

    def __init__(self, conn):
        self._conn = conn

    def execute(self, sql, params=()):
        cur = self._conn.cursor()
        cur.execute(sql.replace("?", "%s"), params)
        return cur

    def commit(self):
        pass  # autocommit

    def close(self):
        self._conn.close()


def now() -> str:
    return datetime.now().isoformat(timespec="seconds")


# ------------------------------------------------------------------
# Szanse sprzedażowe B2B (tabela sponsors + kolumny CRM)
# ------------------------------------------------------------------

STATUS_ORDER = "CASE status WHEN 'signed' THEN 0 WHEN 'offer' THEN 1 WHEN 'meeting' THEN 2 " \
               "WHEN 'contacted' THEN 3 WHEN 'lead' THEN 4 ELSE 5 END"


def cmd_pipeline(args):
    conn = connect(args.db)
    rows = conn.execute(
        f"SELECT company, status, package, pledged_pln, last_contact, next_action,"
        f" next_action_date, sequence_step FROM sponsors ORDER BY {STATUS_ORDER}, pledged_pln DESC"
    ).fetchall()
    if not rows:
        print("Pipeline pusty — dodaj szansę: crm.py opp set --company ...")
        return
    print(f"{'FIRMA':<26} {'STATUS':<10} {'WARTOŚĆ':>10} {'OST.KONTAKT':<12} NASTĘPNA AKCJA")
    total = 0.0
    for r in rows:
        r = dict(r)
        total += r["pledged_pln"] or 0
        overdue = r["next_action_date"] and r["next_action_date"] < date.today().isoformat()
        flag = "⚠ " if overdue else "  "
        print(f"{r['company']:<26} {r['status']:<10} {r['pledged_pln'] or 0:>10,.0f} "
              f"{r['last_contact'] or '—':<12} {flag}{r['next_action'] or '—'}"
              f"{' (' + r['next_action_date'] + ')' if r['next_action_date'] else ''}")
    print(f"\nŁączna wartość pipeline: {total:,.0f} PLN")


def cmd_opp_set(args):
    conn = connect(args.db)
    confirm(Proposal(
        action="ZAPIS DO CRM — szansa sprzedażowa",
        summary=f"Aktualizacja „{args.company}” → status: {args.status}.",
        details=[
            f"wartość: {args.value:,.0f} PLN | pakiet: {args.package or '—'}",
            f"ostatni kontakt: {args.contacted or 'dziś'}",
            f"następna akcja: {args.next_action or '—'} (termin: {args.next_date or '—'})",
            f"notatka: {args.note or '—'}",
        ],
    ))
    sponsor_id = jdb.upsert_sponsor(conn, args.company, args.contact, args.email,
                                    args.package, args.status, args.value, args.note)
    conn.execute(
        "UPDATE sponsors SET last_contact=?, next_action=?, next_action_date=? WHERE id=?",
        (args.contacted or date.today().isoformat(), args.next_action, args.next_date, sponsor_id),
    )
    conn.commit()
    print(f"Zapisano szansę #{sponsor_id}.")


def cmd_due(args):
    conn = connect(args.db)
    today = date.today().isoformat()
    rows = conn.execute(
        "SELECT company, status, next_action, next_action_date FROM sponsors"
        " WHERE next_action_date IS NOT NULL AND next_action_date <= ?"
        " AND status NOT IN ('declined', 'signed') ORDER BY next_action_date",
        (today,),
    ).fetchall()
    schools = conn.execute(
        "SELECT name, town, status FROM schools WHERE status IN ('zgloszenie', 'rozmowa')"
        " ORDER BY created_at LIMIT 15"
    ).fetchall()
    print(f"# Akcje na dziś ({today})\n")
    if rows:
        for r in rows:
            r = dict(r)
            print(f"  ⚠ {r['next_action_date']}  {r['company']} [{r['status']}] → {r['next_action']}")
    else:
        print("  (brak zaległych akcji B2B — pipeline zaopiekowany)")
    if schools:
        print("\n# Szkoły/GOK czekające na odpowiedź")
        for s in schools:
            s = dict(s)
            print(f"  • {s['name']} ({s['town']}) [{s['status']}]")


# ------------------------------------------------------------------
# Szkoły i GOK-i
# ------------------------------------------------------------------

def cmd_school_add(args):
    conn = connect(args.db)
    if args.population == ">20k":
        print("UWAGA: miejscowość > 20 tys. mieszkańców jest poza kryterium misji fundacji.")
    confirm(Proposal(
        action="ZAPIS DO CRM — zgłoszenie szkoły/GOK",
        summary=f"Rejestracja: {args.name} ({args.town}).",
        details=[
            f"typ: {args.kind} | wielkość miejscowości: {args.population or '—'}",
            f"kontakt: {args.contact or '—'} <{args.email or '—'}>",
            f"szacowana liczba dzieci: {args.children or '—'}",
            "RODO: przetwarzamy dane kontaktowe zgłaszającego w celu obsługi zgłoszenia"
            " (art. 6 ust. 1 lit. f). Danych dzieci na tym etapie NIE rejestrujemy.",
        ],
    ))
    cur = conn.execute(
        "INSERT INTO schools (name, kind, town, population_band, contact_name, contact_email,"
        " status, children_estimate, notes, created_at, updated_at)"
        " VALUES (?, ?, ?, ?, ?, ?, 'zgloszenie', ?, ?, ?, ?)",
        (args.name, args.kind, args.town, args.population, args.contact, args.email,
         args.children, args.note, now(), now()),
    )
    conn.commit()
    print(f"Zarejestrowano zgłoszenie #{cur.lastrowid if hasattr(cur, 'lastrowid') else '(pg)'}.")


def cmd_school_set(args):
    conn = connect(args.db)
    row = conn.execute("SELECT * FROM schools WHERE id=?", (args.id,)).fetchone()
    if not row:
        sys.exit(f"Błąd: zgłoszenie #{args.id} nie istnieje.")
    row = dict(row)
    confirm(Proposal(
        action="ZAPIS DO CRM — status szkoły/GOK",
        summary=f"„{row['name']}” ({row['town']}): {row['status']} → {args.status}.",
        details=[f"notatka: {args.note or '—'}"],
    ))
    conn.execute("UPDATE schools SET status=?, notes=COALESCE(?, notes), updated_at=? WHERE id=?",
                 (args.status, args.note, now(), args.id))
    conn.commit()
    print("Zaktualizowano.")


def cmd_school_list(args):
    conn = connect(args.db)
    rows = conn.execute(
        "SELECT id, name, kind, town, population_band, status, children_estimate"
        " FROM schools ORDER BY updated_at DESC"
    ).fetchall()
    if not rows:
        print("Brak zgłoszeń.")
        return
    for r in rows:
        r = dict(r)
        print(f"#{r['id']:<3} [{r['status']:<12}] {r['name']:<34} {r['town']:<18} "
              f"{r['population_band'] or '—':<7} dzieci: {r['children_estimate'] or '?'}")


# ------------------------------------------------------------------
# Darczyńcy i wpłaty (widok na tabele Jarvisa)
# ------------------------------------------------------------------

def cmd_donations(args):
    from jarvis import reports
    conn = connect(args.db)
    if isinstance(conn, _PgAdapter):
        sys.exit("Raporty finansowe na Postgresie: użyj endpointu /api/stats lub SQL z README.")
    print(reports.finance_report(conn))
    print()
    print(reports.donors_report(conn))


# ------------------------------------------------------------------
# Wysyłka maili sekwencji outreach — [T/N] obowiązkowe
# ------------------------------------------------------------------

SEQUENCE = {
    1: ("{company} × 60 dzieci z {region} — jedna decyzja",
        """Dzień dobry {contact},

{hook}

Fundacja Szansa AI uczy dzieci z miejscowości do 20 tys. mieszkańców
bezpiecznego i mądrego korzystania ze sztucznej inteligencji. Przywozimy
mobilne pracownie tam, gdzie nie ma żadnych zajęć z technologii —
bezpłatnie dla rodzin.

50 000 zł finansuje pełny semestr dla 60 dzieci w jednej gminie — z imiennym
raportem wpływu do Państwa raportu ESG i odliczeniem darowizny od CIT
(do 10% dochodu).

Czy znajdą Państwo 20 minut w przyszłym tygodniu na rozmowę online?
Jeśli temat nietrafiony — wystarczy odpowiedź „nie".

Z poważaniem,
{sender}
Fundacja Szansa AI"""),
    2: ("Re: {company} × Szansa AI — jeden konkret",
        """Dzień dobry {contact},

wracam z konkretem zamiast przypominajki: {hook}

Poza efektem społecznym partnerzy najczęściej doceniają wolontariat
pracowniczy (Państwa zespół jako goście zajęć) i gotowe materiały do
komunikacji wewnętrznej.

Pasuje krótka rozmowa w tym lub przyszłym tygodniu?

PS Jeśli temat nietrafiony — odpowiedź „nie" wystarczy, nie będę wracał.

{sender}, Fundacja Szansa AI"""),
    3: ("Re: {company} × Szansa AI — zamykam temat",
        """Dzień dobry {contact},

to moja ostatnia wiadomość w tej sprawie — rozumiem, że teraz to nie priorytet.

Zostawiam na przyszłość: nasz raport i jawny cennik „ile kosztuje semestr
w gminie" oraz bezpłatny poradnik o dzieciach i AI dla pracowników-rodziców.
Gminy nadal będą czekać, gdyby temat wrócił.

Wszystkiego dobrego,
{sender}, Fundacja Szansa AI"""),
}


def cmd_email(args):
    conn = connect(args.db)
    row = conn.execute("SELECT * FROM sponsors WHERE company=?", (args.company,)).fetchone()
    if not row:
        sys.exit(f"Błąd: firmy „{args.company}” nie ma w CRM — dodaj: crm.py opp set --company ...")
    row = dict(row)
    step = args.step or min((row.get("sequence_step") or 0) + 1, 3)
    subject_tpl, body_tpl = SEQUENCE[step]
    values = {
        "company": args.company,
        "contact": args.contact or row.get("contact_name") or "Panie/Pani",
        "region": args.region or "Państwa regionu",
        "hook": args.hook or "[UZUPEŁNIJ PERSONALIZACJĘ — bez niej nie wysyłamy]",
        "sender": args.sender or "[imię i nazwisko]",
    }
    subject = subject_tpl.format(**values)
    body = body_tpl.format(**values)
    recipient = args.to or row.get("contact_email") or "(uzupełnij adres)"

    if "[UZUPEŁNIJ" in body:
        print("UWAGA: brak personalizacji (--hook). Zasada fundacji: bez personalizacji nie wysyłamy.")

    confirm(Proposal(
        action=f"KOLEJKOWANIE E-MAILA — sekwencja krok {step}/3",
        summary=f"Wiadomość do {recipient} ({args.company}).",
        details=[f"Temat: {subject}", "", body, "",
                 "Zatwierdzenie dodaje do kolejki. Wysyłka: crm.py send --id N (ponowne [T/N])."],
    ))
    outbox_id = jdb.queue_outbox(conn, "email", recipient, subject, body) \
        if not isinstance(conn, _PgAdapter) else _pg_queue(conn, recipient, subject, body)
    conn.execute("UPDATE sponsors SET sequence_step=?, last_contact=?, status=?,"
                 " next_action=?, next_action_date=? WHERE id=?",
                 (step, date.today().isoformat(),
                  "contacted" if row["status"] == "lead" else row["status"],
                  f"follow-up krok {step + 1}" if step < 3 else "pauza 60 dni",
                  _plus_days(4 if step == 1 else 6 if step == 2 else 60), row["id"]))
    conn.commit()
    print(f"Zakolejkowano jako #{outbox_id}. Wyślij: crm.py send --id {outbox_id}")


def _pg_queue(conn, recipient, subject, body):
    cur = conn.execute(
        "INSERT INTO outbox (kind, recipient, subject, body, status, created_at)"
        " VALUES ('email', ?, ?, ?, 'approved', ?) RETURNING id",
        (recipient, subject, body, now()))
    return dict(cur.fetchone())["id"]


def _plus_days(n: int) -> str:
    from datetime import timedelta
    return (date.today() + timedelta(days=n)).isoformat()


def cmd_send(args):
    conn = connect(args.db)
    row = conn.execute("SELECT * FROM outbox WHERE id=?", (args.id,)).fetchone()
    if not row:
        sys.exit(f"Błąd: pozycja #{args.id} nie istnieje.")
    row = dict(row)
    if row["status"] != "approved":
        sys.exit(f"Pozycja #{args.id} ma status „{row['status']}” — nie można wysłać.")

    smtp_host = os.environ.get("SMTP_HOST")
    via = f"SMTP {smtp_host}" if smtp_host else "eksport do pliku (SMTP nieskonfigurowane)"
    confirm(Proposal(
        action="WYSYŁKA E-MAILA — decyzja ostateczna",
        summary=f"Pozycja #{row['id']} → {row['recipient']} (kanał: {via}).",
        details=[f"Temat: {row['subject']}", "", row["body"]],
    ))

    if smtp_host:
        import smtplib
        from email.message import EmailMessage
        msg = EmailMessage()
        msg["From"] = os.environ.get("SMTP_FROM", os.environ.get("SMTP_USER", ""))
        msg["To"] = row["recipient"]
        msg["Subject"] = row["subject"]
        msg.set_content(row["body"])
        with smtplib.SMTP(smtp_host, int(os.environ.get("SMTP_PORT", "587"))) as smtp:
            smtp.starttls()
            smtp.login(os.environ["SMTP_USER"], os.environ["SMTP_PASSWORD"])
            smtp.send_message(msg)
        print(f"Wysłano do {row['recipient']} przez {smtp_host}.")
    else:
        export_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "data", "outbox_export")
        os.makedirs(export_dir, exist_ok=True)
        path = os.path.join(export_dir, f"{row['id']:04d}.eml.txt")
        with open(path, "w", encoding="utf-8") as fh:
            fh.write(f"Do: {row['recipient']}\nTemat: {row['subject']}\n\n{row['body']}\n")
        print(f"SMTP nieskonfigurowane — wyeksportowano do {path} (skopiuj do klienta poczty).")

    conn.execute("UPDATE outbox SET status='sent', sent_at=? WHERE id=?", (now(), row["id"]))
    conn.commit()


# ------------------------------------------------------------------
# CLI
# ------------------------------------------------------------------

def build_parser():
    p = argparse.ArgumentParser(prog="crm.py",
                                description="Mini-CRM Fundacji Szansa AI (mutacje za zgodą [T/N]).")
    p.add_argument("--db", default=None, help="ścieżka SQLite (ignorowane przy DATABASE_URL)")
    sub = p.add_subparsers(dest="command", required=True)

    sub.add_parser("pipeline", help="szanse B2B (odczyt)").set_defaults(func=cmd_pipeline)
    sub.add_parser("due", help="akcje na dziś (odczyt)").set_defaults(func=cmd_due)
    sub.add_parser("donations", help="raport wpłat i darczyńców (odczyt)").set_defaults(func=cmd_donations)

    opp = sub.add_parser("opp", help="szanse sprzedażowe")
    opps = opp.add_subparsers(dest="sub", required=True)
    os_ = opps.add_parser("set")
    os_.add_argument("--company", required=True)
    os_.add_argument("--status", default="lead",
                     choices=["lead", "contacted", "meeting", "offer", "signed", "declined"])
    os_.add_argument("--value", type=float, default=0.0, help="wartość szansy w PLN")
    os_.add_argument("--package", choices=["przyjaciel", "regionalny", "mecenas", "strategiczny"])
    os_.add_argument("--contact")
    os_.add_argument("--email")
    os_.add_argument("--contacted", help="data ostatniego kontaktu RRRR-MM-DD (domyślnie dziś)")
    os_.add_argument("--next-action", help="np. 'telefon po ofercie'")
    os_.add_argument("--next-date", help="termin następnej akcji RRRR-MM-DD")
    os_.add_argument("--note")
    os_.set_defaults(func=cmd_opp_set)

    sc = sub.add_parser("school", help="szkoły i GOK-i")
    scs = sc.add_subparsers(dest="sub", required=True)
    sa = scs.add_parser("add")
    sa.add_argument("--name", required=True)
    sa.add_argument("--kind", choices=["school", "gok", "library", "municipality"], default="school")
    sa.add_argument("--town", required=True)
    sa.add_argument("--population", choices=["<5k", "5-10k", "10-20k", ">20k"])
    sa.add_argument("--contact")
    sa.add_argument("--email")
    sa.add_argument("--children", type=int)
    sa.add_argument("--note")
    sa.set_defaults(func=cmd_school_add)
    ss = scs.add_parser("set")
    ss.add_argument("--id", type=int, required=True)
    ss.add_argument("--status", required=True,
                    choices=["zgloszenie", "rozmowa", "porozumienie", "pilotaz", "semestr", "odrzucone"])
    ss.add_argument("--note")
    ss.set_defaults(func=cmd_school_set)
    scs.add_parser("list").set_defaults(func=cmd_school_list)

    em = sub.add_parser("email", help="przygotuj mail sekwencji (krok 1–3) → [T/N] → kolejka")
    em.add_argument("--company", required=True)
    em.add_argument("--step", type=int, choices=[1, 2, 3],
                    help="domyślnie: kolejny krok sekwencji dla tej firmy")
    em.add_argument("--to")
    em.add_argument("--contact")
    em.add_argument("--region")
    em.add_argument("--hook", help="personalizowane 1. zdanie (obowiązkowe wg zasad outreach)")
    em.add_argument("--sender")
    em.set_defaults(func=cmd_email)

    sn = sub.add_parser("send", help="wyślij zakolejkowany mail → [T/N] → SMTP lub eksport")
    sn.add_argument("--id", type=int, required=True)
    sn.set_defaults(func=cmd_send)
    return p


def main(argv=None) -> int:
    args = build_parser().parse_args(argv)
    try:
        args.func(args)
    except ApprovalDenied as exc:
        print(f"✖ {exc} — nic nie zostało zapisane ani wysłane.")
        return 1
    except NonInteractiveError as exc:
        print(f"✖ {exc}", file=sys.stderr)
        return 3
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
