# bioR — R for Biology Research

An offline, zero-dependency teaching website that teaches the R language to biology students and researchers. Every chapter is bound to one continuous research project — a simulated plateau-pika hypoxia study — so syntax is always learned in service of a real analysis, from tidying lab records to publishing a figure and reproducing the whole pipeline.

**Status:** v1.0.0 — built, audited, and shipped. 29 HTML pages, all generated outputs verified (see [docs/audit/phase0-audit.md](docs/audit/phase0-audit.md)). Chinese version of this file: [README.zh-CN.md](README.zh-CN.md). Developer documentation: [DEV.md](DEV.md).

---

## Quick start

No install, no server, no network. Double-click `index.html` — the site works from `file://`.

Optionally serve it locally:

```bash
python tools/dev-server.py     # http://127.0.0.1:8765
```

To rebuild all generated content (data, figures, example outputs, search index), see [DEV.md](DEV.md).

---

## What's inside

| Module | Scale | Notes |
| --- | --- | --- |
| Core course | 18 chapters | 14 core + 4 advanced; ~45–55 study hours; one pika/hypoxia storyline |
| BioViz (`bioviz.html`) | 9 chart recipes | Figure anatomy explorer, journal presets, palettes, submission checklist |
| Bioinformatics (`bioinfo.html`) | 6 routes / 44 stations | Shell-vs-R role per station, package atlas, file-format guide |
| Data Clinic (`clinic.html`) | 14 cases + 6 red flags | Symptom → diagnosis → prescription → prevention |
| R Triage (`triage.html`) | 50 real errors | Captured live in R 4.5.2 by script; cause → fix → prevent |
| Stats Navigator (`stats-nav.html`) | decision tree + 6 templates | Which test, effect size, reporting sentence |
| Dataset Zoo (`datasets.html`) | 9 simulated datasets + 8 external sources | Data dictionaries, previews, chapter links |
| Project Workbench (`project.html`) | 18 deliverables, 4 figure slots | Progress tracking, reproducibility checklist |
| Cheat sheets (`cheatsheets.html`) | 36 cards, 7 categories | Copyable tables/code, printable |
| Glossary (`glossary.html`) | 22 terms | R / statistics / biology views, formulas, chapter links |
| Registered figures | 18 figures | Rendered from a registry; every caption reports n |

Plus `about.html` (version table, build process, license notes).

All teaching data is **simulated** with a fixed seed (20261027) — no real animal or patient data.

---

## How it stays honest

1. **Nothing is hand-written.** Every `R console` output, statistic, p-value, and figure on the site is produced by a script in `tools/` and re-verified on every build (`check-examples: ALL PASS`).
2. **Statistics before syntax.** Chapters teach design, assumptions, effect sizes, and CIs; the Data Clinic and Stats Navigator teach judgment.
3. **Zero runtime dependencies.** Pure HTML/CSS/vanilla JS. No CDN, no webfonts, no in-browser R. Works offline from `file://`.
4. **tidyverse first, base R alongside.** Every code card offers a base-R comparison.
5. **English figure labels, Chinese explanations** — journal-ready graphics with native-language teaching.

---

## Repository layout

```text
bioR/
├─ index.html            Home: research route, continue-learning, workbench summary
├─ chapters/             18 chapter pages (ch01 … ch18)
├─ bioviz.html           BioViz special
├─ bioinfo.html          Bioinformatics special
├─ clinic.html           Data Clinic
├─ triage.html           R Triage (real error cards)
├─ stats-nav.html        Stats Navigator
├─ datasets.html         Dataset Zoo
├─ project.html          Project Workbench
├─ cheatsheets.html      36 cheat-sheet cards
├─ glossary.html         Glossary
├─ about.html            About, build process, version table
├─ assets/               css / js / data / figures / scripts (runtime assets)
├─ data/                 Chapter deliverables (student output examples)
├─ figures/              Chapter deliverable figures
├─ docs/                 Design & engineering docs (Chinese) + audit log
├─ tools/                R + Node build pipeline and audit scripts
└─ .github/workflows/    CI: runs tools/build-all.sh on push
```

`tools/rlib/` (local R package library, ~750 MB) is git-ignored; rebuild it with `Rscript tools/setup-packages.R`.

---

## Build & checks

One command regenerates and verifies everything:

```bash
bash tools/build-all.sh
```

Pipeline: generate data → validate data → render figures → render examples → **hard-compare outputs** → collect real R errors → node builders (previews, triage, search index, chapter scripts, cheat cards, clinic cards) → `validate.mjs`.

Delivery gate: `validate: 0 error(s), 0 warning(s)` and `check-examples: ALL PASS`.

See [DEV.md](DEV.md) for environment setup, per-step commands, and the audit harness.

---

## Documentation

- [DEV.md](DEV.md) — developer guide (English): environment, pipeline, contracts, audits, conventions.
- `docs/01…08` — design system, IA, curriculum, specials, engineering contracts, authoring guide, roadmap, ADRs (Chinese).
- [docs/audit/phase0-audit.md](docs/audit/phase0-audit.md) — full code + visual audit log of the finished site.
- [README.zh-CN.md](README.zh-CN.md) — Chinese version of this README.

## License

No license file yet. Add one before redistributing the content or code.
