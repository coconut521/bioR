library(readr); library(dplyr); library(broom)
pika <- read_csv(here::here("assets/data/pika_physiology.csv"),
                 show_col_types = FALSE)
m2 <- lm(log(body_mass_g) ~ log(body_length_mm), data = pika)
tidy(m2, conf.int = TRUE) |> select(term, estimate, conf.low, conf.high)
