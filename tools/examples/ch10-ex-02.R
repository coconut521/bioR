library(readr)
pika <- read_csv(here::here("assets/data/pika_physiology.csv"),
                 show_col_types = FALSE)
round(shapiro.test(pika$body_mass_g)$p.value, 3)
round(shapiro.test(pika$hemoglobin_g_l)$p.value, 3)
round(shapiro.test(log(pika$hemoglobin_g_l))$p.value, 3)
