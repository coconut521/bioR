library(readr); library(ggplot2)
pika <- read_csv(here::here("assets/data/pika_physiology.csv"),
                 show_col_types = FALSE)
dir.create(here::here("figures"), showWarnings = FALSE)
p_mass <- ggplot(pika, aes(altitude_group, body_mass_g, fill = altitude_group)) +
  geom_boxplot(width = .55, outlier.shape = NA) +
  geom_jitter(width = .12, alpha = .45, size = .7) +
  scale_fill_manual(values = c(low = "#56B4E9", mid = "#E69F00",
                               high = "#0072B2"), guide = "none") +
  labs(x = "Altitude group", y = "Body mass (g)") +
  theme_classic(base_size = 9)
p_hb <- ggplot(pika[!is.na(pika$hemoglobin_g_l), ],
               aes(altitude_m, hemoglobin_g_l, colour = sex)) +
  geom_point(size = 1.4, alpha = .8) +
  labs(x = "Altitude (m)", y = "Haemoglobin (g/L)") +
  theme_classic(base_size = 9)
p_sex <- ggplot(pika, aes(altitude_group, body_mass_g, fill = altitude_group)) +
  geom_boxplot(width = .55, outlier.shape = NA) +
  facet_wrap(~sex, nrow = 1) +
  scale_fill_manual(values = c(low = "#56B4E9", mid = "#E69F00",
                               high = "#0072B2"), guide = "none") +
  labs(x = NULL, y = "Body mass (g)") +
  theme_classic(base_size = 9)
ggsave(here::here("figures/fig_explore_mass.svg"), p_mass,
       width = 89, height = 55, units = "mm")
ggsave(here::here("figures/fig_explore_hb.svg"), p_hb,
       width = 89, height = 55, units = "mm")
ggsave(here::here("figures/fig_explore_sex.svg"), p_sex,
       width = 89, height = 65, units = "mm")
file.exists(here::here(c("figures/fig_explore_mass.svg",
                         "figures/fig_explore_hb.svg",
                         "figures/fig_explore_sex.svg")))
