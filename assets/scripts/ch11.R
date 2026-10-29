# ============================================================
# bioR · 两组比较：t 检验与 Wilcoxon
# All example code for ch11, auto-assembled from tools/examples/.
# Regenerate: node tools/build-chapter-scripts.mjs
# Data: copy assets/data/ into your project before running.
# ============================================================

# ---- ch11-ex-01.R ----
library(readr); library(dplyr); library(broom)
pika <- read_csv(here::here("assets/data/pika_physiology.csv"),
                 show_col_types = FALSE)
res <- t.test(body_mass_g ~ sex, data = pika)
tidy(res) |> select(estimate1, estimate2, estimate, conf.low, conf.high, p.value)

# ---- ch11-ex-02.R ----
library(readr); library(dplyr); library(broom)
pika <- read_csv(here::here("assets/data/pika_physiology.csv"),
                 show_col_types = FALSE)
suppressMessages(tidy(var.test(body_mass_g ~ sex, data = pika))) |>
  select(estimate, p.value)
c(student = round(tidy(t.test(body_mass_g ~ sex, data = pika,
                              var.equal = TRUE))$p.value, 4),
  welch = round(tidy(t.test(body_mass_g ~ sex, data = pika,
                            var.equal = FALSE))$p.value, 4))

# ---- ch11-ex-03.R ----
library(readr); library(effectsize)
pika <- read_csv(here::here("assets/data/pika_physiology.csv"),
                 show_col_types = FALSE)
d <- cohens_d(body_mass_g ~ sex, data = pika)
round(d$Cohens_d, 2)
round(d$CI_low, 2)
round(d$CI_high, 2)

# ---- ch11-ex-04.R ----
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

# ---- ch11-ex-05.R ----
library(readr); library(dplyr); library(tidyr); library(broom); library(effectsize)
pika <- read_csv(here::here("assets/data/pika_physiology.csv"),
                 show_col_types = FALSE)
rep <- read_csv(here::here("assets/data/pika_repeated.csv"),
                show_col_types = FALSE)
dir.create(here::here("data"), showWarnings = FALSE)
ind <- tidy(t.test(body_mass_g ~ sex, data = pika, var.equal = FALSE))
d <- cohens_d(body_mass_g ~ sex, data = pika)
wide <- rep |>
  filter(treatment == "control") |>
  select(id, timepoint, body_mass_g) |>
  pivot_wider(names_from = timepoint, values_from = body_mass_g)
pt <- tidy(t.test(wide$T28, wide$T0, paired = TRUE))
res <- tibble(
  comparison = c("mass ~ sex (Welch)", "mass ~ sex (Cohen's d)",
                 "control T0 vs T28 (paired)"),
  estimate = c(round(ind$estimate, 1), round(d$Cohens_d, 2), round(pt$estimate, 1)),
  conf_low = c(round(ind$conf.low, 1), round(d$CI_low, 2), round(pt$conf.low, 1)),
  conf_high = c(round(ind$conf.high, 1), round(d$CI_high, 2), round(pt$conf.high, 1)),
  p_value = c(signif(ind$p.value, 3), NA, signif(pt$p.value, 3)))
write_csv(res, here::here("data/stats_two_group.csv"))
methods <- c(
  "# Two-group comparisons",
  "",
  "- Design: independent groups (sex) and paired visits (control T0 vs T28); two-sided tests, alpha = 0.05.",
  "- Independent comparison: Welch t-test (unequal variances not assumed).",
  "- Effect size: Cohen's d with 95% CI.",
  "- Paired comparison: paired t-test; Wilcoxon signed-rank as sensitivity analysis.",
  "- Software: R 4.5.2; broom/effectsize for tidying."
)
writeLines(methods, here::here("data/methods_two_group.md"))
file.exists(here::here(c("data/stats_two_group.csv",
                         "data/methods_two_group.md")))
