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
