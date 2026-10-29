suppressPackageStartupMessages({
  library(readr); library(dplyr); library(tibble)
})
counts <- read_csv(here::here("assets/data/pika_rnaseq_counts.csv"), show_col_types = FALSE) |>
  column_to_rownames("gene_id")
meta <- read_csv(here::here("assets/data/pika_rnaseq_metadata_clean.csv"),
                 show_col_types = FALSE)
ct <- table(group = meta$group, batch = meta$batch)
data.frame(
  group = rownames(ct),
  batch1 = as.integer(ct[, "batch1"]),
  batch2 = as.integer(ct[, "batch2"])
)
c(genes = nrow(counts), samples = ncol(as.matrix(counts[, meta$sample_id])))
