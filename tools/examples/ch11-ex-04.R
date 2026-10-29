library(readr); library(dplyr); library(tidyr); library(broom)
rep <- read_csv(here::here("assets/data/pika_repeated.csv"),
                show_col_types = FALSE)
wide <- rep |>
  filter(treatment == "control") |>
  select(id, timepoint, body_mass_g) |>
  pivot_wider(names_from = timepoint, values_from = body_mass_g)
paired_t <- t.test(wide$T28, wide$T0, paired = TRUE)
tidy(paired_t) |> select(estimate, conf.low, conf.high, p.value)
wilcox.test(wide$T28, wide$T0, paired = TRUE)$p.value
