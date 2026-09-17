"""Jarvis — system zarządzania operacjami Fundacji Szansa AI.

Zasada nadrzędna: ŻADNA akcja zmieniająca stan (zapis do bazy, wysyłka
e-maila, publikacja posta, płatność) nie wykonuje się automatycznie.
Każda przechodzi przez bramkę zatwierdzenia (jarvis.approval) i czeka
na jawną zgodę operatora [T/N].
"""

__version__ = "0.1.0"

import sys as _sys

# Polska konsola Windows (cp1250) nie zna znaków ✔/⚠/ramek używanych w wydrukach
# Jarvisa i CRM — wymuszamy UTF-8 na stdout/stderr, zanim cokolwiek wydrukujemy.
for _stream in (_sys.stdout, _sys.stderr):
    _enc = getattr(_stream, "encoding", None)
    if _enc and _enc.lower() not in ("utf-8", "utf8") and hasattr(_stream, "reconfigure"):
        _stream.reconfigure(encoding="utf-8", errors="replace")
