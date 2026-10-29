library(readr); library(dplyr)
pika <- read_csv(here::here("assets/data/pika_physiology.csv"),
                 show_col_types = FALSE)
# 未排除缺失：n() 把 NA 也数进去
pika |>
  group_by(altitude_group) |>
  summarise(n_all = n(), n_valid = sum(!is.na(hemoglobin_g_l)))
# 排除缺失之后两者相等
pika |>
  filter(!is.na(hemoglobin_g_l)) |>
  group_by(altitude_group) |>
  summarise(n_all = n(), n_valid = sum(!is.na(hemoglobin_g_l)))
