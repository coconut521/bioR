library(readr); library(dplyr)
pika <- read_csv(here::here("assets/data/pika_physiology.csv"),
                 show_col_types = FALSE)
pika |>
  group_by(altitude_group) |>
  summarise(
    n = n(),
    n_valid = sum(!is.na(hemoglobin_g_l)),
    hb_mean = round(mean(hemoglobin_g_l, na.rm = TRUE), 1),
    hb_sd = round(sd(hemoglobin_g_l, na.rm = TRUE), 1),
    .groups = "drop"
  )
