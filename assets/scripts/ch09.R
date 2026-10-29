# ============================================================
# bioR · 出版级图形：配色、排版、导出与图注
# All example code for ch09, auto-assembled from tools/examples/.
# Regenerate: node tools/build-chapter-scripts.mjs
# Data: copy assets/data/ into your project before running.
# ============================================================

# ---- ch09-ex-01.R ----
library(readr); library(ggplot2)
pika <- read_csv(here::here("assets/data/pika_physiology.csv"),
                 show_col_types = FALSE)
p <- ggplot(pika, aes(altitude_group, body_mass_g, fill = altitude_group)) +
  geom_boxplot(width = .55, outlier.shape = NA) +
  labs(x = NULL, y = "Body mass (g)") +
  theme_bw(base_size = 9) +
  theme(panel.grid.minor = element_blank(),
        strip.background = element_blank())
class(p$theme)
p$theme$text$size

# ---- ch09-ex-02.R ----
library(readr); library(ggplot2)
pika <- read_csv(here::here("assets/data/pika_physiology.csv"),
                 show_col_types = FALSE)
pika <- pika |>
  dplyr::mutate(altitude_group = factor(altitude_group,
                                        levels = c("low", "mid", "high")))
levels(pika$altitude_group)
pal <- c(low = "#56B4E9", mid = "#E69F00", high = "#0072B2")
scale_fill_manual(values = pal)$palette(3)

# ---- ch09-ex-03.R ----
library(readr); library(ggplot2); library(patchwork)
pika <- read_csv(here::here("assets/data/pika_physiology.csv"),
                 show_col_types = FALSE)
pika$altitude_group <- factor(pika$altitude_group,
                              levels = c("low", "mid", "high"))
panel_a <- ggplot(pika, aes(altitude_group, body_mass_g, fill = altitude_group)) +
  geom_boxplot(width = .55, outlier.shape = NA) +
  theme_classic(base_size = 8)
panel_b <- ggplot(pika[!is.na(pika$hemoglobin_g_l), ],
                  aes(altitude_m, hemoglobin_g_l, colour = sex)) +
  geom_point(size = 1.2) +
  theme_classic(base_size = 8)
fig <- wrap_plots(panel_a, panel_b, nrow = 1) +
  plot_annotation(tag_levels = "A")
class(fig)

# ---- ch09-ex-04.R ----
library(readr); library(ggplot2); library(patchwork); library(svglite)
pika <- read_csv(here::here("assets/data/pika_physiology.csv"),
                 show_col_types = FALSE)
pika$altitude_group <- factor(pika$altitude_group,
                              levels = c("low", "mid", "high"))
panel_a <- ggplot(pika, aes(altitude_group, body_mass_g, fill = altitude_group)) +
  geom_boxplot(width = .55, outlier.shape = NA) +
  scale_fill_manual(values = c(low = "#56B4E9", mid = "#E69F00",
                               high = "#0072B2"), guide = "none") +
  labs(x = NULL, y = "Body mass (g)") +
  theme_classic(base_size = 8)
panel_b <- ggplot(pika[!is.na(pika$hemoglobin_g_l), ],
                  aes(altitude_m, hemoglobin_g_l, colour = sex)) +
  geom_point(size = 1.2) +
  labs(x = "Altitude (m)", y = "Haemoglobin (g/L)") +
  theme_classic(base_size = 8)
fig <- wrap_plots(panel_a, panel_b, nrow = 1) +
  plot_annotation(tag_levels = "A")
dir.create(here::here("figures"), showWarnings = FALSE)
ggsave(here::here("figures/Figure1.pdf"), fig,
       width = 183, height = 105, units = "mm",
       device = cairo_pdf)
file.exists(here::here("figures/Figure1.pdf"))

# ---- ch09-ex-05.R ----
library(readr)
legend <- c(
  "Figure 1. Body mass and haemoglobin across altitude in plateau pikas.",
  "(A) Body mass by altitude group (low, mid, high; n = 20 per group). Boxes show the",
  "interquartile range (IQR) with the median as a horizontal line; whiskers extend to",
  "1.5 x IQR; individual animals are shown as points.",
  "(B) Haemoglobin concentration versus sampling altitude (n = 58; two haemolysis",
  "samples excluded). Sex is encoded by both colour and shape. Lines are ordinary",
  "least-squares fits shown for trend only; sampling altitudes were 3200, 4100 and",
  "5000 m.",
  "Data are simulated teaching data (fixed seed 20261027) and do not represent real",
  "animals. Colour palette: Okabe-Ito (colour-blind safe)."
)
dir.create(here::here("figures"), showWarnings = FALSE)
writeLines(legend, here::here("figures/figure1_legend.md"))
length(readLines(here::here("figures/figure1_legend.md")))
