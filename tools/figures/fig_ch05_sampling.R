# ============================================================
# fig_ch05_sampling.R — simulated standard error of the mean as a
# function of n, against the theoretical curve sd/sqrt(n). Shows
# WHY bigger n gives a more stable mean (and that SE != SD).
# ============================================================

build_figure <- function(data) {
  set.seed(20261027)
  ns <- c(2, 5, 10, 20, 40, 80)
  se_sim <- vapply(ns, function(n) {
    m <- replicate(1000, mean(rnorm(n, 155, 12)))
    sd(m)
  }, numeric(1))
  d <- data.frame(n = rep(ns, 2),
                  se = c(se_sim, 12 / sqrt(ns)),
                  kind = rep(c("simulated", "theoretical"), each = length(ns)))
  d$kind <- factor(d$kind, levels = c("theoretical", "simulated"))
  ggplot2::ggplot(d, ggplot2::aes(n, se, group = kind)) +
    ggplot2::geom_line(ggplot2::aes(linetype = kind),
                       colour = "#0072B2", linewidth = 0.45) +
    ggplot2::geom_point(data = d[d$kind == "simulated", ],
                        size = 1.1, colour = "#0072B2") +
    ggplot2::scale_x_continuous(breaks = ns) +
    ggplot2::scale_linetype_manual(values = c("theoretical" = 2,
                                              "simulated" = 1)) +
    ggplot2::labs(x = "n (individuals per sample)",
                  y = "SD of 1000 sample means (g/L)",
                  linetype = NULL) +
    theme_bio(8)
}
