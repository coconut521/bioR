library(readr); library(dplyr); library(ggplot2)
pika <- read_csv(here::here("assets/data/pika_physiology.csv"),
                 show_col_types = FALSE)
p <- ggplot(pika, aes(altitude_group, body_mass_g, fill = altitude_group)) +
  geom_boxplot(width = .55, outlier.shape = NA) +
  geom_jitter(width = .12, alpha = .45, size = .7)
class(p)
rlang::as_label(p$mapping$x)
range(pika$body_mass_g)
