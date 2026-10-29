# ============================================================
# fig_ch08_mass.R — body mass distribution across altitude groups.
# Box (IQR) + jittered individuals; Okabe-Ito fills; no legend
# (groups already labelled on the x axis).
# ============================================================

build_figure <- function(data) {
  p <- data[["pika_physiology.csv"]]
  p$altitude_group <- factor(p$altitude_group, levels = c("low", "mid", "high"))
  ggplot2::ggplot(p, ggplot2::aes(altitude_group, body_mass_g, fill = altitude_group)) +
    ggplot2::geom_boxplot(width = .55, outlier.shape = NA, linewidth = .3,
                          colour = "black") +
    ggplot2::geom_jitter(width = .12, alpha = .45, size = .7, colour = "black") +
    ggplot2::scale_fill_manual(values = palette_bio$altitude, guide = "none") +
    ggplot2::scale_y_continuous(expand = expansion(mult = c(0.03, 0.06))) +
    ggplot2::labs(x = "Altitude group", y = "Body mass (g)") +
    theme_bio(8)
}
