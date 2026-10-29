suppressPackageStartupMessages({
  library(readr); library(dplyr); library(survival)
})
d <- read_csv(here::here("assets/data/pika_survival.csv"), show_col_types = FALSE) |>
  mutate(status = as.integer(status), treatment = factor(treatment))
cox <- coxph(Surv(time_days, status) ~ treatment, data = d)
z <- cox.zph(cox)
data.frame(
  term = rownames(z$table),
  chisq = round(z$table[, "chisq"], 2),
  df = z$table[, "df"],
  p = round(z$table[, "p"], 3)
)
