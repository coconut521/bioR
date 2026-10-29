# ============================================================
# fig_ch17_pca.R — PCA of logCPM expression, coloured by group and
# shaped by batch. Group and batch are fully confounded by design.
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
  pca <- stats::prcomp(t(lcpm), scale. = TRUE)
  var <- round(100 * pca$sdev^2 / sum(pca$sdev^2), 1)
  scores <- as.data.frame(pca$x[, 1:2])
  scores$sample_id <- rownames(scores)
  scores <- merge(scores, meta, by = "sample_id")
  ggplot2::ggplot(scores, ggplot2::aes(PC1, PC2, colour = group, shape = batch)) +
    ggplot2::geom_point(size = 2.2) +
    ggplot2::scale_colour_manual(values = palette_bio$group) +
    ggplot2::scale_shape_manual(values = c(16, 17)) +
    ggplot2::labs(x = paste0("PC1 (", var[1], "%)"),
                  y = paste0("PC2 (", var[2], "%)"),
                  colour = "Group", shape = "Batch") +
    theme_bio(8)
}
