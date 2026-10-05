#!/usr/bin/env bash
# Nakłada logo fundacji w lewym górnym rogu filmu.
# Użycie: tools/overlay_logo.sh wejscie.mp4 [wyjscie.mp4]
# Wymaga ffmpeg (lub: pip install imageio-ffmpeg).
set -euo pipefail

IN="$1"
OUT="${2:-assets/intro.mp4}"
LOGO="$(dirname "$0")/../assets/logo-on-dark.png"
FFMPEG="${FFMPEG:-$(command -v ffmpeg || python3 -c 'import imageio_ffmpeg;print(imageio_ffmpeg.get_ffmpeg_exe())')}"

# Logo: szerokość 22% kadru, margines 2.5%, łagodne pojawienie się w 0.6 s.
W=$( ("$FFMPEG" -i "$IN" 2>&1 || true) | grep -m1 -oE 'Video:.* [0-9]{3,5}x[0-9]{3,5}' | grep -oE '[0-9]{3,5}x[0-9]{3,5}' | tail -1 | cut -dx -f1)
LW=$(( W * 22 / 100 / 2 * 2 ))
MX=$(( W * 25 / 1000 ))
"$FFMPEG" -y -i "$IN" -loop 1 -i "$LOGO" -filter_complex "\
[1:v]scale=${LW}:-2,format=rgba,fade=in:st=0.3:d=0.6:alpha=1[logo];\
[0:v][logo]overlay=x=${MX}:y=${MX}:shortest=1,format=yuv420p[v]" \
  -map "[v]" -map 0:a? -c:v libx264 -crf 20 -preset slow -c:a aac -b:a 160k \
  -movflags +faststart "$OUT"

# Klatka tytułowa (poster) dla strony
"$FFMPEG" -y -ss 1 -i "$OUT" -frames:v 1 -update 1 -q:v 3 "$(dirname "$OUT")/intro-poster.jpg"
