library(readr); library(dplyr)
pika <- read_csv(here::here("assets/data/pika_physiology.csv"),
                 show_col_types = FALSE)
pika |>
  group_by(altitude_group) |>
  summarise(n = n(),
            mean = round(mean(body_mass_g), 1),
            sd = round(sd(body_mass_g), 1),
            median = round(median(body_mass_g), 1),
            iqr = round(IQR(body_mass_g), 1),
            .groups = "drop")
hb <- pika$hemoglobin_g_l
c(mean = round(mean(hb, na.rm = TRUE), 1),
  median = round(median(hb, na.rm = TRUE), 1),
  sd = round(sd(hb, na.rm = TRUE), 1),
  iqr = round(IQR(hb, na.rm = TRUE), 1))
