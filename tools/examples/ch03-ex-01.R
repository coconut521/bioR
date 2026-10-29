library(readr); library(dplyr)
pika <- read_csv(here::here("assets/data/pika_physiology.csv"),
                 show_col_types = FALSE)
glimpse(pika[, c("id", "altitude_group", "sex", "body_mass_g")])
