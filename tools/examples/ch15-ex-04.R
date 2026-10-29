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
