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
pca <- prcomp(t(lcpm), scale. = TRUE)
var <- round(100 * pca$sdev^2 / sum(pca$sdev^2), 1)
cent <- aggregate(pca$x[, 1:2], by = list(group = meta$group), mean)
cm <- cent[cent$group == "control", c("PC1", "PC2")]
hm <- cent[cent$group == "hypoxia", c("PC1", "PC2")]
data.frame(
  PC = c("PC1", "PC2"),
  variance_pct = var[1:2],
  control = round(as.numeric(cm), 1),
  hypoxia = round(as.numeric(hm), 1)
)
