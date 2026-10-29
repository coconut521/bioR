library(readr); library(dplyr); library(broom)
pika <- read_csv(here::here("assets/data/pika_physiology.csv"),
                 show_col_types = FALSE)
m1 <- lm(hemoglobin_g_l ~ altitude_m + sex, data = pika)
tidy(m1, conf.int = TRUE) |>
  select(term, estimate, conf.low, conf.high, p.value)
