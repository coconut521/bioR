# ============================================================
# fig_ch16_km.R — Kaplan–Meier curves by treatment with censor
# ticks and a number-at-risk table.
# ============================================================

build_figure <- function(data) {
  d <- data[["pika_survival.csv"]]
  d$status <- as.integer(d$status)
  d$treatment <- factor(d$treatment)
  fit <- survival::survfit(survival::Surv(time_days, status) ~ treatment, data = d)
  km <- broom::tidy(fit)
  km$strata <- factor(km$strata,
                      levels = c("treatment=control", "treatment=hypoxia"))
  p_km <- ggplot2::ggplot(km, ggplot2::aes(time, estimate, colour = strata)) +
    ggplot2::geom_step(linewidth = .55) +
    ggplot2::geom_point(data = km[km$n.censor > 0, ], shape = 3, size = 1.6) +
    ggplot2::scale_colour_manual(values = unname(palette_bio$treatment),
                                 breaks = c("treatment=control", "treatment=hypoxia"),
                                 labels = c("control", "hypoxia")) +
    ggplot2::coord_cartesian(ylim = c(0, 1)) +
    ggplot2::labs(x = "Days", y = "Survival probability", colour = "Treatment") +
    theme_bio(8)
  tt <- c(0, 20, 40, 60)
  sm <- summary(fit, times = tt)
  risk <- data.frame(time = sm$time, strata = sm$strata, n = sm$n.risk)
  risk$strata <- factor(risk$strata,
                        levels = c("treatment=control", "treatment=hypoxia"))
  p_risk <- ggplot2::ggplot(risk, ggplot2::aes(time, strata, label = n)) +
    ggplot2::geom_text(size = 2.6, colour = "#333333") +
    ggplot2::scale_y_discrete(limits = c("treatment=hypoxia", "treatment=control"),
                              labels = c("hypoxia", "control")) +
    ggplot2::labs(x = NULL, y = NULL, title = "Number at risk") +
    theme_bio(7) +
    ggplot2::theme(panel.grid = ggplot2::element_blank(),
                   axis.text.x = ggplot2::element_blank(),
                   axis.ticks.x = ggplot2::element_blank(),
                   plot.title = ggplot2::element_text(size = 7))
  p_km / p_risk + patchwork::plot_layout(heights = c(3, 1))
}
