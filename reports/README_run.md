# How to rerun this project

1. Open bioR.Rproj (or set the working directory to the project root).
2. Restore packages: renv::restore()  (lockfile recorded at first snapshot).
3. Rebuild data and figures: bash tools/build-all.sh
4. Render the report: quarto render reports/report.qmd
5. Check outputs: node tools/validate.mjs

All paths are relative to the project root; no absolute paths appear in scripts.
