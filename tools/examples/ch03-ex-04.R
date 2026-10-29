library(readr); library(dplyr)
pika <- read_csv(here::here("assets/data/pika_physiology.csv"),
                 show_col_types = FALSE)
pika_tidy <- pika |>
  mutate(altitude_group = factor(altitude_group,
    levels = c("low", "mid", "high"), ordered = TRUE))
levels(pika_tidy$altitude_group)
table(pika_tidy$altitude_group)
