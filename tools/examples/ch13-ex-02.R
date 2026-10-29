library(readr); library(dplyr); library(broom)
pika <- read_csv(here::here("assets/data/pika_physiology.csv"),
                 show_col_types = FALSE)
m1 <- lm(hemoglobin_g_l ~ altitude_m + sex, data = pika)
glance(m1) |> select(r.squared, adj.r.squared, sigma, AIC)
