suppressPackageStartupMessages({
  library(readr); library(dplyr); library(tibble); library(edgeR)
})
counts <- read_csv(here::here("assets/data/pika_rnaseq_counts.csv"), show_col_types = FALSE) |>
  column_to_rownames("gene_id")
meta <- read_csv(here::here("assets/data/pika_rnaseq_metadata_clean.csv"),
                 show_col_types = FALSE)
mat <- as.matrix(counts[, meta$sample_id])
y <- DGEList(counts = mat, group = meta$group)
y <- y[filterByExpr(y, group = meta$group), , keep.lib.sizes = FALSE]
lcpm <- cpm(calcNormFactors(y), log = TRUE)
hc <- hclust(dist(t(lcpm)), method = "average")
cl <- cutree(hc, k = 2)
tab <- table(cluster = cl, group = meta$group)
bt <- table(cluster = cl, batch = meta$batch)
data.frame(
  cluster = 1:2,
  control = as.integer(tab[, "control"]),
  hypoxia = as.integer(tab[, "hypoxia"]),
  batch1 = as.integer(bt[, "batch1"]),
  batch2 = as.integer(bt[, "batch2"])
)
