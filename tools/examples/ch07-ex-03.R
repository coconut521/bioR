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
