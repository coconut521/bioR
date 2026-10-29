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
