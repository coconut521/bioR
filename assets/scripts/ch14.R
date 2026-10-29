# ============================================================
# bioR · 让分析可复现：Quarto、renv 与项目交付
# All example code for ch14, auto-assembled from tools/examples/.
# Regenerate: node tools/build-chapter-scripts.mjs
# Data: copy assets/data/ into your project before running.
# ============================================================

# ---- ch14-ex-01.R ----
scripts <- list.files(here::here("assets/scripts"), pattern = "\\.R$")
examples <- list.files(here::here("tools/examples"), pattern = "\\.R$")
c(chapter_scripts = length(scripts), examples = length(examples))
head(scripts, 3)

# ---- ch14-ex-02.R ----
data_files <- list.files(here::here("assets/data"))
figures <- list.files(here::here("assets/figures/chapters"), pattern = "\\.svg$")
c(data_files = length(data_files), chapter_figures = length(figures))

# ---- ch14-ex-03.R ----
library(readr)
qmd <- c(
  "---",
  "title: \"Pika hypoxia study - reproducible report\"",
  "format: html",
  "params:",
  "  data_dir: \"assets/data\"",
  "---",
  "",
  "```{r}",
  "#| label: setup",
  "library(readr); library(dplyr)",
  "pika <- read_csv(file.path(params$data_dir, \"pika_physiology.csv\"),",
  "                 show_col_types = FALSE)",
  "```",
  "",
  "```{r}",
  "#| label: tbl-qc",
  "nrow(pika); sum(is.na(pika$hemoglobin_g_l))",
  "```"
)
dir.create(here::here("reports"), showWarnings = FALSE)
writeLines(qmd, here::here("reports/report.qmd"))
length(readLines(here::here("reports/report.qmd")))

# ---- ch14-ex-04.R ----
library(jsonlite)
info <- list(
  r_version = R.version.string,
  platform = R.version$platform,
  packages = list(
    readr = as.character(packageVersion("readr")),
    dplyr = as.character(packageVersion("dplyr")),
    ggplot2 = as.character(packageVersion("ggplot2"))
  )
)
dir.create(here::here("reports"), showWarnings = FALSE)
write_json(info, here::here("reports/session_info.json"),
           pretty = TRUE, auto_unbox = TRUE)
names(info)

# ---- ch14-ex-05.R ----
readme <- c(
  "# How to rerun this project",
  "",
  "1. Open bioR.Rproj (or set the working directory to the project root).",
  "2. Restore packages: renv::restore()  (lockfile recorded at first snapshot).",
  "3. Rebuild data and figures: bash tools/build-all.sh",
  "4. Render the report: quarto render reports/report.qmd",
  "5. Check outputs: node tools/validate.mjs",
  "",
  "All paths are relative to the project root; no absolute paths appear in scripts."
)
dir.create(here::here("reports"), showWarnings = FALSE)
writeLines(readme, here::here("reports/README_run.md"))
file.exists(here::here(c("reports/report.qmd", "reports/README_run.md",
                         "reports/session_info.json")))
