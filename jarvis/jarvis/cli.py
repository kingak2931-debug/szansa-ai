"""Jarvis CLI — zarządzanie operacjami Fundacji Szansa AI.

Model bezpieczeństwa:
- komendy odczytu (report, list) działają swobodnie;
- KAŻDA komenda mutująca (zapis do bazy, kolejkowanie i wysyłka e-maili/postów)
  najpierw prezentuje pełną propozycję akcji i czeka na zgodę operatora [T/N];
- płatności nie są i nie będą wykonywane przez Jarvisa — system może jedynie
  raportować stan środków (decyzja projektowa: przelewy autoryzuje wyłącznie
  człowiek w systemie bankowym, zgodnie z zasadą dwóch podpisów zarządu).
"""

from __future__ import annotations

import argparse
import os
import sys

from . import db, proposals, reports
from .approval import ApprovalDenied, NonInteractiveError, Proposal, confirm

TIERS = {100: "godzinę warsztatów AI", 250: "dzień warsztatów AI", 500: "semestr zajęć jednego dziecka"}


def _conn(args):
    return db.connect(args.db)


# ---------------- komendy odczytu ----------------

def cmd_report(args):
    conn = _conn(args)
    fn = {
        "finance": reports.finance_report,
        "donors": reports.donors_report,
        "pipeline": reports.pipeline_report,
        "grants": reports.grants_report,
        "full": reports.full_report,
    }[args.kind]
    print(fn(conn))


def cmd_outbox_list(args):
    conn = _conn(args)
    rows = conn.execute(
        "SELECT id, kind, recipient, subject, status, created_at FROM outbox ORDER BY id DESC"
    ).fetchall()
    if not rows:
        print("Kolejka pusta.")
        return
    for r in rows:
        print(f"#{r['id']:<4} [{r['status']:<9}] {r['kind']:<6} → {r['recipient'] or '-':<30} "
              f"{(r['subject'] or '(post)')[:40]}  ({r['created_at']})")


def cmd_audit(args):
    conn = _conn(args)
    for r in conn.execute("SELECT at, action, details FROM audit_log ORDER BY id DESC LIMIT ?",
                          (args.limit,)):
        print(f"{r['at']}  {r['action']:<22} {r['details']}")


# ---------------- komendy mutujące (bramka [T/N]) ----------------

def cmd_donor_add(args):
    confirm(Proposal(
        action="ZAPIS DO BAZY — nowy darczyńca",
        summary=f"Dodanie darczyńcy „{args.name}” ({args.kind}).",
        details=[
            f"e-mail: {args.email or '—'}",
            f"cykliczny: {'tak' if args.recurring else 'nie'}",
            f"zgoda na publiczne podziękowania: {'tak' if args.consent else 'NIE'}",
            "Podstawa RODO: art. 6 ust. 1 lit. b (obsługa darowizny).",
        ],
    ))
    conn = _conn(args)
    donor_id = db.add_donor(conn, args.name, args.email, args.kind, args.recurring, args.consent)
    print(f"Dodano darczyńcę #{donor_id}.")


def cmd_donation_add(args):
    conn = _conn(args)
    donor = conn.execute("SELECT * FROM donors WHERE id=?", (args.donor_id,)).fetchone()
    if not donor:
        sys.exit(f"Błąd: darczyńca #{args.donor_id} nie istnieje (jarvis donor add ...).")
    cert_no = None
    details = [f"kwota: {args.amount:,.2f} PLN", f"kanał: {args.channel}", f"data: {args.date or 'dziś'}"]
    if args.cert:
        if int(args.amount) not in TIERS:
            sys.exit(f"Certyfikat cegiełki dostępny dla progów: {sorted(TIERS)} PLN.")
        cert_no = db.next_certificate_no(conn)
        details.append(f"certyfikat cegiełki: {cert_no} ({TIERS[int(args.amount)]})")
    confirm(Proposal(
        action="ZAPIS DO BAZY — nowa darowizna",
        summary=f"Zaksięgowanie darowizny od „{donor['name']}” (#{donor['id']}).",
        details=details,
    ))
    donation_id = db.add_donation(conn, args.donor_id, args.amount, args.date, args.channel,
                                  certificate_no=cert_no)
    print(f"Zaksięgowano darowiznę #{donation_id}." + (f" Certyfikat: {cert_no}" if cert_no else ""))
    if cert_no:
        print("\nPropozycja treści certyfikatu (wygeneruj PDF ręcznie lub przez szablon):\n")
        print(proposals.certificate_text(donor["name"], TIERS[int(args.amount)], cert_no))


