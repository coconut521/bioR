# ============================================================
# bioR · 宽长转换与多表连接：当表达矩阵遇上样本表
# All example code for ch07, auto-assembled from tools/examples/.
# Regenerate: node tools/build-chapter-scripts.mjs
# Data: copy assets/data/ into your project before running.
# ============================================================

# ---- ch07-ex-01.R ----
library(readr); library(dplyr); library(tidyr)
counts <- read_csv(here::here("assets/data/pika_rnaseq_counts.csv"),
                   show_col_types = FALSE)
meta <- read_csv(here::here("assets/data/pika_rnaseq_metadata_raw.csv"),
                 show_col_types = FALSE)
dim(counts)
dim(meta)
expr_long <- counts |>
  pivot_longer(cols = -c(gene_id, gene_name),
               names_to = "sample_id", values_to = "count")
dim(expr_long)
head(expr_long, 3)

# ---- ch07-ex-02.R ----
library(readr); library(dplyr); library(tidyr)
counts <- read_csv(here::here("assets/data/pika_rnaseq_counts.csv"),
                   show_col_types = FALSE)
meta <- read_csv(here::here("assets/data/pika_rnaseq_metadata_raw.csv"),
                 show_col_types = FALSE, trim_ws = FALSE)
anti_join(meta, tibble(sample_id = names(counts)[-(1:2)]), by = "sample_id")
anti_join(tibble(sample_id = names(counts)[-(1:2)]), meta, by = "sample_id")

# ---- ch07-ex-03.R ----
library(readr); library(dplyr); library(stringr)
counts <- read_csv(here::here("assets/data/pika_rnaseq_counts.csv"),
                   show_col_types = FALSE)
meta <- read_csv(here::here("assets/data/pika_rnaseq_metadata_raw.csv"),
                 show_col_types = FALSE, trim_ws = FALSE)
meta_clean <- meta |>
  mutate(sample_id = sample_id |>
           str_trim() |>
           str_replace("^H-", "H"))
anti_join(meta_clean, tibble(sample_id = names(counts)[-(1:2)]), by = "sample_id")
sum(meta_clean$sample_id %in% names(counts))

# ---- ch07-ex-04.R ----
library(readr); library(dplyr); library(tidyr)
counts <- read_csv(here::here("assets/data/pika_rnaseq_counts.csv"),
                   show_col_types = FALSE)
meta_clean <- read_csv(here::here("assets/data/pika_rnaseq_metadata_clean.csv"),
                       show_col_types = FALSE)
expr_long <- counts |>
  pivot_longer(cols = -c(gene_id, gene_name),
               names_to = "sample_id", values_to = "count")
joined <- expr_long |>
  left_join(meta_clean, by = "sample_id")
dim(expr_long)
dim(joined)
sum(is.na(joined$group))
anti_join(expr_long, meta_clean, by = "sample_id") |> nrow()

# ---- ch07-ex-05.R ----
library(readr); library(dplyr); library(tidyr); library(stringr)
counts <- read_csv(here::here("assets/data/pika_rnaseq_counts.csv"),
                   show_col_types = FALSE)
raw <- read_csv(here::here("assets/data/pika_rnaseq_metadata_raw.csv"),
                show_col_types = FALSE, trim_ws = FALSE)
dir.create(here::here("data"), showWarnings = FALSE)
meta_clean <- raw |>
  mutate(sample_id = sample_id |> str_trim() |> str_replace("^H-", "H"))
expr_long <- counts |>
  pivot_longer(cols = -c(gene_id, gene_name),
               names_to = "sample_id", values_to = "count") |>
  left_join(meta_clean, by = "sample_id")
write_csv(expr_long, here::here("data/expr_long.csv"))
qc <- tibble(
  check = c("samples_in_sheet", "matched_samples", "unmatched_meta",
            "unmatched_counts", "joined_rows"),
  value = c(nrow(meta_clean),
            sum(meta_clean$sample_id %in% names(counts)),
            anti_join(meta_clean, tibble(sample_id = names(counts)[-(1:2)]), by = "sample_id") |> nrow(),
            anti_join(tibble(sample_id = names(counts)[-(1:2)]), meta_clean, by = "sample_id") |> nrow(),
            nrow(expr_long)))
write_csv(qc, here::here("data/join_qc.csv"))
qc
