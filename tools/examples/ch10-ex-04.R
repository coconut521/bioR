library(readr); library(dplyr)
pika <- read_csv(here::here("assets/data/pika_physiology.csv"),
                 show_col_types = FALSE)
hb <- pika$hemoglobin_g_l
c(raw_mean = round(mean(hb, na.rm = TRUE), 1),
  raw_sd = round(sd(hb, na.rm = TRUE), 1))
c(log_mean = round(mean(log(hb), na.rm = TRUE), 2),
  log_sd = round(sd(log(hb), na.rm = TRUE), 2))
round(shapiro.test(log(hb))$p.value, 3)
