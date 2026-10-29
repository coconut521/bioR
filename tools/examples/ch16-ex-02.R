suppressPackageStartupMessages({
  library(readr); library(dplyr); library(survival)
})
d <- read_csv(here::here("assets/data/pika_survival.csv"), show_col_types = FALSE) |>
  mutate(status = as.integer(status), treatment = factor(treatment))
fit <- survfit(Surv(time_days, status) ~ treatment, data = d)
tb <- summary(fit)$table
data.frame(
  group = unname(sub("treatment=", "", rownames(tb))),
  n = unname(tb[, "records"]),
  events = unname(tb[, "events"]),
  median_days = unname(round(tb[, "median"], 1)),
  LCL = unname(round(tb[, "0.95LCL"], 1)),
  UCL = unname(round(tb[, "0.95UCL"], 1)),
  row.names = NULL
)
