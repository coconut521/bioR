library(readr); library(dplyr)
pika <- read_csv(here::here("assets/data/pika_physiology.csv"),
                 show_col_types = FALSE)
pika$body_mass_g[1]
pika[1, ]
pika[pika$sex == "F", "body_mass_g"]
