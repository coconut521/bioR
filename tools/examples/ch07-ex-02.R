library(readr); library(dplyr); library(tidyr)
counts <- read_csv(here::here("assets/data/pika_rnaseq_counts.csv"),
                   show_col_types = FALSE)
meta <- read_csv(here::here("assets/data/pika_rnaseq_metadata_raw.csv"),
                 show_col_types = FALSE, trim_ws = FALSE)
anti_join(meta, tibble(sample_id = names(counts)[-(1:2)]), by = "sample_id")
anti_join(tibble(sample_id = names(counts)[-(1:2)]), meta, by = "sample_id")
