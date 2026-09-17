"""Raporty (tylko odczyt — nie wymagają zatwierdzenia)."""

from __future__ import annotations

from datetime import date, timedelta

GOAL_PLN = 2_000_000.0

PACKAGE_LABELS = {
    "przyjaciel": "Przyjaciel Fundacji",
    "regionalny": "Partner Regionalny",
    "mecenas": "Mecenas Edukacji",
    "strategiczny": "Partner Strategiczny",
}


def _bar(fraction: float, width: int = 30) -> str:
    fraction = max(0.0, min(1.0, fraction))
    filled = round(fraction * width)
    return "█" * filled + "░" * (width - filled)


def finance_report(conn) -> str:
    total = conn.execute("SELECT COALESCE(SUM(amount_pln), 0) AS s FROM donations").fetchone()["s"]
    pledged = conn.execute(
        "SELECT COALESCE(SUM(pledged_pln), 0) AS s FROM sponsors WHERE status='signed'"
    ).fetchone()["s"]
    grants_won = conn.execute(
        "SELECT COALESCE(SUM(amount_pln), 0) AS s FROM grants WHERE status='won'"
    ).fetchone()["s"]
    by_channel = conn.execute(
        "SELECT channel, COUNT(*) AS n, SUM(amount_pln) AS s FROM donations"
        " GROUP BY channel ORDER BY s DESC"
    ).fetchall()
    month_start = date.today().replace(day=1).isoformat()
    this_month = conn.execute(
        "SELECT COALESCE(SUM(amount_pln), 0) AS s, COUNT(*) AS n FROM donations WHERE donated_on >= ?",
        (month_start,),
    ).fetchone()

    secured = total + pledged + grants_won
    lines = [
        "# Raport finansowy — Fundacja Szansa AI",
        f"Data: {date.today().isoformat()}",
        "",
        f"Cel: {GOAL_PLN:,.0f} PLN",
        f"Zabezpieczono łącznie: {secured:,.2f} PLN ({secured / GOAL_PLN:.1%})",
        f"[{_bar(secured / GOAL_PLN)}]",
        "",
        f"  • darowizny wpłacone:        {total:>12,.2f} PLN",
        f"  • umowy sponsorskie (signed): {pledged:>11,.2f} PLN",
        f"  • granty wygrane:            {grants_won:>12,.2f} PLN",
        "",
        f"Bieżący miesiąc: {this_month['s']:,.2f} PLN ({this_month['n']} wpłat)",
        "",
        "## Darowizny wg kanału",
    ]
    if by_channel:
        for row in by_channel:
            lines.append(f"  {row['channel']:<14} {row['n']:>4} wpłat   {row['s']:>12,.2f} PLN")
    else:
        lines.append("  (brak wpłat)")
    return "\n".join(lines)


def donors_report(conn) -> str:
    recurring = conn.execute(
        "SELECT COUNT(*) AS n FROM donors WHERE recurring=1"
    ).fetchone()["n"]
    top = conn.execute(
        "SELECT d.name, d.kind, SUM(x.amount_pln) AS s, COUNT(*) AS n"
        " FROM donors d JOIN donations x ON x.donor_id=d.id"
        " GROUP BY d.id ORDER BY s DESC LIMIT 10"
    ).fetchall()
    lines = [
        "# Raport darczyńców",
        f"Data: {date.today().isoformat()}",
        "",
        f"Darczyńcy cykliczni: {recurring} (cel M18: 300)",
        "",
        "## Top 10 darczyńców",
    ]
    if top:
        for i, row in enumerate(top, 1):
            lines.append(f"  {i:>2}. {row['name']:<30} {row['s']:>10,.2f} PLN ({row['n']} wpłat)")
    else:
        lines.append("  (brak danych)")
    lines += [
        "",
        "Uwaga RODO: raport zawiera dane osobowe — nie udostępniać poza",
        "upoważnionym personelem fundacji.",
    ]
    return "\n".join(lines)


def pipeline_report(conn) -> str:
    rows = conn.execute(
        "SELECT company, package, status, pledged_pln, updated_at FROM sponsors"
        " ORDER BY CASE status WHEN 'signed' THEN 0 WHEN 'offer' THEN 1 WHEN 'meeting' THEN 2"
        " WHEN 'contacted' THEN 3 WHEN 'lead' THEN 4 ELSE 5 END, pledged_pln DESC"
    ).fetchall()
    lines = ["# Pipeline sponsorski B2B", f"Data: {date.today().isoformat()}", ""]
    if not rows:
        lines.append("(pusty — dodaj leady: jarvis sponsor add ...)")
    for row in rows:
        pkg = PACKAGE_LABELS.get(row["package"] or "", row["package"] or "—")
        lines.append(
            f"  [{row['status']:<9}] {row['company']:<28} {pkg:<20} {row['pledged_pln']:>10,.0f} PLN"
        )
    total_offer = sum(r["pledged_pln"] for r in rows if r["status"] in ("offer", "signed"))
    lines += ["", f"Wartość ofert złożonych + podpisanych: {total_offer:,.0f} PLN"]
    return "\n".join(lines)


def grants_report(conn, days_ahead: int = 60) -> str:
    horizon = (date.today() + timedelta(days=days_ahead)).isoformat()
    today = date.today().isoformat()
    upcoming = conn.execute(
        "SELECT program, funder, deadline, amount_pln, status FROM grants"
        " WHERE deadline IS NOT NULL AND deadline BETWEEN ? AND ?"
        " AND status IN ('watch', 'preparing') ORDER BY deadline",
        (today, horizon),
    ).fetchall()
    all_rows = conn.execute(
        "SELECT status, COUNT(*) AS n, COALESCE(SUM(amount_pln),0) AS s FROM grants GROUP BY status"
    ).fetchall()
    lines = [
        "# Kalendarz grantowy",
        f"Data: {date.today().isoformat()}",
        "",
        f"## Nabory w najbliższych {days_ahead} dniach",
    ]
    if upcoming:
        for row in upcoming:
            amount = f"{row['amount_pln']:,.0f} PLN" if row["amount_pln"] else "kwota: b.d."
            lines.append(
                f"  ⏰ {row['deadline']}  {row['program']} ({row['funder']}) — {amount} [{row['status']}]"
            )
    else:
        lines.append("  (brak nadchodzących naborów — uzupełnij kalendarz)")
    lines += ["", "## Statusy wniosków"]
    for row in all_rows:
        lines.append(f"  {row['status']:<10} {row['n']:>3} szt.  {row['s']:>12,.0f} PLN")
    return "\n".join(lines)


def full_report(conn) -> str:
    return "\n\n".join([
        finance_report(conn), donors_report(conn), pipeline_report(conn), grants_report(conn),
    ])
