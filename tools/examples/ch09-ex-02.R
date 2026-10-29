library(readr); library(ggplot2)
pika <- read_csv(here::here("assets/data/pika_physiology.csv"),
                 show_col_types = FALSE)
pika <- pika |>
  dplyr::mutate(altitude_group = factor(altitude_group,
                                        levels = c("low", "mid", "high")))
levels(pika$altitude_group)
pal <- c(low = "#56B4E9", mid = "#E69F00", high = "#0072B2")
scale_fill_manual(values = pal)$palette(3)
