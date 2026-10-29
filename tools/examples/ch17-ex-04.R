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
