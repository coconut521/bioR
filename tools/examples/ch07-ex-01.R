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
