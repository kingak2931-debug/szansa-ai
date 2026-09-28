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

`assets/intro.mp4` odtwarza się w tle na górze strony (`index.html`), z logo w lewym górnym rogu.
Aby nałożyć logo na nowy film: `tools/overlay_logo.sh nowy-film.mp4 assets/intro.mp4`.

Aktualny film (z logo) jest na serwerze Higgsfield i strona pobiera go stamtąd:
https://d2ol7oe51mr4n9.cloudfront.net/user_3GmGFYMjjLnYQeEkZz82lLJXtxL/86ca6bbc-6747-4478-81cb-0e006b1ba10e.mp4
Po zapisaniu go jako `assets/intro.mp4` strona automatycznie użyje wersji lokalnej.
