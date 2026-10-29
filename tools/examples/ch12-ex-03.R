library(readr); library(dplyr); suppressPackageStartupMessages(library(car))
pika <- read_csv(here::here("assets/data/pika_physiology.csv"),
                 show_col_types = FALSE)
pika$altitude_group <- factor(pika$altitude_group,
                              levels = c("low", "mid", "high"))
c(levene = round(leveneTest(body_mass_g ~ altitude_group, data = pika)$`Pr(>F)`[1], 3),
  kruskal = round(kruskal.test(body_mass_g ~ altitude_group, data = pika)$p.value, 3))
