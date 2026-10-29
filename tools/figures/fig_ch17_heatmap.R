# ============================================================
# fig_ch17_heatmap.R — top-60 variable genes, row-scaled logCPM,
# samples ordered by group (control then hypoxia).
# ============================================================

build_figure <- function(data) {
  counts <- data[["pika_rnaseq_counts.csv"]]
  meta <- data[["pika_rnaseq_metadata_clean.csv"]]
  mat <- as.matrix(counts[, meta$sample_id])
  rownames(mat) <- counts$gene_id
  y <- edgeR::DGEList(counts = mat, group = meta$group)
  keep <- edgeR::filterByExpr(y, group = meta$group)
  y <- y[keep, , keep.lib.sizes = FALSE]
  lcpm <- edgeR::cpm(edgeR::calcNormFactors(y), log = TRUE)
  top <- order(apply(lcpm, 1, stats::var), decreasing = TRUE)[1:60]
  z <- t(scale(t(lcpm[top, ])))
  long <- data.frame(
    gene = rep(rownames(z), times = ncol(z)),
    sample_id = rep(colnames(z), each = nrow(z)),
    z = as.vector(z)
  )
  long$sample_id <- factor(long$sample_id, levels = meta$sample_id)
  long$gene <- factor(long$gene, levels = rev(rownames(z)))
  ggplot2::ggplot(long, ggplot2::aes(sample_id, gene, fill = z)) +
    ggplot2::geom_tile() +
    ggplot2::scale_fill_viridis_c(option = "C", name = "z-score") +
    ggplot2::scale_x_discrete(expand = c(0, 0)) +
    ggplot2::scale_y_discrete(expand = c(0, 0), breaks = NULL) +
    ggplot2::labs(x = NULL, y = "Top 60 variable genes") +
    theme_bio(8) +
    ggplot2::theme(axis.text.x = ggplot2::element_text(angle = 0, size = 6),
                   panel.grid = ggplot2::element_blank())
}
