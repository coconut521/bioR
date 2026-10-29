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
