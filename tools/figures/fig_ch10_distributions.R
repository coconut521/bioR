# ============================================================
# fig_ch10_distributions.R — descriptive panel: (A) haemoglobin
# histogram with density curve; (B) body-mass box plot with the
# three IQR-rule outliers highlighted.
# ============================================================

build_figure <- function(data) {
  p <- data[["pika_physiology.csv"]]
  hb <- p$hemoglobin_g_l[!is.na(p$hemoglobin_g_l)]
  q <- quantile(p$body_mass_g, c(.25, .75))
  iqr <- IQR(p$body_mass_g)
  lo <- q[1] - 1.5 * iqr
  hi <- q[2] + 1.5 * iqr
  p$outlier <- ifelse(p$body_mass_g < lo | p$body_mass_g > hi,
                      "IQR outlier", "within 1.5 x IQR")

  panel_a <- ggplot2::ggplot(data.frame(hb = hb), ggplot2::aes(hb)) +
    ggplot2::geom_histogram(ggplot2::aes(y = after_stat(density)),
                            binwidth = 5, boundary = 0,
                            fill = "#56B4E9", colour = "white",
                            linewidth = .2) +
    ggplot2::geom_density(linewidth = .5, colour = "#0072B2") +
    ggplot2::labs(x = "Haemoglobin (g/L)", y = "Density") +
    theme_bio(8)

  panel_b <- ggplot2::ggplot(p, ggplot2::aes("Body mass", body_mass_g)) +
    ggplot2::geom_boxplot(width = .35, outlier.shape = NA, linewidth = .3,
                          colour = "black") +
    ggplot2::geom_jitter(ggplot2::aes(colour = outlier), width = .08,
                         size = 1.0, alpha = .75) +
    ggplot2::scale_colour_manual(values = c("IQR outlier" = "#D55E00",
                                            "within 1.5 x IQR" = "#4D4D4D")) +
    ggplot2::labs(x = NULL, y = "Body mass (g)", colour = NULL) +
    theme_bio(8)

  patchwork::wrap_plots(panel_a, panel_b, nrow = 1) +
    patchwork::plot_annotation(tag_levels = "A") &
    ggplot2::theme(plot.tag = ggplot2::element_text(size = 10, face = "bold"))
}
