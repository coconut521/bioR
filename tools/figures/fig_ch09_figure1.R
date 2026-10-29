# ============================================================
# fig_ch09_figure1.R — a publishable Figure 1 built from the ch08
# exploration panels: (A) mass distribution, (B) haemoglobin vs
# altitude by sex. Single colour system, panel tags, 183 mm wide.
# ============================================================

build_figure <- function(data) {
  p <- data[["pika_physiology.csv"]]
  p$altitude_group <- factor(p$altitude_group, levels = c("low", "mid", "high"))
  p_hb <- p[!is.na(p$hemoglobin_g_l), ]

  panel_a <- ggplot2::ggplot(p, ggplot2::aes(altitude_group, body_mass_g,
                                             fill = altitude_group)) +
    ggplot2::geom_boxplot(width = .55, outlier.shape = NA, linewidth = .3,
                          colour = "black") +
    ggplot2::geom_jitter(width = .10, alpha = .5, size = .5, colour = "black") +
    ggplot2::scale_fill_manual(values = palette_bio$altitude, guide = "none") +
    ggplot2::scale_y_continuous(expand = expansion(mult = c(0.03, 0.06))) +
    ggplot2::labs(x = NULL, y = "Body mass (g)") +
    theme_bio(8)

  panel_b <- ggplot2::ggplot(p_hb, ggplot2::aes(altitude_m, hemoglobin_g_l,
                                                colour = sex)) +
    ggplot2::geom_point(ggplot2::aes(shape = sex), size = 1.2, alpha = .75) +
    ggplot2::geom_smooth(data = p_hb, inherit.aes = FALSE,
                         mapping = ggplot2::aes(x = altitude_m,
                                                y = hemoglobin_g_l, group = 1),
                         method = "lm", formula = y ~ x, se = FALSE,
                         linewidth = .4, colour = "#0072B2") +
    ggplot2::scale_colour_manual(values = palette_bio$sex) +
    ggplot2::scale_shape_manual(values = c(16, 17)) +
    ggplot2::scale_x_continuous(breaks = c(3200, 4100, 5000)) +
    ggplot2::labs(x = "Altitude (m)", y = "Haemoglobin (g/L)",
                  colour = "Sex", shape = "Sex") +
    theme_bio(8)

  patchwork::wrap_plots(panel_a, panel_b, nrow = 1, widths = c(1, 1.15)) +
    patchwork::plot_annotation(tag_levels = "A") &
    ggplot2::theme(plot.tag = ggplot2::element_text(size = 10, face = "bold"))
}
