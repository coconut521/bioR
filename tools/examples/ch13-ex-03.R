library(readr); library(dplyr); library(broom)
pika <- read_csv(here::here("assets/data/pika_physiology.csv"),
                 show_col_types = FALSE)
m1 <- lm(hemoglobin_g_l ~ altitude_m + sex, data = pika)
aug <- augment(m1)
c(shapiro_resid = round(shapiro.test(aug$.resid)$p.value, 3),
  max_hat = round(max(aug$.hat), 3),
  big_resid = sum(abs(aug$.std.resid) > 2))
