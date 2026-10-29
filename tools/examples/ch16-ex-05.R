suppressPackageStartupMessages({
  library(readr); library(dplyr); library(survival); library(broom)
  library(ggplot2); library(patchwork)
})
d <- read_csv(here::here("assets/data/pika_survival.csv"), show_col_types = FALSE) |>
  mutate(status = as.integer(status), treatment = factor(treatment))
fit <- survfit(Surv(time_days, status) ~ treatment, data = d)
cox <- coxph(Surv(time_days, status) ~ treatment, data = d)
s <- summary(cox)
dir.create(here::here("data"), showWarnings = FALSE)
dir.create(here::here("figures"), showWarnings = FALSE)
res <- data.frame(
  term = rownames(s$conf.int),
  HR = round(s$conf.int[, "exp(coef)"], 3),
  lower = round(s$conf.int[, "lower .95"], 3),
  upper = round(s$conf.int[, "upper .95"], 3),
  p = signif(s$coefficients[, "Pr(>|z|)"], 3)
)
write_csv(res, here::here("data/stats_cox.csv"))
km <- broom::tidy(fit)
km$strata <- factor(km$strata, levels = c("treatment=control", "treatment=hypoxia"))
p_km <- ggplot(km, aes(time, estimate, colour = strata)) +
  geom_step(linewidth = .55) +
  geom_point(data = km[km$n.censor > 0, ], shape = 3, size = 1.6) +
  scale_colour_manual(values = c("treatment=control" = "#56B4E9", "treatment=hypoxia" = "#D55E00"),
                      breaks = c("treatment=control", "treatment=hypoxia"),
                      labels = c("control", "hypoxia")) +
  coord_cartesian(ylim = c(0, 1)) +
  labs(x = "Days", y = "Survival probability", colour = "Treatment") +
  theme_classic(base_size = 8)
tt <- c(0, 20, 40, 60)
sm <- summary(fit, times = tt)
risk <- data.frame(time = sm$time, strata = sm$strata, n = sm$n.risk)
risk$strata <- factor(risk$strata, levels = c("treatment=control", "treatment=hypoxia"))
p_risk <- ggplot(risk, aes(time, strata, label = n)) +
  geom_text(size = 2.6, colour = "#333333") +
  scale_y_discrete(limits = c("treatment=hypoxia", "treatment=control"),
                   labels = c("hypoxia", "control")) +
  labs(x = NULL, y = NULL, title = "Number at risk") +
  theme_classic(base_size = 7) +
  theme(panel.grid = element_blank(), axis.text.x = element_blank(),
        axis.ticks.x = element_blank(), plot.title = element_text(size = 7))
p <- p_km / p_risk + plot_layout(heights = c(3, 1))
ggsave(here::here("figures/fig_survival.svg"), p, width = 183, height = 90, units = "mm")
data.frame(
  file = c("data/stats_cox.csv", "figures/fig_survival.svg"),
  exists = file.exists(here::here(c("data/stats_cox.csv", "figures/fig_survival.svg"))),
  logrank_p = c(signif(pchisq(survdiff(Surv(time_days, status) ~ treatment, data = d)$chisq,
                              df = 1, lower.tail = FALSE), 2), NA)
)
