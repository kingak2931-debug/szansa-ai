# Sekwencja cold outreach B2B — 3 wiadomości (e-mail + LinkedIn)

Cel: umówienie 20-minutowej rozmowy z decydentem (CEO/CSR/HR) w firmie IT.
Kadencja: wiadomość 1 → +4 dni robocze → wiadomość 2 → +6 dni → wiadomość 3 → pauza
60 dni (lead wraca do pielęgnacji contentem LinkedIn). Wysyłka przez CRM Jarvis
(`crm.py`) — każda wiadomość zatwierdzana [T/N] przed wysłaniem.

**Zasady:** zawsze personalizacja w 1. zdaniu (bez niej nie wysyłamy — lepiej mniej,
a celniej); max 120 słów; 1 CTA; żadnych załączników w 1. wiadomości (spam-filtry);
stopka z KRS i linkiem do dokumentów fundacji (wiarygodność). Zgodność: PECL/UŚUDE —
piszemy na adresy służbowe w sprawie ofert współpracy B2B; każda wiadomość zawiera
możliwość rezygnacji („odpisz NIE"); rezygnacje natychmiast do CRM (status: declined).

---

## Wiadomość 1 — Otwarcie (problem + konkret)

**Temat:** `[Firma] × 60 dzieci z [region] — jedna decyzja`
**Temat wariant B (test):** `Pytanie o CSR [Firmy] na [rok]`

> Dzień dobru Panie/Pani [imię],
>
> [PERSONALIZACJA — 1 zdanie, np. „przeczytałem wywiad, w którym mówił Pan o brakach
> kadrowych w regionie — my pracujemy nad tym problemem 10 lat wcześniej, niż robi to
> rekrutacja."]
>
> Fundacja Szansa AI uczy dzieci z miejscowości do 20 tys. mieszkańców bezpiecznego
> i mądrego korzystania ze sztucznej inteligencji. Przywozimy mobilne pracownie tam,
> gdzie nie ma żadnych zajęć z technologii — bezpłatnie dla rodzin.
>
> 50 000 zł finansuje pełny semestr dla 60 dzieci w jednej gminie — z imiennym
> raportem wpływu do Państwa raportu ESG i odliczeniem darowizny od CIT.
>
> Czy znajdzie Pan/Pani 20 minut w przyszłym tygodniu na rozmowę online?
> Jeśli to nie ten adres — do kogo mogę napisać? A jeśli temat nietrafiony,
> wystarczy odpowiedź „nie".
>
> [stopka: imię, funkcja, telefon, KRS, link do oferty]

**Wersja LinkedIn (po akceptacji zaproszenia, max 300 znaków):**
> Dzień dobry! [personalizacja 1 zdanie]. Prowadzę fundację uczącą dzieci z małych
> gmin bezpiecznego korzystania z AI. Szukamy firm-partnerów (od 10 tys. zł/rok,
> pełny raport wpływu pod ESG). 20 minut rozmowy w przyszłym tygodniu?

## Wiadomość 2 — Follow-up (dowód + inna korzyść)

**Temat:** `Re: [temat 1]` (odpowiedź w wątku)

> Dzień dobry Panie/Pani [imię],
>
> wracam z jednym konkretem zamiast przypominajki: [DOWÓD — np. „w zeszłym semestrze
> w gminie X dzieci poprawiły rozpoznawanie treści generowanych przez AI z 34% do 71%
> (ewaluacja przed/po)" — dane rzeczywiste z pilotażu; przed pilotażem: „12 gmin czeka
> na liście z gotowymi salami i zgłoszeniami — brakuje wyłącznie finansowania"].
>
> Poza efektem społecznym partnerzy najczęściej doceniają dwie rzeczy:
> wolontariat pracowniczy (Wasi inżynierowie jako goście zajęć) i gotowe
> materiały do komunikacji wewnętrznej.
>
> Pasuje krótka rozmowa w [dzień] lub [dzień]? Kalendarz: [link]
>
> PS Jeśli temat jest nietrafiony — odpowiedź „nie" wystarczy, nie będę wracał.

**Wersja LinkedIn:** skrót dowodu + „Widzę, że wiadomość mogła utonąć — zostawiam
link do kalendarza: [link]".

## Wiadomość 3 — Zamknięcie pętli (break-up email)

**Temat:** `Re: [temat 1] — zamykam temat`

> Dzień dobry Panie/Pani [imię],
>
> to moja ostatnia wiadomość w tej sprawie. Rozumiem, że teraz nie jest to priorytet —
> tak bywa i to w porządku.
>
> Zostawiam trzy rzeczy na przyszłość:
> 1. Nasz raport roczny i cennik „ile kosztuje semestr w gminie": [link]
> 2. Bezpłatny poradnik o dzieciach i AI — przydaje się też pracownikom-rodzicom: [link]
> 3. Obietnicę, że jak wrócicie za pół roku, gminy nadal będą czekać.
>
> Gdyby cokolwiek się zmieniło — jestem pod tym adresem.
>
> Z poważaniem, [imię]

**Wersja LinkedIn:** „Zamykam wątek — gdyby kiedyś temat wrócił, profil fundacji
regularnie pokazuje, co robimy: [link]. Powodzenia!"

---

## Mierniki sekwencji (przegląd co 2 tyg. w CRM)

| Metryka | Cel |
|---|---|
| Open rate (wiadomość 1) | > 45% (test A/B tematów) |
| Reply rate (cała sekwencja) | > 8% |
| Umówione rozmowy / 100 kontaktów | 5–8 |
| Konwersja rozmowa → umowa | 25% (1 na 4) |

Higiena listy: tylko adresy służbowe decydentów zebrane ręcznie (LinkedIn, strony
firm); źródło kontaktu odnotowane w CRM (RODO — uzasadniony interes, informacja
o źródle danych na żądanie); wypisy („nie") honorowane bezterminowo.
