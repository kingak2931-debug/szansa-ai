"""Read-only endpoint statystyk fundacji (Vercel Serverless Function, Python).

GET /api/stats → JSON: suma darowizn, wartość pipeline, liczba szkół wg statusu.
Celowo TYLKO odczyt zagregowanych liczb — endpoint nie zwraca danych osobowych
(RODO) i nie przyjmuje zapisów (mutacje wyłącznie przez crm.py z bramką [T/N]).

Wymaga: zmienna środowiskowa DATABASE_URL (Vercel Postgres/Neon),
zależność psycopg[binary] w requirements.txt obok tego pliku.
Opcjonalnie STATS_TOKEN — gdy ustawiony, wymagany nagłówek Authorization: Bearer <token>.
"""

import json
import os
from http.server import BaseHTTPRequestHandler

import psycopg


class handler(BaseHTTPRequestHandler):  # nazwa wymagana przez runtime Vercel
    def do_GET(self):
        token = os.environ.get("STATS_TOKEN")
        if token and self.headers.get("Authorization") != f"Bearer {token}":
            self._respond(401, {"error": "unauthorized"})
            return
        try:
            with psycopg.connect(os.environ["DATABASE_URL"]) as conn, conn.cursor() as cur:
                cur.execute("SELECT COALESCE(SUM(amount_pln),0), COUNT(*) FROM donations")
                donations_sum, donations_count = cur.fetchone()
                cur.execute("SELECT COALESCE(SUM(pledged_pln),0) FROM sponsors WHERE status='signed'")
                (signed_sum,) = cur.fetchone()
                cur.execute("SELECT status, COUNT(*) FROM schools GROUP BY status")
                schools = {status: count for status, count in cur.fetchall()}
            self._respond(200, {
                "goal_pln": 2_000_000,
                "donations_pln": float(donations_sum),
                "donations_count": donations_count,
                "sponsors_signed_pln": float(signed_sum),
                "schools_by_status": schools,
            })
        except Exception:
            # bez szczegółów błędu na zewnątrz (bezpieczeństwo)
            self._respond(500, {"error": "internal"})

    def _respond(self, code, payload):
        body = json.dumps(payload).encode()
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Cache-Control", "s-maxage=300")
        self.end_headers()
        self.wfile.write(body)
