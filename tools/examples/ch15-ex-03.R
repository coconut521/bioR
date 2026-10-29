suppressPackageStartupMessages({
  library(readr); library(dplyr); library(lme4); library(lmerTest); library(emmeans)
})
rep <- read_csv(here::here("assets/data/pika_repeated.csv"), show_col_types = FALSE) |>
  mutate(id = factor(id), treatment = factor(treatment), timepoint = factor(timepoint))
m <- lmer(body_mass_g ~ treatment + timepoint + (1 | id), data = rep)
coefs <- summary(m)$coefficients
coefs <- coefs[rownames(coefs) != "(Intercept)", , drop = FALSE]
data.frame(
  term = rownames(coefs),
  estimate = round(coefs[, "Estimate"], 3),
  SE = round(coefs[, "Std. Error"], 3),
  p = round(coefs[, "Pr(>|t|)"], 3)
)
emm <- emmeans(m, ~ treatment)
pr <- as.data.frame(pairs(emm))
data.frame(contrast = as.character(pr$contrast),
           estimate = round(pr$estimate, 2),
           SE = round(pr$SE, 2), p = round(pr$p.value, 3))
