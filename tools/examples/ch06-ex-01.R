library(readr); library(dplyr)
pika <- read_csv(here::here("assets/data/pika_physiology.csv"),
                 show_col_types = FALSE)
pika |>
  filter(!is.na(hemoglobin_g_l), body_mass_g >= 110, body_mass_g <= 240) |>
  nrow()
pika |>
  filter(is.na(hemoglobin_g_l) | body_mass_g < 110 | body_mass_g > 240) |>
  select(id, body_mass_g, hemoglobin_g_l)
