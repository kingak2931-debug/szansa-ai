#!/usr/bin/env bash
# Żywe tło sekcji hero: zwolniona pętla z końcówki intro (dzieci przy komputerach).
#
#   tools/make_hero_loop.sh materiał.mp4 [katalog_wyjściowy]
#
# Bierze ostatnie ~1,6 s materiału, zwalnia 2,5×, i skleja „tył + przód” (ping-pong),
# więc pętla nie ma szwu i zaczyna się dokładnie od ostatniej klatki intro.
# Kolor jak w tle hero (ciepło, przyciemnienie, winieta), tylko bez mocnego rozmycia.
# Wynik: hero-loop.mp4 (1280x720, bez dźwięku, ~8 s).
set -euo pipefail

IN="$1"
OUT_DIR="${2:-assets}"
FFMPEG="${FFMPEG:-$(command -v ffmpeg || python3 -c 'import imageio_ffmpeg;print(imageio_ffmpeg.get_ffmpeg_exe())')}"

SEG_START=10.4   # początek fragmentu (s) – spokojne ujęcie klasy
SLOW=2.5         # spowolnienie

"$FFMPEG" -y -ss "$SEG_START" -i "$IN" -an -filter_complex "
[0:v]fps=24,scale=1280:720:force_original_aspect_ratio=increase,crop=1280:720,setsar=1,
     setpts=${SLOW}*PTS,minterpolate=fps=24:mi_mode=blend,
     gblur=sigma=2.5,eq=brightness=-0.24:saturation=0.85:contrast=0.95,
     colorbalance=rh=0.06:bh=-0.06,vignette=PI/4,split[f][r0];
[r0]reverse[r];
[r][f]concat=n=2:v=1:a=0,format=yuv420p[v]
" -map "[v]" -c:v libx264 -crf 26 -preset slow -profile:v high -movflags +faststart \
  "$OUT_DIR/hero-loop.mp4"
