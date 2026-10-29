library(readr); library(ggplot2)
pika <- read_csv(here::here("assets/data/pika_physiology.csv"),
                 show_col_types = FALSE)
p <- ggplot(pika, aes(altitude_group, body_mass_g, fill = altitude_group)) +
  geom_boxplot(width = .55, outlier.shape = NA) +
  facet_wrap(~sex, nrow = 1)
length(unique(p$data$sex))
class(p$facet)
