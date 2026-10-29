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
