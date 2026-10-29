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
