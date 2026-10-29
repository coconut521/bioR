suppressPackageStartupMessages({
  library(readr); library(dplyr); library(tibble); library(edgeR)
})
counts <- read_csv(here::here("assets/data/pika_rnaseq_counts.csv"), show_col_types = FALSE) |>
  column_to_rownames("gene_id")
meta <- read_csv(here::here("assets/data/pika_rnaseq_metadata_clean.csv"),
                 show_col_types = FALSE)
mat <- as.matrix(counts[, meta$sample_id])
y <- DGEList(counts = mat, group = meta$group)
keep <- filterByExpr(y, group = meta$group)
y <- y[keep, , keep.lib.sizes = FALSE]
y <- calcNormFactors(y)
lcpm <- cpm(y, log = TRUE)
data.frame(
  genes = nrow(counts),
  kept = sum(keep),
  samples = ncol(lcpm),
  min_logcpm = round(min(lcpm), 2),
  max_logcpm = round(max(lcpm), 2)
)
