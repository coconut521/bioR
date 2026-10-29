library(readr); library(dplyr)
pika <- read_csv(here::here("assets/data/pika_physiology.csv"),
                 show_col_types = FALSE)
q <- quantile(pika$body_mass_g, c(.25, .75))
iqr <- IQR(pika$body_mass_g)
lo <- unname(q[1] - 1.5 * iqr)
hi <- unname(q[2] + 1.5 * iqr)
c(lower = round(lo, 1), upper = round(hi, 1))
pika |>
  filter(body_mass_g < lo | body_mass_g > hi) |>
  select(id, altitude_group, body_mass_g)
