library(dplyr); library(readr)
pika <- read_csv(here::here("assets/data/pika_physiology.csv"),
                 show_col_types = FALSE)
pika |>
  group_by(altitude_group) |>
  summarise(
    n = n(),
    mean_mass = mean(body_mass_g, na.rm = TRUE),
    sd_mass = sd(body_mass_g, na.rm = TRUE)
  )
