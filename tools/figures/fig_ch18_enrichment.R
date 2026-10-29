# ============================================================
# fig_ch18_enrichment.R — KEGG over-representation bubble plot for
# the DE gene list; no term passes FDR 0.05 in this simulated data.
# ============================================================

build_figure <- function(data) {
  counts <- data[["pika_rnaseq_counts.csv"]]
  meta <- data[["pika_rnaseq_metadata_clean.csv"]]
  ann <- data[["pika_annotation.csv"]]
  mat <- as.matrix(counts[, meta$sample_id])
  rownames(mat) <- counts$gene_id
  dds <- suppressMessages(suppressWarnings(
    DESeq2::DESeqDataSetFromMatrix(mat, meta, ~ group)))
  dds <- dds[rowSums(DESeq2::counts(dds) >= 10) >= 6, ]
  dds <- suppressMessages(DESeq2::DESeq(dds))
  res <- DESeq2::results(dds, contrast = c("group", "hypoxia", "control"))
  genes <- rownames(res)[!is.na(res$padj) & res$padj < 0.05 &
                           abs(res$log2FoldChange) > 1]
  t2g <- ann |>
    dplyr::select(kegg_pathway, gene_id) |>
    tidyr::separate_rows(kegg_pathway, sep = ";") |>
    dplyr::filter(!is.na(kegg_pathway), kegg_pathway != "")
  en <- clusterProfiler::enricher(genes, TERM2GENE = t2g,
                                  universe = rownames(dds),
                                  pvalueCutoff = 1, qvalueCutoff = 1)
  enr <- as.data.frame(en)
  enr$ratio <- vapply(strsplit(enr$GeneRatio, "/"),
                      function(x) as.numeric(x[1]) / as.numeric(x[2]), 0)
  enr <- enr[order(enr$p.adjust), ][seq_len(min(8, nrow(enr))), ]
  ggplot2::ggplot(enr, ggplot2::aes(ratio, reorder(Description, ratio),
                                    size = Count, colour = p.adjust)) +
    ggplot2::geom_point() +
    ggplot2::scale_colour_viridis_c(option = "C", trans = "reverse",
                                    name = "p.adjust") +
    ggplot2::labs(x = "Gene ratio", y = NULL, size = "Genes") +
    theme_bio(7)
}
