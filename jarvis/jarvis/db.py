"""Warstwa danych (SQLite). Odczyt jest wolny; każdy ZAPIS przechodzi
przez bramkę zatwierdzania w warstwie CLI — funkcje tutaj są wywoływane
dopiero PO uzyskaniu zgody operatora."""

from __future__ import annotations

import os
import sqlite3
from datetime import date, datetime

DEFAULT_DB = os.environ.get("JARVIS_DB", os.path.join(os.path.dirname(__file__), "..", "data", "jarvis.db"))

SCHEMA = """
CREATE TABLE IF NOT EXISTS donors (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT,
    kind TEXT NOT NULL DEFAULT 'individual'   -- individual | company
        CHECK (kind IN ('individual', 'company')),
    recurring INTEGER NOT NULL DEFAULT 0,      -- 1 = darczyńca cykliczny
    consent_public_thanks INTEGER NOT NULL DEFAULT 0,  -- RODO: zgoda na publiczne podziękowanie
    created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS donations (
    id INTEGER PRIMARY KEY,
    donor_id INTEGER NOT NULL REFERENCES donors(id),
    amount_pln REAL NOT NULL CHECK (amount_pln > 0),
    donated_on TEXT NOT NULL,                  -- ISO date
    channel TEXT NOT NULL DEFAULT 'transfer'   -- transfer | online | event | crowdfunding
        CHECK (channel IN ('transfer', 'online', 'event', 'crowdfunding')),
    purpose TEXT NOT NULL DEFAULT 'cele statutowe',
    certificate_no TEXT,                       -- SZANSA-RRRR-N dla cegiełek
    created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS sponsors (
    id INTEGER PRIMARY KEY,
    company TEXT NOT NULL,
    contact_name TEXT,
    contact_email TEXT,
    package TEXT,                              -- przyjaciel | regionalny | mecenas | strategiczny
    status TEXT NOT NULL DEFAULT 'lead'        -- lead | contacted | meeting | offer | signed | declined
        CHECK (status IN ('lead', 'contacted', 'meeting', 'offer', 'signed', 'declined')),
    pledged_pln REAL NOT NULL DEFAULT 0,
    notes TEXT,
    updated_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS grants (
    id INTEGER PRIMARY KEY,
    program TEXT NOT NULL,                     -- np. NOWEFIO 2026
    funder TEXT NOT NULL,                      -- np. NIW-CRSO
    deadline TEXT,                             -- ISO date naboru
    amount_pln REAL,
    status TEXT NOT NULL DEFAULT 'watch'       -- watch | preparing | submitted | won | lost
        CHECK (status IN ('watch', 'preparing', 'submitted', 'won', 'lost')),
    notes TEXT,
    updated_at TEXT NOT NULL
);
-- Kolejka akcji wychodzących: e-maile, posty. Nic stąd nie wychodzi
-- automatycznie — status 'approved' oznacza zgodę operatora na treść,
-- a finalna wysyłka to odrębna, również zatwierdzana akcja.
CREATE TABLE IF NOT EXISTS outbox (
    id INTEGER PRIMARY KEY,
    kind TEXT NOT NULL CHECK (kind IN ('email', 'post')),
    recipient TEXT,                            -- adres / platforma
    subject TEXT,
    body TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'approved'    -- approved | sent | cancelled
        CHECK (status IN ('approved', 'sent', 'cancelled')),
    created_at TEXT NOT NULL,
    sent_at TEXT
);
CREATE TABLE IF NOT EXISTS audit_log (
    id INTEGER PRIMARY KEY,
    at TEXT NOT NULL,
    action TEXT NOT NULL,
    details TEXT NOT NULL,
    approved_by_operator INTEGER NOT NULL DEFAULT 1
);
"""


def connect(path: str | None = None) -> sqlite3.Connection:
    db_path = path or DEFAULT_DB
    os.makedirs(os.path.dirname(os.path.abspath(db_path)), exist_ok=True)
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    conn.executescript(SCHEMA)
    return conn


def now() -> str:
    return datetime.now().isoformat(timespec="seconds")


