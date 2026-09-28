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

Kolory marki (złoto z logo) są w `assets/style.css` (`--gold-light`, `--gold`, `--gold-dark`).

## Film intro

Intro (15 s) odtwarza się na pełnym ekranie przy pierwszym wejściu na stronę:
zegar wybija 16:00 → dzieci biegną do świetlicy → siadają przed komputerami →
obraz się rozmywa, a logo wyjeżdża z lewego górnego rogu na środek.
Tło sekcji hero to dokładnie ostatnia klatka filmu, więc strona płynnie przejmuje obraz,
a logo odpływa na swoje miejsce w nagłówku (`assets/intro.js`).

Montaż: `tools/make_intro.sh materiał.mp4 assets` → `intro.mp4`, `intro-poster.jpg`, `hero-bg.jpg`.

Aktualne pliki leżą na serwerze Higgsfield i strona pobiera je stamtąd, dopóki w `assets/` nie ma kopii lokalnych:
- film: https://d2ol7oe51mr4n9.cloudfront.net/user_3GmGFYMjjLnYQeEkZz82lLJXtxL/7d61dc05-dc5f-4e40-a13c-c866b5cdb056.mp4 → `assets/intro.mp4`
- tło hero: https://d2ol7oe51mr4n9.cloudfront.net/user_3GmGFYMjjLnYQeEkZz82lLJXtxL/86142dc1-a586-47ff-b3b1-a3292b330e32.jpg → `assets/hero-bg.jpg`
