library(readr); library(effectsize)
pika <- read_csv(here::here("assets/data/pika_physiology.csv"),
                 show_col_types = FALSE)
d <- cohens_d(body_mass_g ~ sex, data = pika)
round(d$Cohens_d, 2)
round(d$CI_low, 2)
round(d$CI_high, 2)
