suppressPackageStartupMessages({
  library(readr); library(dplyr); library(tibble); library(edgeR); library(ggplot2)
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
scores <- as.data.frame(pca$x[, 1:2]) |>
  rownames_to_column("sample_id") |>
  left_join(meta, by = "sample_id")
p <- ggplot(scores, aes(PC1, PC2, colour = group, shape = batch)) +
  geom_point(size = 2.2) +
  scale_colour_manual(values = c(control = "#56B4E9", hypoxia = "#D55E00")) +
  scale_shape_manual(values = c(batch1 = 16, batch2 = 17)) +
  labs(x = paste0("PC1 (", var[1], "%)"), y = paste0("PC2 (", var[2], "%)"),
       colour = "Group", shape = "Batch") +
  theme_classic(base_size = 9)
dir.create(here::here("figures"), showWarnings = FALSE)
ggsave(here::here("figures/fig_pca.svg"), p, width = 89, height = 70, units = "mm")
data.frame(
  file = "figures/fig_pca.svg",
  exists = file.exists(here::here("figures/fig_pca.svg")),
  PC1_pct = var[1], PC2_pct = var[2]
)
