library(readr); library(dplyr)
pika <- read_csv(here::here("assets/data/pika_physiology.csv"),
                 show_col_types = FALSE)
sum(is.na(pika$hemoglobin_g_l))
sum(duplicated(pika$id))
sum(pika$body_mass_g < 110 | pika$body_mass_g > 240, na.rm = TRUE)
