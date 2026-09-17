"""Testy Jarvisa — w szczególności bramki zatwierdzania [T/N].

Uruchomienie: python3 -m unittest discover -s tests (z katalogu jarvis/).
"""

import io
import os
import sys
import tempfile
import unittest

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from jarvis import db, proposals, reports  # noqa: E402
from jarvis.approval import ApprovalDenied, NonInteractiveError, Proposal, confirm  # noqa: E402


def make_inputs(*answers):
    it = iter(answers)
    return lambda _prompt: next(it)


class TestApprovalGate(unittest.TestCase):
    def proposal(self):
        return Proposal(action="TEST", summary="testowa akcja")

    def test_yes_variants_approve(self):
        for answer in ("T", "t", "tak", "Y", "yes"):
            self.assertTrue(confirm(self.proposal(), _input=make_inputs(answer)))

    def test_no_raises_denied(self):
        with self.assertRaises(ApprovalDenied):
            confirm(self.proposal(), _input=make_inputs("n"))

    def test_garbage_reprompts_until_valid(self):
        self.assertTrue(confirm(self.proposal(), _input=make_inputs("ok", "", "T")))

    def test_non_interactive_refuses(self):
        fake_stdin = io.StringIO("T\n")  # nie-tty: nawet z "T" na wejściu ma odmówić
        with self.assertRaises(NonInteractiveError):
            confirm(self.proposal(), _stdin=fake_stdin)


class TestDatabase(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.conn = db.connect(os.path.join(self.tmp.name, "test.db"))

    def tearDown(self):
        self.conn.close()
        self.tmp.cleanup()

    def test_donation_flow_and_reports(self):
        donor_id = db.add_donor(self.conn, "Jan Kowalski", "jan@example.pl", recurring=True)
        db.add_donation(self.conn, donor_id, 250.0, channel="online",
                        certificate_no=db.next_certificate_no(self.conn))
        db.upsert_sponsor(self.conn, "TechCorp", package="regionalny",
                          status="signed", pledged_pln=50000)
        db.add_grant(self.conn, "NOWEFIO 2026", "NIW-CRSO", deadline="2026-11-30",
                     amount_pln=300000, status="preparing")

        finance = reports.finance_report(self.conn)
        self.assertIn("250.00 PLN", finance.replace(" ", " ").replace(",", ""))
        self.assertIn("50,000", finance.replace(" ", ","))
        self.assertIn("Jan Kowalski", reports.donors_report(self.conn))
        self.assertIn("TechCorp", reports.pipeline_report(self.conn))
        self.assertIn("NOWEFIO 2026", reports.grants_report(self.conn, days_ahead=100000))

    def test_certificate_numbering_increments(self):
        donor_id = db.add_donor(self.conn, "Anna")
        first = db.next_certificate_no(self.conn)
        db.add_donation(self.conn, donor_id, 100, certificate_no=first)
        second = db.next_certificate_no(self.conn)
        self.assertNotEqual(first, second)
        self.assertTrue(second.endswith("0002"))

    def test_audit_log_records_writes(self):
        donor_id = db.add_donor(self.conn, "Ewa")
        db.add_donation(self.conn, donor_id, 50)
        actions = [r["action"] for r in self.conn.execute("SELECT action FROM audit_log")]
        self.assertIn("donor.add", actions)
        self.assertIn("donation.add", actions)

    def test_outbox_lifecycle(self):
        subject, body = proposals.sponsor_outreach_email("ACME", "Pani Nowak")
        outbox_id = db.queue_outbox(self.conn, "email", "kontakt@acme.pl", subject, body)
        row = self.conn.execute("SELECT * FROM outbox WHERE id=?", (outbox_id,)).fetchone()
        self.assertEqual(row["status"], "approved")
        db.mark_outbox_sent(self.conn, outbox_id)
        row = self.conn.execute("SELECT * FROM outbox WHERE id=?", (outbox_id,)).fetchone()
        self.assertEqual(row["status"], "sent")


class TestProposals(unittest.TestCase):
    def test_sponsor_email_mentions_package(self):
        subject, body = proposals.sponsor_outreach_email(
            "ACME", "Pan Kowalski", package="mecenas", region="Podlasia")
        self.assertIn("ACME", subject)
        self.assertIn("Mecenas Edukacji", body)

    def test_post_kinds(self):
        for kind in ("milestone", "nabor", "zbiorka"):
            self.assertTrue(proposals.social_post(kind, place="Hajnówka"))
        with self.assertRaises(ValueError):
            proposals.social_post("spam")

    def test_certificate_text(self):
        text = proposals.certificate_text("Jan", "godzinę warsztatów AI", "SZANSA-2026-0001")
        self.assertIn("Jan", text)
        self.assertIn("SZANSA-2026-0001", text)


if __name__ == "__main__":
    unittest.main()
