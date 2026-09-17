"""Testy mini-CRM (jarvis/crm/crm.py) na backendzie SQLite."""

import gc
import io
import os
import sys
import tempfile
import unittest
from contextlib import redirect_stdout
from datetime import date, timedelta

BASE = os.path.join(os.path.dirname(__file__), "..")
sys.path.insert(0, BASE)
sys.path.insert(0, os.path.join(BASE, "crm"))

import crm  # noqa: E402
from jarvis import db as jdb  # noqa: E402


class CrmTestCase(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.db_path = os.path.join(self.tmp.name, "crm.db")
        os.environ.pop("DATABASE_URL", None)

    def tearDown(self):
        # Windows: plik SQLite musi być zwolniony przed usunięciem katalogu;
        # połączenia otwierane wewnątrz komend CRM zwalnia dopiero GC.
        gc.collect()
        self.tmp.cleanup()

    def _conn(self):
        return crm.connect(self.db_path)

    def test_migration_adds_crm_columns_and_schools(self):
        conn = self._conn()
        cols = {r["name"] for r in conn.execute("PRAGMA table_info(sponsors)")}
        self.assertTrue({"last_contact", "next_action", "next_action_date", "sequence_step"} <= cols)
        conn.execute("SELECT * FROM schools")  # tabela istnieje
        # migracja jest idempotentna
        crm.connect(self.db_path)

    def test_school_lifecycle(self):
        conn = self._conn()
        conn.execute(
            "INSERT INTO schools (name, kind, town, status, created_at, updated_at)"
            " VALUES ('SP Hajnówka', 'school', 'Hajnówka', 'zgloszenie', ?, ?)",
            (crm.now(), crm.now()))
        conn.commit()
        conn.execute("UPDATE schools SET status='pilotaz' WHERE name='SP Hajnówka'")
        row = conn.execute("SELECT status FROM schools WHERE name='SP Hajnówka'").fetchone()
        self.assertEqual(row["status"], "pilotaz")

    def test_pipeline_and_due_render(self):
        conn = self._conn()
        jdb.upsert_sponsor(conn, "TechCorp", status="meeting", pledged_pln=50000)
        yesterday = (date.today() - timedelta(days=1)).isoformat()
        conn.execute("UPDATE sponsors SET next_action='telefon', next_action_date=?"
                     " WHERE company='TechCorp'", (yesterday,))
        conn.commit()

        args = type("A", (), {"db": self.db_path})()
        out = io.StringIO()
        with redirect_stdout(out):
            crm.cmd_pipeline(args)
            crm.cmd_due(args)
        text = out.getvalue()
        self.assertIn("TechCorp", text)
        self.assertIn("⚠", text)          # zaległa akcja oznaczona
        self.assertIn("telefon", text)

    def test_sequence_templates_format(self):
        for step in (1, 2, 3):
            subject, body = crm.SEQUENCE[step]
            rendered = body.format(company="ACME", contact="Pani Ewo",
                                   region="Podlasia", hook="hook", sender="Jan")
            self.assertNotIn("{", rendered)
            self.assertIn("ACME", subject.format(company="ACME", region="Podlasia",
                                                 contact="x", hook="h", sender="s")
                          ) if "{company}" in subject else None

    def test_email_requires_existing_company(self):
        args = type("A", (), {"db": self.db_path, "company": "Nieistniejąca",
                              "step": 1, "to": None, "contact": None, "region": None,
                              "hook": "x", "sender": "y"})()
        with self.assertRaises(SystemExit):
            crm.cmd_email(args)

    def test_send_refuses_non_approved(self):
        conn = self._conn()
        outbox_id = jdb.queue_outbox(conn, "email", "a@b.pl", "T", "B")
        jdb.mark_outbox_sent(conn, outbox_id)
        args = type("A", (), {"db": self.db_path, "id": outbox_id})()
        with self.assertRaises(SystemExit):
            crm.cmd_send(args)

    def test_plus_days(self):
        self.assertEqual(crm._plus_days(0), date.today().isoformat())
        self.assertGreater(crm._plus_days(4), date.today().isoformat())


if __name__ == "__main__":
    unittest.main()
