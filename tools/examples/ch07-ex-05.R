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
