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
