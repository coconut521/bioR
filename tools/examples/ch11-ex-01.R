library(readr); library(dplyr); library(broom)
pika <- read_csv(here::here("assets/data/pika_physiology.csv"),
                 show_col_types = FALSE)
res <- t.test(body_mass_g ~ sex, data = pika)
tidy(res) |> select(estimate1, estimate2, estimate, conf.low, conf.high, p.value)
