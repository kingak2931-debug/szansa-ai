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

## Formularz partnerstwa
Przycisk „Porozmawiajmy o partnerstwie” otwiera okno z formularzem (`assets/partner-form.js`).
Strona nie ma własnego serwera, więc wiadomość wysyła usługa FormSubmit (formsubmit.co) na kontakt@szansaai.pl.
**Przy pierwszym zgłoszeniu FormSubmit przyśle na kontakt@szansaai.pl e-mail z linkiem aktywacyjnym – trzeba go raz kliknąć.**
Do tego czasu (i gdy usługa nie odpowiada) formularz otwiera pocztę z gotową, wypełnioną wiadomością – nic nie ginie.
FormSubmit jest wymieniony w polityce prywatności jako odbiorca danych.

## Zgoda na cookies
`assets/cookies.js` (na obu stronach): baner „Akceptuję wszystkie / Tylko niezbędne / Ustawienia”, pojawia się
po intro; wybór w `localStorage` na 12 miesięcy; link „Ustawienia cookies” w stopce otwiera go ponownie.
Strona nie ma dziś cookies analitycznych ani marketingowych – przy ich dodawaniu sprawdzaj
`SzansaConsent.get().analytics` / `.marketing` lub nasłuchuj zdarzenia `szansa:consent`.

## Logo – „lustrzane złoto” (używamy wszędzie tych samych plików)

Logo wygenerowane w Higgsfield (gpt_image_2_5, na podstawie oryginału `assets/logo-original.png`):
polerowane, lustrzane złoto, cienkie i czytelne litery. Obraz powiększony do 4K, tło usunięte
i pliki dla strony przygotowane skryptem `tools/make_logo_gold.py` (szerokość 2400 px – ostre także
na ekranach Retina). Pliki leżą na serwerze Higgsfield:

