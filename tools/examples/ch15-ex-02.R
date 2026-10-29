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
