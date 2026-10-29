library(readr); library(dplyr); library(broom)
pika <- read_csv(here::here("assets/data/pika_physiology.csv"),
                 show_col_types = FALSE)
suppressMessages(tidy(var.test(body_mass_g ~ sex, data = pika))) |>
  select(estimate, p.value)
c(student = round(tidy(t.test(body_mass_g ~ sex, data = pika,
                              var.equal = TRUE))$p.value, 4),
  welch = round(tidy(t.test(body_mass_g ~ sex, data = pika,
                            var.equal = FALSE))$p.value, 4))
