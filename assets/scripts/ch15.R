# ============================================================
# bioR · 混合效应与重复测量：别把伪重复当独立样本
# All example code for ch15, auto-assembled from tools/examples/.
# Regenerate: node tools/build-chapter-scripts.mjs
# Data: copy assets/data/ into your project before running.
# ============================================================

# ---- ch15-ex-01.R ----
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

# ---- ch15-ex-02.R ----
suppressPackageStartupMessages({
  library(readr); library(dplyr); library(lme4); library(performance)
})
rep <- read_csv(here::here("assets/data/pika_repeated.csv"), show_col_types = FALSE) |>
  mutate(id = factor(id), treatment = factor(treatment), timepoint = factor(timepoint))
m0 <- lmer(body_mass_g ~ 1 + (1 | id), data = rep)
vc <- as.data.frame(VarCorr(m0))
icc <- performance::icc(m0)
data.frame(
  component = c("id (between)", "residual (within)", "ICC"),
  variance = round(c(vc$vcov[1], vc$vcov[2], icc$ICC_adjusted), 3)
)

# ---- ch15-ex-03.R ----
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

# ---- ch15-ex-04.R ----
suppressPackageStartupMessages({
  library(readr); library(dplyr); library(lme4)
})
rep <- read_csv(here::here("assets/data/pika_repeated.csv"), show_col_types = FALSE) |>
  mutate(id = factor(id), treatment = factor(treatment), batch = factor(batch))
m1 <- lmer(body_mass_g ~ treatment + (1 | id), data = rep, REML = FALSE)
m2 <- suppressWarnings(lmer(body_mass_g ~ treatment + (1 | id) + (1 | batch),
                            data = rep, REML = FALSE))
cmp <- anova(m1, m2)
data.frame(
  model = c("id only", "id + batch"),
  AIC = round(cmp$AIC, 1),
  LRT = c(NA, round(cmp$Chisq[2], 2)),
  p = c(NA, round(cmp$`Pr(>Chisq)`[2], 3)),
  singular = c(isSingular(m1), isSingular(m2))
)
vc <- as.data.frame(VarCorr(m2))
vc[, c("grp", "vcov")]

# ---- ch15-ex-05.R ----
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
