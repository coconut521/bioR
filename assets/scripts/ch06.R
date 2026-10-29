# ============================================================
# bioR · 数据整形：用 dplyr 把实验表变成答案
# All example code for ch06, auto-assembled from tools/examples/.
# Regenerate: node tools/build-chapter-scripts.mjs
# Data: copy assets/data/ into your project before running.
# ============================================================

# ---- ch06-ex-01.R ----
library(readr); library(dplyr)
pika <- read_csv(here::here("assets/data/pika_physiology.csv"),
                 show_col_types = FALSE)
pika |>
  filter(!is.na(hemoglobin_g_l), body_mass_g >= 110, body_mass_g <= 240) |>
  nrow()
pika |>
  filter(is.na(hemoglobin_g_l) | body_mass_g < 110 | body_mass_g > 240) |>
  select(id, body_mass_g, hemoglobin_g_l)

# ---- ch06-ex-02.R ----
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

# ---- ch06-ex-03.R ----
library(readr); library(dplyr)
pika <- read_csv(here::here("assets/data/pika_physiology.csv"),
                 show_col_types = FALSE)
pika |>
  group_by(altitude_group) |>
  summarise(
    n = n(),
    n_valid = sum(!is.na(hemoglobin_g_l)),
    hb_mean = round(mean(hemoglobin_g_l, na.rm = TRUE), 1),
    hb_sd = round(sd(hemoglobin_g_l, na.rm = TRUE), 1),
    .groups = "drop"
  )

# ---- ch06-ex-04.R ----
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

# ---- ch06-ex-05.R ----
library(readr); library(dplyr)
pika <- read_csv(here::here("assets/data/pika_physiology.csv"),
                 show_col_types = FALSE)
dir.create(here::here("data"), showWarnings = FALSE)  # 交付物目录（第 1 章的项目结构）
excluded <- pika |>
  filter(is.na(hemoglobin_g_l) | body_mass_g < 110 | body_mass_g > 240) |>
  transmute(id, rule = case_when(
    is.na(hemoglobin_g_l) ~ "hemoglobin missing",
    TRUE ~ "mass out of range"))
write_csv(excluded, here::here("data/exclusions.csv"))
analysis <- pika |>
  filter(!is.na(hemoglobin_g_l), body_mass_g >= 110, body_mass_g <= 240)
table1 <- analysis |>
  group_by(altitude_group, sex) |>
  summarise(
    n = n(),
    mass_mean_sd = sprintf("%.1f ± %.1f", mean(body_mass_g), sd(body_mass_g)),
    mass_median_iqr = sprintf("%.1f (%.1f–%.1f)",
      median(body_mass_g), quantile(body_mass_g, .25), quantile(body_mass_g, .75)),
    hb_mean_sd = sprintf("%.1f ± %.1f",
      mean(hemoglobin_g_l), sd(hemoglobin_g_l)),
    .groups = "drop"
  )
write_csv(table1, here::here("data/table1_group.csv"))
table1
# base R 对照：aggregate() 一次算两列
aggregate(cbind(body_mass_g, hemoglobin_g_l) ~ altitude_group + sex,
          data = analysis, function(x) round(c(mean = mean(x), sd = sd(x)), 1))
