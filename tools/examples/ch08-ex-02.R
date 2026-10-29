library(readr); library(dplyr)
pika <- read_csv(here::here("assets/data/pika_physiology.csv"),
                 show_col_types = FALSE)
pika |>
  group_by(altitude_group) |>
  summarise(
    n = n(),
    mean = round(mean(body_mass_g), 1),
    median = round(median(body_mass_g), 1),
    min = round(min(body_mass_g), 1),
    max = round(max(body_mass_g), 1),
    .groups = "drop"
  )
