#!/usr/bin/env bash
# ============================================================
# shot.sh — headless-Chromium screenshots for visual audits.
# NOTE: desktop Chrome enforces a ~500px minimum layout width;
# for <500px audits use the in-app browser instead.
# Usage: bash tools/shot.sh <url-path> <outfile.png> [width] [height] [theme] [fullpage]
# ============================================================
set -euo pipefail
cd "$(dirname "$0")/.."

PAGE="${1:?url path required}"
OUT="${2:?outfile required}"
W="${3:-1440}"
H="${4:-900}"
THEME="${5:-light}"
FULL="${6:-}"

CHROME=""
for c in "C:/Program Files/Google/Chrome/Application/chrome.exe" \
         "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe" \
         "C:/Program Files/Microsoft/Edge/Application/msedge.exe"; do
  [ -f "$c" ] && CHROME="$c" && break
done
[ -z "$CHROME" ] && { echo "no chrome/edge found" >&2; exit 1; }

URL="http://127.0.0.1:8765/${PAGE}"
case "$URL" in
  *\?*) URL="${URL}&theme=${THEME}" ;;
  *)    URL="${URL}?theme=${THEME}" ;;
esac

ARGS=(--headless=new --disable-gpu --hide-scrollbars
      "--window-size=${W},${H}" "--screenshot=${OUT}"
      --virtual-time-budget=4000 --default-background-color=FFFFFF
      "${URL}")
if [ "$FULL" = "full" ]; then
  # full-page: tall window approximates content height (pass H to control)
  case "$H" in
    900|1080|1440) H=4400 ;;  # default-ish heights get a tall default
  esac
  ARGS=(--headless=new --disable-gpu --hide-scrollbars
        "--window-size=${W},${H}" "--screenshot=${OUT}"
        --virtual-time-budget=5000 "${URL}")
fi
"$CHROME" "${ARGS[@]}" 2>/dev/null
echo "shot: ${OUT}"
