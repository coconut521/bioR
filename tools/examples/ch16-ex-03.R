suppressPackageStartupMessages({
  library(readr); library(dplyr); library(survival)
})
d <- read_csv(here::here("assets/data/pika_survival.csv"), show_col_types = FALSE) |>
  mutate(status = as.integer(status), treatment = factor(treatment))
lr <- survdiff(Surv(time_days, status) ~ treatment, data = d)
cox <- coxph(Surv(time_days, status) ~ treatment, data = d)
s <- summary(cox)
r1 <- data.frame(
  test = "log-rank",
  value = round(lr$chisq, 2), lower = NA, upper = NA,
  p = signif(pchisq(lr$chisq, df = 1, lower.tail = FALSE), 3)
)
r2 <- data.frame(
  test = paste0("Cox HR: ", rownames(s$conf.int)),
  value = round(s$conf.int[, "exp(coef)"], 2),
  lower = round(s$conf.int[, "lower .95"], 2),
  upper = round(s$conf.int[, "upper .95"], 2),
  p = signif(s$coefficients[, "Pr(>|z|)"], 3)
)
rbind(r1, r2)
