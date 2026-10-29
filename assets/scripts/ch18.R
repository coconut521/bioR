# ============================================================
# bioR · 转录组差异分析：从 counts 到基因列表
# All example code for ch18, auto-assembled from tools/examples/.
# Regenerate: node tools/build-chapter-scripts.mjs
# Data: copy assets/data/ into your project before running.
# ============================================================

# ---- ch18-ex-01.R ----
suppressPackageStartupMessages({
  library(readr); library(dplyr); library(tibble)
})
counts <- read_csv(here::here("assets/data/pika_rnaseq_counts.csv"), show_col_types = FALSE) |>
  column_to_rownames("gene_id")
meta <- read_csv(here::here("assets/data/pika_rnaseq_metadata_clean.csv"),
                 show_col_types = FALSE)
ct <- table(group = meta$group, batch = meta$batch)
data.frame(
  group = rownames(ct),
  batch1 = as.integer(ct[, "batch1"]),
  batch2 = as.integer(ct[, "batch2"])
)
c(genes = nrow(counts), samples = ncol(as.matrix(counts[, meta$sample_id])))

# ---- ch18-ex-02.R ----
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

# ---- ch18-ex-03.R ----
suppressPackageStartupMessages({
  library(readr); library(dplyr); library(tibble); library(DESeq2)
  library(apeglm); library(ggplot2)
})
counts <- read_csv(here::here("assets/data/pika_rnaseq_counts.csv"), show_col_types = FALSE) |>
  column_to_rownames("gene_id")
meta <- read_csv(here::here("assets/data/pika_rnaseq_metadata_clean.csv"),
                 show_col_types = FALSE)
mat <- as.matrix(counts[, meta$sample_id])
dds <- suppressMessages(suppressWarnings(DESeqDataSetFromMatrix(mat, meta, ~ group)))
dds <- dds[rowSums(counts(dds) >= 10) >= 6, ]
dds <- suppressMessages(DESeq(dds))
res <- suppressMessages(lfcShrink(dds, coef = "group_hypoxia_vs_control", type = "apeglm"))
df <- as.data.frame(res) |>
  rownames_to_column("gene_id")
df$sig <- ifelse(is.na(df$padj) | df$padj >= 0.05 | abs(df$log2FoldChange) <= 1, "ns",
                 ifelse(df$log2FoldChange > 1, "up", "down"))
p <- ggplot(df, aes(log2FoldChange, -log10(padj), colour = sig)) +
  geom_point(size = .7, alpha = .7, na.rm = TRUE) +
  scale_colour_manual(values = c(up = "#D55E00", down = "#0072B2", ns = "#B5A48D")) +
  geom_vline(xintercept = c(-1, 1), linetype = "dashed", linewidth = .3) +
  geom_hline(yintercept = -log10(0.05), linetype = "dashed", linewidth = .3) +
  labs(x = "shrunken log2 fold change", y = "-log10(padj)", colour = "FDR + LFC") +
  theme_classic(base_size = 9)
dir.create(here::here("figures"), showWarnings = FALSE)
ggsave(here::here("figures/fig_volcano.svg"), p, width = 89, height = 70, units = "mm")
data.frame(
  file = "figures/fig_volcano.svg",
  exists = file.exists(here::here("figures/fig_volcano.svg")),
  up = sum(df$sig == "up"), down = sum(df$sig == "down"), ns = sum(df$sig == "ns")
)

# ---- ch18-ex-04.R ----
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

# ---- ch18-ex-05.R ----
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
