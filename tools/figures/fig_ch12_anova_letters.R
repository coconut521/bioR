# ============================================================
# fig_ch12_anova_letters.R — mean ± SE by altitude group with
# compact letters from Tukey-adjusted pairwise comparisons.
# Teaching point: omnibus p < 0.05 but no pairwise difference.
# ============================================================

build_figure <- function(data) {
  p <- data[["pika_physiology.csv"]]
  p$altitude_group <- factor(p$altitude_group, levels = c("low", "mid", "high"))
  m1 <- aov(body_mass_g ~ altitude_group, data = p)
  cl <- suppressMessages(multcomp::cld(emmeans::emmeans(m1, ~ altitude_group),
                                       Letters = letters, adjust = "tukey"))
  d <- as.data.frame(cl)[, c("altitude_group", "emmean", "SE", ".group")]
  d$.group <- trimws(d$.group)
  ggplot2::ggplot(d, ggplot2::aes(altitude_group, emmean)) +
    ggplot2::geom_pointrange(ggplot2::aes(ymin = emmean - SE,
                                          ymax = emmean + SE),
                             size = .35, fill = "#56B4E9", shape = 21,
                             colour = "black") +
    ggplot2::geom_text(ggplot2::aes(label = .group), vjust = -1.7,
                       size = 3.2, family = "sans") +
    ggplot2::scale_y_continuous(expand = expansion(mult = c(0.08, 0.16))) +
    ggplot2::labs(x = "Altitude group", y = "Body mass (g), mean ± SE") +
    theme_bio(8)
}
