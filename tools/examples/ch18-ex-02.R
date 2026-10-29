suppressPackageStartupMessages({
  library(readr); library(dplyr); library(tibble); library(DESeq2)
})
counts <- read_csv(here::here("assets/data/pika_rnaseq_counts.csv"), show_col_types = FALSE) |>
  column_to_rownames("gene_id")
meta <- read_csv(here::here("assets/data/pika_rnaseq_metadata_clean.csv"),
                 show_col_types = FALSE)
mat <- as.matrix(counts[, meta$sample_id])
dds <- suppressMessages(suppressWarnings(DESeqDataSetFromMatrix(mat, meta, ~ group)))
dds <- dds[rowSums(counts(dds) >= 10) >= 6, ]
dds <- suppressMessages(DESeq(dds))
res <- results(dds, contrast = c("group", "hypoxia", "control"))
data.frame(
  tested = sum(!is.na(res$padj)),
  padj_0.05 = sum(res$padj < 0.05, na.rm = TRUE),
  up = sum(res$padj < 0.05 & res$log2FoldChange > 1, na.rm = TRUE),
  down = sum(res$padj < 0.05 & res$log2FoldChange < -1, na.rm = TRUE)
)
