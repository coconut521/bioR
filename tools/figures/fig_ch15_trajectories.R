# ============================================================
# fig_ch15_trajectories.R — individual body-mass trajectories across
# three visits, coloured by treatment, with treatment means on top.
# ============================================================

build_figure <- function(data) {
  d <- data[["pika_repeated.csv"]]
  d$timepoint <- factor(d$timepoint, levels = c("T0", "T14", "T28"))
  d$treatment <- factor(d$treatment, levels = c("control", "hypoxia"))
  ggplot2::ggplot(d, ggplot2::aes(timepoint, body_mass_g,
                                  group = id, colour = treatment)) +
    ggplot2::geom_line(alpha = .35, linewidth = .35) +
    ggplot2::stat_summary(ggplot2::aes(group = treatment), fun = mean,
                          geom = "line", linewidth = .9) +
    ggplot2::stat_summary(ggplot2::aes(group = treatment), fun = mean,
                          geom = "point", size = 1.9) +
    ggplot2::scale_colour_manual(values = palette_bio$treatment) +
    ggplot2::labs(x = "Visit", y = "Body mass (g)", colour = "Treatment") +
    theme_bio(8)
}
