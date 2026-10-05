# szansa-ai
fundacja dla dzieci szansa ai

## Strony
| Plik | Zawartość |
|---|---|
| `index.html` | intro → hero (slogan „Każde dziecko zasługuje na swoją szansę”) → mapa drogi z przystankami: Dlaczego to ważne, Misja, Program szkolenia, Bezpieczeństwo dzieci (SOM), Skala misji (liczniki), Mapa rozwoju, → pełnoekranowa karta partnerów ze złotym neuronem (zaproszenie, bez pakietów i kwot) → pełnoekranowe „Zgłoś szkołę”; stopka z danymi formalnymi |
| `polityka-prywatnosci.html` | polityka prywatności (RODO) w stylu strony |

Treści pochodzą z wcześniejszej wersji strony (index/misja/sponsorzy/polityka). Strony „Wesprzyj nas”
(dane do przelewu, PayU) i „Zgłoś szkołę” (formularz) nie zostały jeszcze przeniesione – przyciski
prowadzą na razie do e-maila kontakt@szansaai.pl z gotowym tematem.

## Zgoda na cookies
`assets/cookies.js` (na obu stronach): baner „Akceptuję wszystkie / Tylko niezbędne / Ustawienia”, pojawia się
po intro; wybór w `localStorage` na 12 miesięcy; link „Ustawienia cookies” w stopce otwiera go ponownie.
Strona nie ma dziś cookies analitycznych ani marketingowych – przy ich dodawaniu sprawdzaj
`SzansaConsent.get().analytics` / `.marketing` lub nasłuchuj zdarzenia `szansa:consent`.

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
Logo nie jest wtopione w film: to wektorowe logo strony nad filmem (`assets/intro.js`), więc jest ostre
i zawsze w całości widoczne – także na telefonie i ekranach 16:10, gdzie film jest przycięty po bokach.
Tło sekcji hero to dokładnie ostatnia klatka filmu, więc strona płynnie przejmuje obraz (od 12,4 s,
bez czekania na nieruchome zakończenie filmu; muzyka, jeśli włączona, wybrzmiewa do końca),
a to samo logo odpływa na swoje miejsce w nagłówku.

### Przejście do hero – „Złota iskra” z żywym tłem
1. z sieci w logo odrywają się złote iskry i rozlatują w konstelację w tle (`assets/sparks.js`,
   punkty lekko dryfują i odsuwają się od kursora),
2. logo płynie do lewego górnego rogu,
3. rozmyte tło wyostrza się w żywą pętlę z dziećmi przy komputerach (`tools/make_hero_loop.sh`; pętla
   rusza już pod koniec intro, a przejście to tylko przenikanie – bez filtra rozmycia, więc się nie zacina),
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
Na końcu – **„Złoty neuron”**: za ostatnim przystankiem mapa gaśnie, a iskry wszystkich miejscowości
zlatują się w jeden świecący punkt – ciało złotego neuronu. Z tego punktu złote światło otwiera
pełnoekranową kartę **partnerów** (`<section class="full partners-full">`) z żywym neuronem w tle
(wideo z Higgsfield) i pulsującym węzłem „Miejsce dla Twojej firmy”; potem z neuronu rozlewa się kolejne
światło i otwiera pełnoekranowe **„Zgłoś szkołę”** (`<section class="full finale">`). Obie karty zostają
chwilę przypięte. Przejście do „Zgłoś szkołę” to drugi film z Higgsfield (Kling 3.0, klatka startowa = neuron,
końcowa = złota poświata): przy przewijaniu neuron „odpala” – impuls biegnie po dendrytach, a potem neuron
rozsypuje się w złoty pył. Film przewija się razem ze stroną, a tło karty „Zgłoś szkołę” to jego ostatnia klatka,
więc karta wyłania się z poświaty bez żadnej krawędzi. Linki „Dla sponsorów” i „Kontakt” prowadzą prosto do otwartych kart.

Trasa jest **poglądowa** (droga, którą chcemy przejechać), a nie lista zrealizowanych szkoleń – mówi o tym
podpis na mapie. Po pierwszych szkoleniach można dodać prawdziwe pinezki odwiedzonych szkół.

Dane: `assets/poland-map.json` (152 KB) z `tools/make_poland_map.py` – źródła i licencje opisane w skrypcie
(Natural Earth – domena publiczna; polska-geojson – MIT; GeoNames przez all-the-cities – CC BY 4.0 / MIT).
Zmiana trasy: lista `STOPS` w skrypcie (kolejność = kolejność sekcji `.stop` na stronie).

Zatwierdzona wersja intro i wszystko, co potrzebne do jej odtworzenia: `tools/intro/README.md`.

Montaż: `tools/make_intro.sh materiał.mp4 assets` → `intro.mp4`, `intro-poster.jpg`, `hero-bg.jpg`.

Aktualne pliki leżą na serwerze Higgsfield i strona pobiera je stamtąd, dopóki w `assets/` nie ma kopii lokalnych:
- film (v7, bez logo): https://d2ol7oe51mr4n9.cloudfront.net/user_3GmGFYMjjLnYQeEkZz82lLJXtxL/73e3c367-e5e3-49ab-8aef-499c576ddf50.mp4 → `assets/intro.mp4`
- pierwsza klatka: https://d2ol7oe51mr4n9.cloudfront.net/user_3GmGFYMjjLnYQeEkZz82lLJXtxL/2442dca2-f005-4ee7-9ecb-2f756d6f2d48.jpg → `assets/intro-poster.jpg`
- tło hero: https://d2ol7oe51mr4n9.cloudfront.net/user_3GmGFYMjjLnYQeEkZz82lLJXtxL/86142dc1-a586-47ff-b3b1-a3292b330e32.jpg → `assets/hero-bg.jpg`
- żywe tło hero: https://d2ol7oe51mr4n9.cloudfront.net/user_3GmGFYMjjLnYQeEkZz82lLJXtxL/47ab909b-e615-4aca-afcf-b0c98034ac0e.mp4 → `assets/hero-loop.mp4`
- złoty neuron (Higgsfield: obraz gpt_image_2_5 + pętla Kling 3.0, ta sama klatka na początku i końcu): https://d2ol7oe51mr4n9.cloudfront.net/user_3GmGFYMjjLnYQeEkZz82lLJXtxL/1883651d-7223-4e5f-881f-27d9a01fb32d.mp4 → `assets/neuron.mp4`
- odpalenie neuronu (przejście do „Zgłoś szkołę”, każda klatka kluczowa – płynne przewijanie): https://d2ol7oe51mr4n9.cloudfront.net/user_3GmGFYMjjLnYQeEkZz82lLJXtxL/57631362-ed94-4ca8-bbb2-400c07b8afb1.mp4 → `assets/neuron-fire.mp4`
- tło „Zgłoś szkołę” (ostatnia klatka filmu): https://d2ol7oe51mr4n9.cloudfront.net/user_3GmGFYMjjLnYQeEkZz82lLJXtxL/f8c53d78-c635-4cc3-b220-69e4cb7e3f34.jpg
