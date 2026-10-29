suppressPackageStartupMessages({
  library(readr); library(dplyr); library(lme4); library(lmerTest)
})
rep <- read_csv(here::here("assets/data/pika_repeated.csv"), show_col_types = FALSE) |>
  mutate(id = factor(id), treatment = factor(treatment), timepoint = factor(timepoint))
naive <- lm(body_mass_g ~ treatment, data = rep)
mixed <- lmer(body_mass_g ~ treatment + (1 | id), data = rep)
nm <- summary(naive)$coefficients["treatmenthypoxia", ]
mm <- summary(mixed)$coefficients["treatmenthypoxia", ]
data.frame(
  model = c("lm: 36 rows", "lmer: 12 ids"),
  estimate = round(unname(c(nm["Estimate"], mm["Estimate"])), 2),
  SE = round(unname(c(nm["Std. Error"], mm["Std. Error"])), 2),
  df = round(c(naive$df.residual, unname(mm["df"])), 1),
  p = signif(unname(c(nm["Pr(>|t|)"], mm["Pr(>|t|)"])), 2)
)
