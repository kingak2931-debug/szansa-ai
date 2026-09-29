# szansa-ai
fundacja dla dzieci szansa ai

## Logo – używamy wszędzie tych samych plików

| Plik | Do czego |
|---|---|
| `assets/logo.png` | logo na jasnym tle (przezroczyste tło) |
| `assets/logo-on-dark.png` | logo na ciemnym tle / na zdjęciach i filmach |
| `assets/logo-icon.png` | sam znak (postać + sieć), np. awatar w social media |
| `favicon.ico`, `assets/apple-touch-icon.png` | ikonki strony |
| `assets/logo-original.png` | oryginał (białe tło) – nie edytować |

Ostre wersje logo (1400 px) powstały z powiększenia AI oryginału (Higgsfield upscale, 5602×2160,
zgodne z oryginałem: PSNR 37,6 dB) skryptem `tools/make_logos.py`. Na razie leżą na serwerze Higgsfield
i strona używa ich stamtąd (lokalne pliki są zapasem) – najlepiej zapisać je w `assets/` pod tymi nazwami:
- https://d2ol7oe51mr4n9.cloudfront.net/user_3GmGFYMjjLnYQeEkZz82lLJXtxL/f05a7caf-1a50-4aca-9c34-3acafabf9b41.png → `assets/logo-on-dark.png`
- https://d2ol7oe51mr4n9.cloudfront.net/user_3GmGFYMjjLnYQeEkZz82lLJXtxL/87f86ac6-ff28-42dd-ade6-e0b324ba9c01.png → `assets/logo.png`
- https://d2ol7oe51mr4n9.cloudfront.net/user_3GmGFYMjjLnYQeEkZz82lLJXtxL/3a210a72-f7ca-432e-b652-3fa718825fea.png → `assets/logo-icon.png`
- https://d2ol7oe51mr4n9.cloudfront.net/user_3GmGFYMjjLnYQeEkZz82lLJXtxL/0562c2a8-c96e-4c31-8d6e-f8a75e10369c.png → `assets/apple-touch-icon.png`
- powiększony oryginał: https://d8j0ntlcm91z4.cloudfront.net/user_3GmGFYMjjLnYQeEkZz82lLJXtxL/hf_20260929_101049_bea72652-3138-40cf-be48-19a0e25d9391.png

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

Zatwierdzona wersja i wszystko, co potrzebne do jej odtworzenia: `tools/intro/README.md`.

Montaż: `tools/make_intro.sh materiał.mp4 assets` → `intro.mp4`, `intro-poster.jpg`, `hero-bg.jpg`.

Aktualne pliki leżą na serwerze Higgsfield i strona pobiera je stamtąd, dopóki w `assets/` nie ma kopii lokalnych:
- film: https://d2ol7oe51mr4n9.cloudfront.net/user_3GmGFYMjjLnYQeEkZz82lLJXtxL/edfa27f2-f0ea-4ccf-add5-93cea86a11d2.mp4 → `assets/intro.mp4`
- tło hero: https://d2ol7oe51mr4n9.cloudfront.net/user_3GmGFYMjjLnYQeEkZz82lLJXtxL/86142dc1-a586-47ff-b3b1-a3292b330e32.jpg → `assets/hero-bg.jpg`
- żywe tło hero: https://d2ol7oe51mr4n9.cloudfront.net/user_3GmGFYMjjLnYQeEkZz82lLJXtxL/47ab909b-e615-4aca-afcf-b0c98034ac0e.mp4 → `assets/hero-loop.mp4`
