library(readr); library(dplyr)
pika <- read_csv(here::here("assets/data/pika_physiology.csv"),
                 show_col_types = FALSE)
pika$altitude_group <- factor(pika$altitude_group,
                              levels = c("low", "mid", "high"))
m1 <- aov(body_mass_g ~ altitude_group, data = pika)
summary(m1)