def cmd_sponsor_set(args):
    confirm(Proposal(
        action="ZAPIS DO BAZY — pipeline sponsorski",
        summary=f"Zapis firmy „{args.company}” ze statusem „{args.status}”.",
        details=[
            f"pakiet: {args.package or '—'}",
            f"zadeklarowana kwota: {args.pledged:,.0f} PLN",
            f"kontakt: {args.contact or '—'} <{args.email or '—'}>",
            f"notatka: {args.notes or '—'}",
        ],
    ))
    conn = _conn(args)
    sponsor_id = db.upsert_sponsor(conn, args.company, args.contact, args.email,
                                   args.package, args.status, args.pledged, args.notes)
    print(f"Zapisano sponsora #{sponsor_id}.")


def cmd_grant_add(args):
    confirm(Proposal(
        action="ZAPIS DO BAZY — kalendarz grantowy",
        summary=f"Dodanie naboru „{args.program}” ({args.funder}).",
        details=[f"deadline: {args.deadline or '—'}", f"kwota: {args.amount or '—'}",
                 f"status: {args.status}"],
    ))
    conn = _conn(args)
    grant_id = db.add_grant(conn, args.program, args.funder, args.deadline, args.amount,
                            args.status, args.notes)
    print(f"Dodano grant #{grant_id}.")


def cmd_propose_email(args):
    conn = _conn(args)
    if args.template == "sponsor":
        subject, body = proposals.sponsor_outreach_email(
            args.company, args.contact, args.package, args.region or "Państwa regionu", args.hook)
        recipient = args.to or "(uzupełnij adres)"
    else:  # thanks
        donation = conn.execute(
            "SELECT x.*, d.name, d.email FROM donations x JOIN donors d ON d.id=x.donor_id WHERE x.id=?",
            (args.donation_id,),
        ).fetchone()
        if not donation:
            sys.exit(f"Błąd: darowizna #{args.donation_id} nie istnieje.")
        subject, body = proposals.donor_thankyou_email(
            donation["name"], donation["amount_pln"], donation["certificate_no"])
        recipient = args.to or donation["email"] or "(brak adresu w bazie)"

    confirm(Proposal(
        action="KOLEJKOWANIE E-MAILA (bez wysyłki)",
        summary=f"Zapis wersji roboczej e-maila do: {recipient}",
        details=[f"Temat: {subject}", "", body, "",
                 "UWAGA: zatwierdzenie dodaje wiadomość do kolejki outbox.",
                 "Wysyłka to ODRĘBNA akcja (jarvis outbox send), również zatwierdzana."],
    ))
    outbox_id = db.queue_outbox(conn, "email", recipient, subject, body)
    print(f"Dodano do kolejki jako #{outbox_id}. Wysyłka: jarvis outbox send --id {outbox_id}")


def cmd_propose_post(args):
    conn = _conn(args)
    kw = {}
    if args.place:
        kw["place"] = args.place
    if args.text:
        kw["what"] = kw["goal"] = kw["details"] = args.text
    body = proposals.social_post(args.kind, **kw)
    confirm(Proposal(
        action="KOLEJKOWANIE POSTA (bez publikacji)",
        summary=f"Wersja robocza posta ({args.kind}) na: {args.platform}",
        details=[body, "", "Publikacja to ODRĘBNA, ręczna akcja operatora."],
    ))
    outbox_id = db.queue_outbox(conn, "post", args.platform, None, body)
    print(f"Dodano do kolejki jako #{outbox_id}.")


def cmd_outbox_send(args):
    conn = _conn(args)
    row = conn.execute("SELECT * FROM outbox WHERE id=?", (args.id,)).fetchone()
    if not row:
        sys.exit(f"Błąd: pozycja #{args.id} nie istnieje.")
    if row["status"] != "approved":
        sys.exit(f"Pozycja #{args.id} ma status „{row['status']}” — nie można wysłać.")
    confirm(Proposal(
        action="WYSYŁKA / PUBLIKACJA",
        summary=f"Finalne przekazanie pozycji #{row['id']} ({row['kind']}) → {row['recipient']}",
        details=[f"Temat: {row['subject'] or '(post)'}", "", row["body"]],
    ))
    export_dir = args.export_dir or os.path.join(os.path.dirname(db.DEFAULT_DB), "outbox_export")
    os.makedirs(export_dir, exist_ok=True)
    ext = "eml.txt" if row["kind"] == "email" else "post.txt"
    path = os.path.join(export_dir, f"{row['id']:04d}.{ext}")
    with open(path, "w", encoding="utf-8") as fh:
        header = f"Do/Platforma: {row['recipient']}\nTemat: {row['subject'] or '-'}\n\n"
        fh.write(header + row["body"] + "\n")
    db.mark_outbox_sent(conn, row["id"])
    print(f"Wyeksportowano do {path} i oznaczono jako wysłane.")
    print("(Integracja SMTP/API platform celowo wymaga osobnej konfiguracji — "
          "do tego czasu plik kopiujesz do klienta poczty/platformy ręcznie.)")


# ---------------- parser ----------------

