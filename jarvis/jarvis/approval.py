"""Bramka zatwierdzania — serce zasady „autonomia z nadzorem".

Każda akcja mutująca (baza danych, e-mail, post, płatność) MUSI przejść
przez :func:`confirm`. Nie istnieje flaga ``--yes`` ani tryb wsadowy,
który by ją omijał — to celowa decyzja projektowa, nie brak funkcji.
"""

from __future__ import annotations

import sys
from dataclasses import dataclass, field

YES = {"t", "tak", "y", "yes"}
NO = {"n", "nie", "no"}


class ApprovalDenied(Exception):
    """Operator odmówił zgody — akcja nie zostanie wykonana."""


class NonInteractiveError(Exception):
    """Brak terminala interaktywnego — akcje mutujące są niedostępne."""


@dataclass
class Proposal:
    """Propozycja akcji przedstawiana operatorowi przed wykonaniem."""

    action: str                      # np. "WYSYŁKA E-MAILA", "ZAPIS DO BAZY"
    summary: str                     # jedno zdanie: co się stanie
    details: list[str] = field(default_factory=list)  # pełna treść / parametry

    def render(self) -> str:
        bar = "─" * 62
        lines = [bar, f"PROPOZYCJA AKCJI: {self.action}", bar, self.summary]
        if self.details:
            lines.append("")
            lines.extend(self.details)
        lines.append(bar)
        return "\n".join(lines)


def confirm(proposal: Proposal, *, _input=input, _stdin=None) -> bool:
    """Pokazuje propozycję i czeka na jawną zgodę operatora.

    Zwraca True wyłącznie po wpisaniu T/tak/Y/yes. Odpowiedź odmowna
    podnosi ApprovalDenied. Środowisko nieinteraktywne (pipe, cron)
    podnosi NonInteractiveError — akcja nigdy nie wykona się „po cichu".
    """
    stdin = _stdin if _stdin is not None else sys.stdin
    if _input is input and not stdin.isatty():
        raise NonInteractiveError(
            "Brak interaktywnego terminala: akcje mutujące wymagają obecności "
            "operatora i jawnego zatwierdzenia [T/N]."
        )

    print(proposal.render())
    while True:
        answer = _input("Zatwierdzasz wykonanie tej akcji? [T/N]: ").strip().lower()
        if answer in YES:
            print("✔ Zatwierdzono przez operatora.")
            return True
        if answer in NO:
            raise ApprovalDenied(f"Operator odrzucił akcję: {proposal.action}")
        print("Odpowiedz literą T (tak) albo N (nie).")
