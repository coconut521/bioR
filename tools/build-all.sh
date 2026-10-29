#!/usr/bin/env bash
# ============================================================
# build-all.sh — one-button pipeline (docs/05 §9.4).
# Usage: bash tools/build-all.sh
# Requires: Rscript on PATH (or R_HOME bin), node >= 18.
# ============================================================
set -euo pipefail
cd "$(dirname "$0")/.."

RSCRIPT="${RSCRIPT:-Rscript}"
if ! command -v "$RSCRIPT" >/dev/null 2>&1; then
  for d in "/c/Program Files/R"/*/bin; do
    [ -x "$d/Rscript.exe" ] && RSCRIPT="$d/Rscript.exe" && break
  done
fi

echo "== 1/8 generate data =="
"$RSCRIPT" tools/generate-data.R
echo "== 2/8 validate data =="
"$RSCRIPT" tools/validate-data.R
echo "== 3/8 render figures =="
"$RSCRIPT" tools/render-figures.R
echo "== 4/8 render + inject examples =="
"$RSCRIPT" tools/render-examples.R
echo "== 5/8 check examples (hard gate) =="
"$RSCRIPT" tools/check-examples.R
echo "== 6/8 collect real R errors (triage) =="
"$RSCRIPT" tools/collect-errors.R
echo "== 7/8 node builders =="
node tools/build-data-previews.mjs
node tools/build-triage-data.mjs
node tools/build-search-index.mjs
node tools/build-chapter-scripts.mjs
node tools/build-cheatsheet-cards.mjs
node tools/build-clinic-cards.mjs
echo "== 8/8 validate site =="
node tools/validate.mjs
echo "== build-all: done =="
