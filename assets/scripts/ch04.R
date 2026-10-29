# ============================================================
# bioR · 导入、导出与数据质量：从仪器到 R
# All example code for ch04, auto-assembled from tools/examples/.
# Regenerate: node tools/build-chapter-scripts.mjs
# Data: copy assets/data/ into your project before running.
# ============================================================

# ---- ch04-ex-01.R ----
library(readr)
plate_raw <- read_csv(here::here("assets/data/plate_reader_raw.csv"),
                      show_col_types = FALSE)
ncol(plate_raw)
nrow(plate_raw)
names(plate_raw)[1]

# ---- ch04-ex-02.R ----
library(readr); library(dplyr)
plate <- read_csv(here::here("assets/data/plate_reader_raw.csv"),
                  skip = 3, show_col_types = FALSE) |>
  rename(well_id = well, od600 = od600, temp_c = temperature_c)
ncol(plate)
nrow(plate)
names(plate)

# ---- ch04-ex-03.R ----
library(readxl)
excel_sheets(here::here("assets/data/pika_lab_notebook.xlsx"))
incidents <- read_excel(here::here("assets/data/pika_lab_notebook.xlsx"),
                        sheet = "incidents")
incidents

# ---- ch04-ex-04.R ----
library(readr); library(dplyr)
pika <- read_csv(here::here("assets/data/pika_physiology.csv"),
                 show_col_types = FALSE)
sum(is.na(pika$hemoglobin_g_l))
sum(duplicated(pika$id))
sum(pika$body_mass_g < 110 | pika$body_mass_g > 240, na.rm = TRUE)

# ---- ch04-ex-05.R ----
library(readr); library(dplyr); library(writexl)
pika <- read_csv(here::here("assets/data/pika_physiology.csv"),
                 show_col_types = FALSE)
qc <- tibble(
  check = c("rows", "unique_id", "hb_missing", "mass_out_of_range"),
  expected = c("60", "60", "2", "0"),
  found = c(as.character(nrow(pika)),
            as.character(n_distinct(pika$id)),
            as.character(sum(is.na(pika$hemoglobin_g_l))),
            as.character(sum(pika$body_mass_g < 110 |
                               pika$body_mass_g > 240, na.rm = TRUE))))
qc
