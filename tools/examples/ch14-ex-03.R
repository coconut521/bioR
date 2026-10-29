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
