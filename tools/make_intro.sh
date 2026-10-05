#!/usr/bin/env bash
# Montaż filmu intro Fundacji Szansa AI.
#
#   tools/make_intro.sh materiał.mp4 [katalog_wyjściowy]
#
# Z materiału (ok. 12 s) robi 15-sekundowe intro:
#   0 s – koniec materiału: małe logo w lewym górnym rogu (z przyciemnieniem pod spodem),
#   ostatnie ~3 s: obraz się rozmywa i przyciemnia, logo wyjeżdża z rogu na środek i rośnie.
# Film kończy się kadrem z logo na środku; ten sam kadr (bez logo) to tło sekcji hero.
#
# Wynik: intro.mp4, intro-poster.jpg (pierwsza klatka), hero-bg.jpg (tło hero).
# Wymaga ffmpeg (lub: pip install imageio-ffmpeg).
set -euo pipefail

IN="$1"
OUT_DIR="${2:-assets}"
LOGO="$(dirname "$0")/../assets/logo-on-dark.png"
FFMPEG="${FFMPEG:-$(command -v ffmpeg || python3 -c 'import imageio_ffmpeg;print(imageio_ffmpeg.get_ffmpeg_exe())')}"

TOTAL=15          # długość gotowego filmu (s)
MOVE_START=10.2   # start przejazdu logo na środek (logo ląduje, zanim muzyka ucichnie)
MOVE_DUR=1.3      # czas przejazdu
BLUR_START=10.0   # start rozmycia tła
BLUR_DUR=1.2
REVERB_START=10.3 # od tej chwili muzyka dostaje pogłos, który wybrzmiewa już przy logo
AUDIO_FADE=13.2   # start wyciszenia; muzyka milknie ok. 14.8 s

# Pogłos: gęsta seria wygasających ech (ok. 3 s), dzięki której ostatnie dźwięki
# muzyki wybrzmiewają już przy logo, zamiast urwać się razem z materiałem.
read -r ECHO_DELAYS ECHO_DECAYS < <(awk 'BEGIN{srand(3); t=37
  for(i=0;i<60;i++){ t+=35+rand()*60; if(t>3000)break
    d=d (i?"|":"") int(t); g=g (i?"|":"") sprintf("%.3f",0.5*exp(-t/1000*1.5)) }
  print d, g}')

# Długość materiału – brakujące sekundy do 15 s wypełnia zamrożona ostatnia klatka.
DUR=$( ("$FFMPEG" -i "$IN" 2>&1 || true) | grep -m1 -oE 'Duration: [0-9:.]+' | awk -F'[: ]' '{print $3*3600+$4*60+$5}')
PAD=$(awk -v d="$DUR" -v t="$TOTAL" 'BEGIN{p=t-d; if(p<0)p=0; printf "%.3f", p}')

# Geometria dla kadru 1920x1080 (logo-on-dark.png ma proporcje 580:218).
#   w rogu:   szerokość 420 px, lewy górny róg w (36, 30)
#   na środku: szerokość 860 px, wyśrodkowane, środek na wysokości 47% kadru
# p = postęp przejazdu z wygładzeniem (smoothstep)
P="clip((t-${MOVE_START})/${MOVE_DUR}\,0\,1)"
E="(${P}*${P}*(3-2*${P}))"
LW="(420+(860-420)*${E})"

"$FFMPEG" -y -i "$IN" -loop 1 -framerate 24 -i "$LOGO" -filter_complex "
[0:v]fps=24,scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,setsar=1,
     tpad=stop_mode=clone:stop_duration=${PAD},trim=0:${TOTAL},split=3[base][forblur][forbg];

[forblur]gblur=sigma=28,eq=brightness=-0.20:saturation=0.85:contrast=0.95,
     colorbalance=rh=0.06:bh=-0.06,vignette=PI/4,format=rgba,
     fade=in:st=${BLUR_START}:d=${BLUR_DUR}:alpha=1[blur];

[forbg]trim=start=$(awk -v t="$TOTAL" 'BEGIN{print t-0.1}'),setpts=PTS-STARTPTS,
     gblur=sigma=28,eq=brightness=-0.20:saturation=0.85:contrast=0.95,
     colorbalance=rh=0.06:bh=-0.06,vignette=PI/4,trim=end_frame=1[herobg];

color=c=black:s=1920x1080:r=24:d=0.042,format=rgba,
     geq=r=0:g=0:b=0:a='185*clip((1-hypot(X/1000\,Y/420))/0.6\,0\,1)',
     loop=loop=-1:size=1,trim=0:${TOTAL},setpts=N/24/TB,
     fade=out:st=${MOVE_START}:d=${MOVE_DUR}:alpha=1[shade];

[1:v]format=rgba,trim=0:${TOTAL},setpts=PTS-STARTPTS,
     scale=w='trunc(${LW}/2)*2':h=-2:eval=frame,
     fade=in:st=0.4:d=0.8:alpha=1[logo];

[base][blur]overlay=0:0[b1];
[b1][shade]overlay=0:0[b2];
[b2][logo]overlay=eval=frame:
     x='36+((1920-w)/2-36)*${E}':
     y='30+((1080*0.47-h/2)-30)*${E}':shortest=1,format=yuv420p[v];

[0:a]aformat=sample_rates=44100:channel_layouts=mono,apad,atrim=0:${TOTAL},asplit=2[dry][send];
[dry]afade=t=out:st=${REVERB_START}:d=0.8[d];
[send]afade=t=in:st=${REVERB_START}:d=0.8,aecho=1:0.62:${ECHO_DELAYS}:${ECHO_DECAYS}[wet];
[d][wet]amix=inputs=2:normalize=0,afade=t=out:st=${AUDIO_FADE}:d=1.6,atrim=0:${TOTAL}[a]
" -map "[v]" -map "[a]" \
  -t ${TOTAL} -c:v libx264 -crf 19 -preset slow -pix_fmt yuv420p -c:a aac -b:a 160k \
  -movflags +faststart "$OUT_DIR/intro.mp4" \
  -map "[herobg]" -frames:v 1 -update 1 -q:v 2 "$OUT_DIR/hero-bg.jpg"

"$FFMPEG" -y -i "$OUT_DIR/intro.mp4" -frames:v 1 -update 1 -q:v 3 "$OUT_DIR/intro-poster.jpg"
