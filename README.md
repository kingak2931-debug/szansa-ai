# szansa-ai
fundacja dla dzieci szansa ai

## Strony
| Plik | Zawartość |
|---|---|
| `index.html` | intro → hero (slogan „Każde dziecko zasługuje na swoją szansę”) → mapa drogi z przystankami: Dlaczego to ważne, Misja, Program szkolenia, Bezpieczeństwo dzieci (SOM), Skala misji (liczniki), Mapa rozwoju, Dla sponsorów (zaproszenie, bez pakietów i kwot), Kontakt; stopka z danymi formalnymi |
| `polityka-prywatnosci.html` | polityka prywatności (RODO) w stylu strony |

Treści pochodzą z wcześniejszej wersji strony (index/misja/sponsorzy/polityka). Strony „Wesprzyj nas”
(dane do przelewu, PayU) i „Zgłoś szkołę” (formularz) nie zostały jeszcze przeniesione – przyciski
prowadzą na razie do e-maila kontakt@szansaai.pl z gotowym tematem.

## Logo – używamy wszędzie tych samych plików

Logo jest **wektorowe** (SVG), więc jest ostre w każdym rozmiarze i na każdym ekranie.
Odtworzone wiernie z oryginału (`assets/logo-original.png`) skryptem `tools/make_logo_svg.py`:
napisy to kształty liter (Noto Serif Italic – „Szansa”, Gelasio – „AI” i „FUNDACJA”),
dopasowane do miejsc w oryginale; znak narysowany z geometrii zmierzonej na oryginale.

| Plik | Do czego |
|---|---|
| `assets/logo.svg` | logo na jasne tło |
| `assets/logo-on-dark.svg` | logo na ciemne tło / zdjęcia / filmy (cienka ciemna obwódka + cień) |
| `assets/logo-icon.svg` | sam znak (postać + sieć), np. awatar |
| `assets/*.png`, `favicon.ico` | wersje PNG z SVG (`node tools/render_logos.js`) – do filmu, ikonek, social media |
| `assets/logo-original.png` | oryginał (białe tło) – nie edytować |

Zmiana logo: `python3 tools/make_logo_svg.py` → `node tools/render_logos.js` → ponowny montaż filmu.
Kolory marki (złoto z logo) są w `assets/style.css` (`--gold-light`, `--gold`, `--gold-dark`).

## Film intro

Intro (15 s) odtwarza się na pełnym ekranie przy pierwszym wejściu na stronę:
zegar wybija 16:00 → dzieci biegną do świetlicy → siadają przed komputerami →
obraz się rozmywa, a logo wyjeżdża z lewego górnego rogu na środek.
Tło sekcji hero to dokładnie ostatnia klatka filmu, więc strona płynnie przejmuje obraz,
a logo odpływa na swoje miejsce w nagłówku (`assets/intro.js`).

### Przejście do hero – „Złota iskra” z żywym tłem
1. z sieci w logo odrywają się złote iskry i rozlatują w konstelację w tle (`assets/sparks.js`,
   punkty lekko dryfują i odsuwają się od kursora),
2. logo płynie do lewego górnego rogu,
3. rozmyte tło wyostrza się w żywą pętlę z dziećmi przy komputerach (`tools/make_hero_loop.sh`),
4. nagłówek pojawia się słowo po słowie, po „szansę” co kilka sekund przechodzi złoty połysk,
5. potem opis, przyciski i menu.
Przy ponownej wizycie (bez intro) konstelacja i treść po prostu łagodnie się pojawiają.

### Droga przez Polskę – tło strony pod hero (`assets/poland.js`)
Prawdziwa mapa Polski (kontur, województwa, rzeki, jeziora, drogi) i 2 624 miejscowości do 20 tys.
mieszkańców (powyżej 1000 – dane GeoNames). Przez mapę biegnie trasa po prawdziwych drogach:
Ełganowo (siedziba fundacji) → Pelplin → Lidzbark Warmiński → Tykocin → Kazimierz Dolny → Chęciny →
Myślenice → Paczków → Karpacz (ok. 1 600 km). Mapa jest przypięta do ekranu; przewijanie prowadzi iskrę:
- start – zbliżenie na wieś z intro (kościół z zegarem na 16:00), potem oddalenie do regionu,
- każdy przystanek (`<section class="stop">`) to kolejna miejscowość na trasie; mijane miejscowości się zapalają,
- „Skala misji” i meta – widok całej Polski, zapalają się wszystkie miejscowości w zasięgu misji.
Trasa jest **poglądowa** (droga, którą chcemy przejechać), a nie lista zrealizowanych szkoleń – mówi o tym
podpis na mapie. Po pierwszych szkoleniach można dodać prawdziwe pinezki odwiedzonych szkół.

Dane: `assets/poland-map.json` (152 KB) z `tools/make_poland_map.py` – źródła i licencje opisane w skrypcie
(Natural Earth – domena publiczna; polska-geojson – MIT; GeoNames przez all-the-cities – CC BY 4.0 / MIT).
Zmiana trasy: lista `STOPS` w skrypcie (kolejność = kolejność sekcji `.stop` na stronie).

Zatwierdzona wersja intro i wszystko, co potrzebne do jej odtworzenia: `tools/intro/README.md`.

Montaż: `tools/make_intro.sh materiał.mp4 assets` → `intro.mp4`, `intro-poster.jpg`, `hero-bg.jpg`.

Aktualne pliki leżą na serwerze Higgsfield i strona pobiera je stamtąd, dopóki w `assets/` nie ma kopii lokalnych:
- film: https://d2ol7oe51mr4n9.cloudfront.net/user_3GmGFYMjjLnYQeEkZz82lLJXtxL/066752e0-ed92-4616-bfc1-0bf4977d9107.mp4 → `assets/intro.mp4`
- tło hero: https://d2ol7oe51mr4n9.cloudfront.net/user_3GmGFYMjjLnYQeEkZz82lLJXtxL/86142dc1-a586-47ff-b3b1-a3292b330e32.jpg → `assets/hero-bg.jpg`
- żywe tło hero: https://d2ol7oe51mr4n9.cloudfront.net/user_3GmGFYMjjLnYQeEkZz82lLJXtxL/47ab909b-e615-4aca-afcf-b0c98034ac0e.mp4 → `assets/hero-loop.mp4`
