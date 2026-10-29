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
