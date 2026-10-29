library(readr); library(dplyr); library(broom); library(ggplot2)
pika <- read_csv(here::here("assets/data/pika_physiology.csv"),
                 show_col_types = FALSE)
surv <- read_csv(here::here("assets/data/pika_survival.csv"),
                 show_col_types = FALSE)
m1 <- lm(hemoglobin_g_l ~ altitude_m + sex, data = pika)
m2 <- lm(log(body_mass_g) ~ log(body_length_mm), data = pika)
g1 <- glm(status ~ treatment, data = surv, family = binomial)
dir.create(here::here("data"), showWarnings = FALSE)
res <- bind_rows(
  tidy(m1, conf.int = TRUE) |>
    transmute(model = "lm: hb ~ altitude + sex", term,
              estimate = round(estimate, 4),
              conf_low = round(conf.low, 4), conf_high = round(conf.high, 4)),
  tidy(m2, conf.int = TRUE) |>
    transmute(model = "lm: log mass ~ log length", term,
              estimate = round(estimate, 3),
              conf_low = round(conf.low, 3), conf_high = round(conf.high, 3)),
  tidy(g1, exponentiate = TRUE, conf.int = TRUE) |>
    transmute(model = "glm: survival ~ treatment (OR)", term,
              estimate = round(estimate, 2),
              conf_low = round(conf.low, 2), conf_high = round(conf.high, 2)))
write_csv(res, here::here("data/stats_regression.csv"))
hb <- pika[!is.na(pika$hemoglobin_g_l), ]
p <- ggplot(hb, aes(altitude_m, hemoglobin_g_l)) +
  geom_point(size = 1.2, alpha = .6, colour = "#0072B2") +
  geom_smooth(method = "lm", formula = y ~ x, se = TRUE,
              colour = "#0072B2", fill = "#BBD7EC") +
  labs(x = "Altitude (m)", y = "Haemoglobin (g/L)") +
  theme_classic(base_size = 9)
dir.create(here::here("figures"), showWarnings = FALSE)
ggsave(here::here("figures/fig_regression.svg"), p,
       width = 89, height = 55, units = "mm")
head(res, 5)
file.exists(here::here(c("data/stats_regression.csv", "figures/fig_regression.svg")))
