# ============================================================
# fig_ch18_volcano.R — shrunken log2FC vs -log10(padj), with
# FDR 0.05 and |LFC| = 1 thresholds.
# ============================================================

build_figure <- function(data) {
  counts <- data[["pika_rnaseq_counts.csv"]]
  meta <- data[["pika_rnaseq_metadata_clean.csv"]]
  mat <- as.matrix(counts[, meta$sample_id])
  rownames(mat) <- counts$gene_id
  dds <- suppressMessages(suppressWarnings(
    DESeq2::DESeqDataSetFromMatrix(mat, meta, ~ group)))
  dds <- dds[rowSums(DESeq2::counts(dds) >= 10) >= 6, ]
  dds <- suppressMessages(DESeq2::DESeq(dds))
  res <- suppressMessages(DESeq2::lfcShrink(
    dds, coef = "group_hypoxia_vs_control", type = "apeglm"))
  df <- as.data.frame(res)
  df$gene_id <- rownames(df)
  df$sig <- ifelse(is.na(df$padj) | df$padj >= 0.05 | abs(df$log2FoldChange) <= 1, "ns",
                   ifelse(df$log2FoldChange > 1, "up", "down"))
  ns <- df[df$sig == "ns", ]
  sig <- df[df$sig != "ns", ]
  ggplot2::ggplot(df, ggplot2::aes(log2FoldChange, -log10(padj))) +
    ggplot2::geom_hex(data = ns, bins = 24, colour = NA) +
    ggplot2::scale_fill_gradient(low = "#F3ECDF", high = "#8C7F6D",
                                 name = "Density") +
    ggplot2::geom_point(data = sig, ggplot2::aes(colour = sig), size = .9) +
    ggplot2::scale_colour_manual(values = c(up = "#D55E00", down = "#0072B2"),
                                 breaks = c("up", "down"), name = "FDR + LFC") +
    ggplot2::geom_vline(xintercept = c(-1, 1), linetype = "dashed",
                        linewidth = .3) +
    ggplot2::geom_hline(yintercept = -log10(0.05), linetype = "dashed",
                        linewidth = .3) +
    ggplot2::labs(x = "shrunken log2 fold change", y = "-log10(padj)") +
    theme_bio(8)
}
