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
