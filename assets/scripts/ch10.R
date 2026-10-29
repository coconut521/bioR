# ============================================================
# bioR · 描述统计与分布：先看数据，再做检验
# All example code for ch10, auto-assembled from tools/examples/.
# Regenerate: node tools/build-chapter-scripts.mjs
# Data: copy assets/data/ into your project before running.
# ============================================================

# ---- ch10-ex-01.R ----
library(readr); library(dplyr)
pika <- read_csv(here::here("assets/data/pika_physiology.csv"),
                 show_col_types = FALSE)
pika |>
  group_by(altitude_group) |>
  summarise(n = n(),
            mean = round(mean(body_mass_g), 1),
            sd = round(sd(body_mass_g), 1),
            median = round(median(body_mass_g), 1),
            iqr = round(IQR(body_mass_g), 1),
            .groups = "drop")
hb <- pika$hemoglobin_g_l
c(mean = round(mean(hb, na.rm = TRUE), 1),
  median = round(median(hb, na.rm = TRUE), 1),
  sd = round(sd(hb, na.rm = TRUE), 1),
  iqr = round(IQR(hb, na.rm = TRUE), 1))

# ---- ch10-ex-02.R ----
library(readr)
pika <- read_csv(here::here("assets/data/pika_physiology.csv"),
                 show_col_types = FALSE)
round(shapiro.test(pika$body_mass_g)$p.value, 3)
round(shapiro.test(pika$hemoglobin_g_l)$p.value, 3)
round(shapiro.test(log(pika$hemoglobin_g_l))$p.value, 3)

# ---- ch10-ex-03.R ----
library(readr); library(dplyr)
pika <- read_csv(here::here("assets/data/pika_physiology.csv"),
                 show_col_types = FALSE)
q <- quantile(pika$body_mass_g, c(.25, .75))
iqr <- IQR(pika$body_mass_g)
lo <- unname(q[1] - 1.5 * iqr)
hi <- unname(q[2] + 1.5 * iqr)
c(lower = round(lo, 1), upper = round(hi, 1))
pika |>
  filter(body_mass_g < lo | body_mass_g > hi) |>
  select(id, altitude_group, body_mass_g)

# ---- ch10-ex-04.R ----
library(readr); library(dplyr)
pika <- read_csv(here::here("assets/data/pika_physiology.csv"),
                 show_col_types = FALSE)
hb <- pika$hemoglobin_g_l
c(raw_mean = round(mean(hb, na.rm = TRUE), 1),
  raw_sd = round(sd(hb, na.rm = TRUE), 1))
c(log_mean = round(mean(log(hb), na.rm = TRUE), 2),
  log_sd = round(sd(log(hb), na.rm = TRUE), 2))
round(shapiro.test(log(hb))$p.value, 3)

# ---- ch10-ex-05.R ----
library(readr); library(dplyr); library(ggplot2); library(patchwork)
pika <- read_csv(here::here("assets/data/pika_physiology.csv"),
                 show_col_types = FALSE)
dir.create(here::here("figures"), showWarnings = FALSE)
hb <- pika$hemoglobin_g_l[!is.na(pika$hemoglobin_g_l)]
q <- quantile(pika$body_mass_g, c(.25, .75))
lo <- q[1] - 1.5 * IQR(pika$body_mass_g)
hi <- q[2] + 1.5 * IQR(pika$body_mass_g)
pika$outlier <- ifelse(pika$body_mass_g < lo | pika$body_mass_g > hi,
                       "IQR outlier", "within 1.5 x IQR")
panel_a <- ggplot(data.frame(hb = hb), aes(hb)) +
  geom_histogram(aes(y = after_stat(density)), binwidth = 5, boundary = 0,
                 fill = "#56B4E9", colour = "white") +
  geom_density(colour = "#0072B2") +
  labs(x = "Haemoglobin (g/L)", y = "Density") +
  theme_classic(base_size = 8)
panel_b <- ggplot(pika, aes("Body mass", body_mass_g)) +
  geom_boxplot(width = .35, outlier.shape = NA) +
  geom_jitter(aes(colour = outlier), width = .08, size = 1) +
  scale_colour_manual(values = c("IQR outlier" = "#D55E00",
                                 "within 1.5 x IQR" = "#4D4D4D")) +
  labs(x = NULL, y = "Body mass (g)", colour = NULL) +
  theme_classic(base_size = 8)
fig <- wrap_plots(panel_a, panel_b, nrow = 1) +
  plot_annotation(tag_levels = "A")
ggsave(here::here("figures/fig_distributions.svg"), fig,
       width = 183, height = 70, units = "mm")
file.exists(here::here("figures/fig_distributions.svg"))
