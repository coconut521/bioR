suppressPackageStartupMessages({
  library(readr); library(dplyr); library(tidyr); library(tibble); library(DESeq2)
  library(clusterProfiler)
})
counts <- read_csv(here::here("assets/data/pika_rnaseq_counts.csv"), show_col_types = FALSE) |>
  column_to_rownames("gene_id")
meta <- read_csv(here::here("assets/data/pika_rnaseq_metadata_clean.csv"),
                 show_col_types = FALSE)
ann <- read_csv(here::here("assets/data/pika_annotation.csv"), show_col_types = FALSE)
mat <- as.matrix(counts[, meta$sample_id])
dds <- suppressMessages(suppressWarnings(DESeqDataSetFromMatrix(mat, meta, ~ group)))
dds <- dds[rowSums(counts(dds) >= 10) >= 6, ]
dds <- suppressMessages(DESeq(dds))
res <- results(dds, contrast = c("group", "hypoxia", "control"))
genes <- rownames(res)[!is.na(res$padj) & res$padj < 0.05 & abs(res$log2FoldChange) > 1]
t2g <- ann |>
  select(kegg_pathway, gene_id) |>
  separate_rows(kegg_pathway, sep = ";") |>
  filter(!is.na(kegg_pathway), kegg_pathway != "")
en <- enricher(genes, TERM2GENE = t2g, universe = rownames(dds),
               pvalueCutoff = 1, qvalueCutoff = 1)
out <- as.data.frame(en)
data.frame(
  term = out$ID[1:4],
  ratio = out$GeneRatio[1:4],
  p_adjust = signif(out$p.adjust[1:4], 3)
)
