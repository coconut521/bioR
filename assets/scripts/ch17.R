# ============================================================
# bioR · 多变量与聚类：PCA、热图与样本分群
# All example code for ch17, auto-assembled from tools/examples/.
# Regenerate: node tools/build-chapter-scripts.mjs
# Data: copy assets/data/ into your project before running.
# ============================================================

# ---- ch17-ex-01.R ----
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

# ---- ch17-ex-02.R ----
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

# ---- ch17-ex-03.R ----
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

# ---- ch17-ex-04.R ----
suppressPackageStartupMessages({
  library(readr); library(dplyr); library(tibble); library(edgeR); library(pheatmap)
})
counts <- read_csv(here::here("assets/data/pika_rnaseq_counts.csv"), show_col_types = FALSE) |>
  column_to_rownames("gene_id")
meta <- read_csv(here::here("assets/data/pika_rnaseq_metadata_clean.csv"),
                 show_col_types = FALSE)
mat <- as.matrix(counts[, meta$sample_id])
y <- DGEList(counts = mat, group = meta$group)
y <- y[filterByExpr(y, group = meta$group), , keep.lib.sizes = FALSE]
lcpm <- cpm(calcNormFactors(y), log = TRUE)
top <- order(apply(lcpm, 1, var), decreasing = TRUE)[1:500]
ann <- data.frame(group = meta$group, batch = meta$batch,
                  row.names = meta$sample_id)
dir.create(here::here("figures"), showWarnings = FALSE)
ph <- pheatmap(lcpm[top, ], annotation_col = ann, show_rownames = FALSE,
               cluster_cols = TRUE, fontsize = 6, silent = TRUE,
               color = viridisLite::viridis(100),
               annotation_colors = list(
                 group = c(control = "#56B4E9", hypoxia = "#D55E00"),
                 batch = c(batch1 = "#56B4E9", batch2 = "#D55E00")))
svglite::svglite(file = here::here("figures/fig_heatmap.svg"),
                 width = 7, height = 8)
grid::grid.draw(ph$gtable)
invisible(dev.off())
data.frame(
  file = "figures/fig_heatmap.svg",
  exists = file.exists(here::here("figures/fig_heatmap.svg")),
  genes = length(top), samples = ncol(lcpm)
)

# ---- ch17-ex-05.R ----
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
