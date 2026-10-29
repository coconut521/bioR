suppressPackageStartupMessages({
  library(readr); library(dplyr); library(tidyr); library(tibble); library(DESeq2)
  library(apeglm); library(clusterProfiler); library(ggplot2)
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
res <- suppressMessages(lfcShrink(dds, coef = "group_hypoxia_vs_control", type = "apeglm"))
de <- as.data.frame(res) |>
  rownames_to_column("gene_id") |>
  left_join(select(ann, gene_id, symbol), by = "gene_id") |>
  arrange(padj)
dir.create(here::here("data"), showWarnings = FALSE)
dir.create(here::here("figures"), showWarnings = FALSE)
write_csv(de, here::here("data/de_results.csv"))
genes <- de$gene_id[!is.na(de$padj) & de$padj < 0.05 & abs(de$log2FoldChange) > 1]
t2g <- ann |>
  select(kegg_pathway, gene_id) |>
  separate_rows(kegg_pathway, sep = ";") |>
  filter(!is.na(kegg_pathway), kegg_pathway != "")
en <- enricher(genes, TERM2GENE = t2g, universe = rownames(dds),
               pvalueCutoff = 1, qvalueCutoff = 1)
enr <- as.data.frame(en) |>
  mutate(ratio = vapply(strsplit(GeneRatio, "/"), function(x) as.numeric(x[1]) / as.numeric(x[2]), 0)) |>
  arrange(p.adjust) |>
  slice_head(n = 8)
p <- ggplot(enr, aes(ratio, reorder(Description, ratio), size = Count, colour = p.adjust)) +
  geom_point() +
  scale_colour_viridis_c(option = "C", trans = "reverse", name = "p.adjust") +
  labs(x = "Gene ratio", y = NULL, size = "Genes") +
  theme_classic(base_size = 8)
ggsave(here::here("figures/fig_enrichment.svg"), p, width = 120, height = 80, units = "mm")
data.frame(
  file = c("data/de_results.csv", "figures/fig_enrichment.svg"),
  exists = file.exists(here::here(c("data/de_results.csv", "figures/fig_enrichment.svg"))),
  de_rows = c(nrow(de), NA),
  min_padj = c(signif(min(de$padj, na.rm = TRUE), 2), NA)
)
