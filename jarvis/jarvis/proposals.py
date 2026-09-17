"""Generatory propozycji treści: e-maile do sponsorów, posty, certyfikaty.

Funkcje zwracają wyłącznie TEKST propozycji. O tym, czy propozycja trafi
do kolejki (a tym bardziej — zostanie wysłana), decyduje operator w CLI
przez bramkę [T/N].
"""

from __future__ import annotations

from datetime import date

PACKAGES = {
    "przyjaciel": ("Przyjaciel Fundacji", "od 10 000 zł"),
    "regionalny": ("Partner Regionalny", "50 000 zł — pełny semestr zajęć dla 60 dzieci w jednej gminie"),
    "mecenas": ("Mecenas Edukacji", "100 000 zł — dwie gminy + roczny raport wpływu"),
    "strategiczny": ("Partner Strategiczny", "od 250 000 zł — naming rights programu regionalnego"),
}


def sponsor_outreach_email(company: str, contact_name: str, package: str = "regionalny",
                           region: str = "Państwa regionu", hook: str | None = None) -> tuple[str, str]:
    """Zwraca (temat, treść) propozycji e-maila outreach B2B."""
    pkg_name, pkg_desc = PACKAGES.get(package, PACKAGES["regionalny"])
    hook_line = hook or (
        f"piszę, ponieważ działalność {company} naturalnie łączy się z tym, "
        "co robimy po stronie społecznej odpowiedzialności."
    )
    subject = f"{company} × Szansa AI — edukacja AI dla dzieci z {region}"
    body = f"""Dzień dobry, {contact_name},

{hook_line}

Fundacja Szansa AI uczy dzieci z miejscowości do 20 tys. mieszkańców
odpowiedzialnego, bezpiecznego i efektywnego korzystania ze sztucznej
inteligencji. Przywozimy mobilne pracownie komputerowe tam, gdzie nie
dociera żadna oferta zajęć z nowych technologii — udział dzieci jest
zawsze bezpłatny.

Proponujemy współpracę w formule „{pkg_name}" ({pkg_desc}).
Partner otrzymuje mierzalny raport wpływu (liczba dzieci, gmin, godzin,
wyniki ewaluacji) — gotowy materiał do raportowania ESG. Darowizna na
cele statutowe podlega odliczeniu od podstawy CIT (do 10% dochodu).

Czy znajdą Państwo 20 minut w przyszłym tygodniu na krótką rozmowę online?

Z poważaniem,
[imię i nazwisko]
Fundacja Szansa AI | [telefon] | [www]"""
    return subject, body


def donor_thankyou_email(donor_name: str, amount_pln: float,
                         certificate_no: str | None = None) -> tuple[str, str]:
    subject = "Dziękujemy za wsparcie Fundacji Szansa AI 💙"
    cert = (
        f"\nW załączniku przesyłamy Twój imienny certyfikat cegiełki (nr {certificate_no})."
        if certificate_no else ""
    )
    body = f"""Dzień dobry, {donor_name},

z całego serca dziękujemy za darowiznę {amount_pln:,.2f} zł na rzecz
edukacji AI dzieci z małych miejscowości.{cert}

Co dalej z Twoją wpłatą? Finansuje ona bezpłatne warsztaty: wynagrodzenia
trenerów, mobilne pracownie i materiały dla dzieci. Relacje z zajęć
publikujemy na naszych profilach — zobacz, co dzieje się dzięki Tobie.

Pamiętaj: darowiznę możesz odliczyć od podatku (do 6% dochodu w PIT).
Wystarczy potwierdzenie przelewu.

Z wdzięcznością,
Zespół Fundacji Szansa AI"""
    return subject, body


def social_post(kind: str, **kw) -> str:
    """Propozycja posta. kind: milestone | nabor | zbiorka."""
    if kind == "milestone":
        return (
            f"🎉 {kw.get('what', 'Kolejny krok za nami!')}\n\n"
            f"{kw.get('details', '')}\n\n"
            "To wszystko dzięki naszym darczyńcom i partnerom. Dołącz: [link]\n"
            "#SzansaAI #EdukacjaCyfrowa"
        )
    if kind == "nabor":
        return (
            f"📢 {kw.get('place', '[Miejscowość]')}, szukamy Was!\n\n"
            "Bezpłatne warsztaty ze sztucznej inteligencji dla dzieci — u Was.\n"
            "Przywozimy laptopy, internet i trenerów. Wy dajecie salę i dzieciaki 🙂\n\n"
            "✅ 12 spotkań, całkowicie bezpłatnie\n"
            "✅ kadra zweryfikowana zgodnie ze standardami ochrony małoletnich\n\n"
            "Zgłoszenia: [link]"
        )
    if kind == "zbiorka":
        return (
            f"💙 {kw.get('goal', '100 zł = godzina warsztatów AI dla grupy dzieci z małej gminy.')}\n\n"
            "Nie zbieramy „na ogólny cel” — z każdej gminy pokazujemy relację,\n"
            "co z Twojej wpłaty wyszło. 👉 [link]\nDarowiznę odliczysz od podatku."
        )
    raise ValueError(f"Nieznany rodzaj posta: {kind!r} (dozwolone: milestone, nabor, zbiorka)")


def certificate_text(donor_name: str, tier_label: str, certificate_no: str) -> str:
    return f"""CERTYFIKAT WDZIĘCZNOŚCI

Fundacja Szansa AI z wdzięcznością potwierdza, że

    {donor_name}

przekazał(a) darowiznę, która ufundowała {tier_label}
dla dzieci z małych miejscowości.

Dzięki Tobie sztuczna inteligencja staje się szansą — nie przywilejem.

{date.today().isoformat()} · {certificate_no} · Zarząd Fundacji Szansa AI"""