| Plik | Do czego |
|---|---|
| [logo-gold.webp](https://d2ol7oe51mr4n9.cloudfront.net/user_3GmGFYMjjLnYQeEkZz82lLJXtxL/4f08d59f-8716-446a-9f9c-e9d8dfd1bd4f.webp) ([png](https://d2ol7oe51mr4n9.cloudfront.net/user_3GmGFYMjjLnYQeEkZz82lLJXtxL/c71fdb4a-9a78-4cd1-b744-55c78aa12da0.png)) | wszędzie: nagłówek, intro, stopka, polityka prywatności (czytelne na ciemnym i jasnym tle) |
| [logo-gold-light.webp](https://d2ol7oe51mr4n9.cloudfront.net/user_3GmGFYMjjLnYQeEkZz82lLJXtxL/4537b7a3-6d57-46e7-b0d4-635fc613af53.webp) | wersja zapasowa o łagodniejszych krawędziach (na jasnym tle w małym rozmiarze wychodzi zbyt blado) |
| [logo-icon.webp](https://d2ol7oe51mr4n9.cloudfront.net/user_3GmGFYMjjLnYQeEkZz82lLJXtxL/3c5cd802-3fe2-4ea1-bb2b-ce4b34f1106e.webp) ([png](https://d2ol7oe51mr4n9.cloudfront.net/user_3GmGFYMjjLnYQeEkZz82lLJXtxL/cdaf7a4b-b6c1-44b6-875d-ea38881c1194.png)) | sam znak (ludzik + sieć), 512 px – karta „Zgłoś szkołę”, awatar |
| [favicon-32](https://d2ol7oe51mr4n9.cloudfront.net/user_3GmGFYMjjLnYQeEkZz82lLJXtxL/551b0bff-486a-4b8e-ba06-815d9727fc1b.png), [favicon-16](https://d2ol7oe51mr4n9.cloudfront.net/user_3GmGFYMjjLnYQeEkZz82lLJXtxL/bbb1055f-a657-42f0-9667-03efb1a17a4f.png), [apple-touch-icon](https://d2ol7oe51mr4n9.cloudfront.net/user_3GmGFYMjjLnYQeEkZz82lLJXtxL/677a5a2d-31af-4cfa-b5d4-0b3c0618c86c.png) | ikonki przeglądarki i telefonu |
| [og-image.jpg](https://d2ol7oe51mr4n9.cloudfront.net/user_3GmGFYMjjLnYQeEkZz82lLJXtxL/db0cf79c-5643-4d27-a761-9525da20dd3e.jpg) | podgląd linku w social media (1200×630) |
| `assets/logo-original.png` | oryginał (białe tło) – nie edytować |

Obraz źródłowy: job `0a1a1fbf-c682-4aca-9c14-99fb2183e6bd`, powiększenie 4K: job `afc0237e-be46-42ea-b68b-d0499b968151`.
Kolory marki (złoto z logo) są w `assets/style.css` (`--gold-light`, `--gold`, `--gold-dark`).
Poprzednie logo wektorowe (SVG) jest w historii repozytorium.

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

Pliki leżą na serwerze Higgsfield i strona pobiera je stamtąd. Kolejność pobierania: najpierw tylko intro,
w połowie intro żywe tło hero, a filmy neuronu dopiero po intro – żeby nic nie konkurowało z intro o łącze.
Intro nigdy nie blokuje strony: gdy film nie rusza (8 s), zacina się (4 s bez postępu) albo trwa za długo
(24 s), strona pokazuje się od razu (`assets/intro.js`).
- film (v7, bez logo) – strona wybiera wersję wg ekranu i łącza (`szansaIntroSrc` w `index.html`):
  1080p, 4,2 MB: https://d2ol7oe51mr4n9.cloudfront.net/user_3GmGFYMjjLnYQeEkZz82lLJXtxL/02d34c36-601d-46c3-9aeb-fd65a4e5e983.mp4 ·
  720p, 2,2 MB (telefony, wolne łącza): https://d2ol7oe51mr4n9.cloudfront.net/user_3GmGFYMjjLnYQeEkZz82lLJXtxL/4e6ec182-b114-49fe-80bd-124f63304c49.mp4 ·
  wzorzec 10 MB (montaż `tools/make_intro.sh`): https://d2ol7oe51mr4n9.cloudfront.net/user_3GmGFYMjjLnYQeEkZz82lLJXtxL/73e3c367-e5e3-49ab-8aef-499c576ddf50.mp4
- pierwsza klatka: https://d2ol7oe51mr4n9.cloudfront.net/user_3GmGFYMjjLnYQeEkZz82lLJXtxL/2442dca2-f005-4ee7-9ecb-2f756d6f2d48.jpg → `assets/intro-poster.jpg`
- tło hero: https://d2ol7oe51mr4n9.cloudfront.net/user_3GmGFYMjjLnYQeEkZz82lLJXtxL/86142dc1-a586-47ff-b3b1-a3292b330e32.jpg → `assets/hero-bg.jpg`
- żywe tło hero: https://d2ol7oe51mr4n9.cloudfront.net/user_3GmGFYMjjLnYQeEkZz82lLJXtxL/47ab909b-e615-4aca-afcf-b0c98034ac0e.mp4 → `assets/hero-loop.mp4`
- złoty neuron (Higgsfield: obraz gpt_image_2_5 + pętla Kling 3.0, ta sama klatka na początku i końcu): https://d2ol7oe51mr4n9.cloudfront.net/user_3GmGFYMjjLnYQeEkZz82lLJXtxL/1883651d-7223-4e5f-881f-27d9a01fb32d.mp4 → `assets/neuron.mp4`
- odpalenie neuronu (przejście do „Zgłoś szkołę”, każda klatka kluczowa – płynne przewijanie): https://d2ol7oe51mr4n9.cloudfront.net/user_3GmGFYMjjLnYQeEkZz82lLJXtxL/57631362-ed94-4ca8-bbb2-400c07b8afb1.mp4 → `assets/neuron-fire.mp4`
- tło „Zgłoś szkołę” (ostatnia klatka filmu): https://d2ol7oe51mr4n9.cloudfront.net/user_3GmGFYMjjLnYQeEkZz82lLJXtxL/f8c53d78-c635-4cc3-b220-69e4cb7e3f34.jpg
