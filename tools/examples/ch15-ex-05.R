suppressPackageStartupMessages({
  library(readr); library(dplyr); library(lme4); library(lmerTest); library(performance)
})
rep <- read_csv(here::here("assets/data/pika_repeated.csv"), show_col_types = FALSE) |>
  mutate(id = factor(id), treatment = factor(treatment), timepoint = factor(timepoint))
m <- lmer(hemoglobin_g_l ~ treatment + timepoint + (1 | id), data = rep)
coefs <- summary(m)$coefficients
est <- coefs[, "Estimate"]
se <- coefs[, "Std. Error"]
res <- data.frame(
  term = rownames(coefs),
  estimate = round(est, 3),
  SE = round(se, 3),
  conf_low = round(est - 1.96 * se, 3),
  conf_high = round(est + 1.96 * se, 3),
  df = round(coefs[, "df"], 2),
  t = round(coefs[, "t value"], 2),
  p = signif(coefs[, "Pr(>|t|)"], 3)
)
dir.create(here::here("data"), showWarnings = FALSE)
write_csv(res, here::here("data/stats_mixed.csv"))
data.frame(
  file = "data/stats_mixed.csv",
  rows = nrow(res),
  ICC = round(performance::icc(m)$ICC_adjusted, 3),
  max_p = signif(max(res$p), 2)
)
