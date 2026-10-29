library(readr); library(dplyr)
pika <- read_csv(here::here("assets/data/pika_physiology.csv"),
                 show_col_types = FALSE)
pika <- pika |>
  mutate(mass_class = case_when(
    body_mass_g < 150 ~ "light",
    body_mass_g < 200 ~ "normal",
    body_mass_g <= 240 ~ "heavy"
  ))
count(pika, mass_class)
# 顺序错了：宽条件放前面，heavy 把 normal 也吞掉
pika |>
  mutate(mass_bad = case_when(
    body_mass_g <= 240 ~ "heavy",
    body_mass_g < 200 ~ "normal"
  )) |>
  count(mass_bad)