def build_parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(
        prog="jarvis",
        description="System zarządzania Fundacji Szansa AI. Akcje mutujące wymagają zgody [T/N].",
    )
    p.add_argument("--db", default=None, help="ścieżka do bazy SQLite (domyślnie data/jarvis.db)")
    sub = p.add_subparsers(dest="command", required=True)

    r = sub.add_parser("report", help="raporty (odczyt)")
    r.add_argument("kind", choices=["finance", "donors", "pipeline", "grants", "full"])
    r.set_defaults(func=cmd_report)

    d = sub.add_parser("donor", help="darczyńcy")
    dsub = d.add_subparsers(dest="sub", required=True)
    da = dsub.add_parser("add")
    da.add_argument("--name", required=True)
    da.add_argument("--email")
    da.add_argument("--kind", choices=["individual", "company"], default="individual")
    da.add_argument("--recurring", action="store_true")
    da.add_argument("--consent", action="store_true",
                    help="darczyńca zgodził się na publiczne podziękowania (RODO)")
    da.set_defaults(func=cmd_donor_add)

    n = sub.add_parser("donation", help="darowizny")
    nsub = n.add_subparsers(dest="sub", required=True)
    na = nsub.add_parser("add")
    na.add_argument("--donor-id", type=int, required=True)
    na.add_argument("--amount", type=float, required=True)
    na.add_argument("--date", help="RRRR-MM-DD (domyślnie dziś)")
    na.add_argument("--channel", choices=["transfer", "online", "event", "crowdfunding"],
                    default="transfer")
    na.add_argument("--cert", action="store_true", help="wygeneruj certyfikat cegiełki (100/250/500)")
    na.set_defaults(func=cmd_donation_add)

    s = sub.add_parser("sponsor", help="pipeline B2B")
    ssub = s.add_subparsers(dest="sub", required=True)
    sa = ssub.add_parser("set", help="dodaj lub zaktualizuj firmę")
    sa.add_argument("--company", required=True)
    sa.add_argument("--contact")
    sa.add_argument("--email")
    sa.add_argument("--package", choices=list(proposals.PACKAGES))
    sa.add_argument("--status", choices=["lead", "contacted", "meeting", "offer", "signed", "declined"],
                    default="lead")
    sa.add_argument("--pledged", type=float, default=0.0)
    sa.add_argument("--notes")
    sa.set_defaults(func=cmd_sponsor_set)

    g = sub.add_parser("grant", help="kalendarz grantowy")
    gsub = g.add_subparsers(dest="sub", required=True)
    ga = gsub.add_parser("add")
    ga.add_argument("--program", required=True)
    ga.add_argument("--funder", required=True)
    ga.add_argument("--deadline", help="RRRR-MM-DD")
    ga.add_argument("--amount", type=float)
    ga.add_argument("--status", choices=["watch", "preparing", "submitted", "won", "lost"],
                    default="watch")
    ga.add_argument("--notes")
    ga.set_defaults(func=cmd_grant_add)

    pr = sub.add_parser("propose", help="propozycje treści (e-mail / post)")
    prsub = pr.add_subparsers(dest="sub", required=True)
    pe = prsub.add_parser("email")
    pe.add_argument("template", choices=["sponsor", "thanks"])
    pe.add_argument("--to")
    pe.add_argument("--company")
    pe.add_argument("--contact")
    pe.add_argument("--package", choices=list(proposals.PACKAGES), default="regionalny")
    pe.add_argument("--region")
    pe.add_argument("--hook", help="personalizowane pierwsze zdanie")
    pe.add_argument("--donation-id", type=int, help="dla szablonu thanks")
    pe.set_defaults(func=cmd_propose_email)
    pp = prsub.add_parser("post")
    pp.add_argument("kind", choices=["milestone", "nabor", "zbiorka"])
    pp.add_argument("--platform", choices=["linkedin", "facebook", "instagram"], required=True)
    pp.add_argument("--place")
    pp.add_argument("--text")
    pp.set_defaults(func=cmd_propose_post)

    o = sub.add_parser("outbox", help="kolejka wychodząca")
    osub = o.add_subparsers(dest="sub", required=True)
    osub.add_parser("list").set_defaults(func=cmd_outbox_list)
    osend = osub.add_parser("send")
    osend.add_argument("--id", type=int, required=True)
    osend.add_argument("--export-dir")
    osend.set_defaults(func=cmd_outbox_send)

    a = sub.add_parser("audit", help="dziennik zdarzeń (odczyt)")
    a.add_argument("--limit", type=int, default=30)
    a.set_defaults(func=cmd_audit)

    return p


def main(argv=None) -> int:
    args = build_parser().parse_args(argv)
    # walidacje między-argumentowe
    if getattr(args, "sub", None) == "email" and args.template == "sponsor" and not (args.company and args.contact):
        print("Szablon sponsor wymaga --company i --contact.", file=sys.stderr)
        return 2
    if getattr(args, "sub", None) == "email" and args.template == "thanks" and not args.donation_id:
        print("Szablon thanks wymaga --donation-id.", file=sys.stderr)
        return 2
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
