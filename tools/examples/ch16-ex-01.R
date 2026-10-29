suppressPackageStartupMessages({
  library(readr); library(dplyr); library(survival)
})
d <- read_csv(here::here("assets/data/pika_survival.csv"), show_col_types = FALSE) |>
  mutate(status = as.integer(status), treatment = factor(treatment))
d |>
  group_by(treatment) |>
  summarise(n = n(), events = sum(status), censored = sum(status == 0),
            median_follow = median(time_days), max_follow = max(time_days)) |>
  ungroup() |>
  as.data.frame()