def audit(conn: sqlite3.Connection, action: str, details: str) -> None:
    conn.execute(
        "INSERT INTO audit_log (at, action, details) VALUES (?, ?, ?)",
        (now(), action, details),
    )


# ---------- zapisy (wywoływane wyłącznie po zatwierdzeniu [T/N]) ----------

def add_donor(conn, name, email=None, kind="individual", recurring=False, consent=False) -> int:
    cur = conn.execute(
        "INSERT INTO donors (name, email, kind, recurring, consent_public_thanks, created_at)"
        " VALUES (?, ?, ?, ?, ?, ?)",
        (name, email, kind, int(recurring), int(consent), now()),
    )
    audit(conn, "donor.add", f"{name} ({kind})")
    conn.commit()
    return cur.lastrowid


def add_donation(conn, donor_id, amount_pln, donated_on=None, channel="transfer",
                 purpose="cele statutowe", certificate_no=None) -> int:
    cur = conn.execute(
        "INSERT INTO donations (donor_id, amount_pln, donated_on, channel, purpose,"
        " certificate_no, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
        (donor_id, amount_pln, donated_on or date.today().isoformat(), channel,
         purpose, certificate_no, now()),
    )
    audit(conn, "donation.add", f"darczyńca #{donor_id}: {amount_pln:.2f} PLN ({channel})")
    conn.commit()
    return cur.lastrowid


def upsert_sponsor(conn, company, contact_name=None, contact_email=None,
                   package=None, status="lead", pledged_pln=0.0, notes=None) -> int:
    row = conn.execute("SELECT id FROM sponsors WHERE company = ?", (company,)).fetchone()
    if row:
        conn.execute(
            "UPDATE sponsors SET contact_name=COALESCE(?, contact_name),"
            " contact_email=COALESCE(?, contact_email), package=COALESCE(?, package),"
            " status=?, pledged_pln=?, notes=COALESCE(?, notes), updated_at=? WHERE id=?",
            (contact_name, contact_email, package, status, pledged_pln, notes, now(), row["id"]),
        )
        sponsor_id = row["id"]
    else:
        cur = conn.execute(
            "INSERT INTO sponsors (company, contact_name, contact_email, package, status,"
            " pledged_pln, notes, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            (company, contact_name, contact_email, package, status, pledged_pln, notes, now()),
        )
        sponsor_id = cur.lastrowid
    audit(conn, "sponsor.upsert", f"{company} → {status} ({pledged_pln:.0f} PLN)")
    conn.commit()
    return sponsor_id


def add_grant(conn, program, funder, deadline=None, amount_pln=None,
              status="watch", notes=None) -> int:
    cur = conn.execute(
        "INSERT INTO grants (program, funder, deadline, amount_pln, status, notes, updated_at)"
        " VALUES (?, ?, ?, ?, ?, ?, ?)",
        (program, funder, deadline, amount_pln, status, notes, now()),
    )
    audit(conn, "grant.add", f"{program} ({funder}), nabór do {deadline}")
    conn.commit()
    return cur.lastrowid


def queue_outbox(conn, kind, recipient, subject, body) -> int:
    cur = conn.execute(
        "INSERT INTO outbox (kind, recipient, subject, body, status, created_at)"
        " VALUES (?, ?, ?, ?, 'approved', ?)",
        (kind, recipient, subject, body, now()),
    )
    audit(conn, f"outbox.queue.{kind}", f"do: {recipient} | {subject or '(post)'}")
    conn.commit()
    return cur.lastrowid


def mark_outbox_sent(conn, outbox_id) -> None:
    conn.execute("UPDATE outbox SET status='sent', sent_at=? WHERE id=?", (now(), outbox_id))
    audit(conn, "outbox.sent", f"pozycja #{outbox_id}")
    conn.commit()


def next_certificate_no(conn) -> str:
    year = date.today().year
    row = conn.execute(
        "SELECT COUNT(*) AS c FROM donations WHERE certificate_no LIKE ?",
        (f"SZANSA-{year}-%",),
    ).fetchone()
    return f"SZANSA-{year}-{row['c'] + 1:04d}"
