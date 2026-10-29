# ============================================================
# bioR · 回归与线性模型：从趋势到预测
# All example code for ch13, auto-assembled from tools/examples/.
# Regenerate: node tools/build-chapter-scripts.mjs
# Data: copy assets/data/ into your project before running.
# ============================================================

# ---- ch13-ex-01.R ----
library(readr); library(dplyr); library(broom)
pika <- read_csv(here::here("assets/data/pika_physiology.csv"),
                 show_col_types = FALSE)
m1 <- lm(hemoglobin_g_l ~ altitude_m + sex, data = pika)
tidy(m1, conf.int = TRUE) |>
  select(term, estimate, conf.low, conf.high, p.value)

# ---- ch13-ex-02.R ----
library(readr); library(dplyr); library(broom)
pika <- read_csv(here::here("assets/data/pika_physiology.csv"),
                 show_col_types = FALSE)
m1 <- lm(hemoglobin_g_l ~ altitude_m + sex, data = pika)
glance(m1) |> select(r.squared, adj.r.squared, sigma, AIC)

# ---- ch13-ex-03.R ----
library(readr); library(dplyr); library(broom)
pika <- read_csv(here::here("assets/data/pika_physiology.csv"),
                 show_col_types = FALSE)
m1 <- lm(hemoglobin_g_l ~ altitude_m + sex, data = pika)
aug <- augment(m1)
c(shapiro_resid = round(shapiro.test(aug$.resid)$p.value, 3),
  max_hat = round(max(aug$.hat), 3),
  big_resid = sum(abs(aug$.std.resid) > 2))

# ---- ch13-ex-04.R ----
library(readr); library(dplyr); library(broom)
pika <- read_csv(here::here("assets/data/pika_physiology.csv"),
                 show_col_types = FALSE)
m2 <- lm(log(body_mass_g) ~ log(body_length_mm), data = pika)
tidy(m2, conf.int = TRUE) |> select(term, estimate, conf.low, conf.high)

# ---- ch13-ex-05.R ----
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
