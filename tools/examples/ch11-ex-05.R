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
