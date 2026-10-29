# ============================================================
# fig_ch08_hb_altitude.R — haemoglobin vs sampling altitude, with
# sex distinguished by both colour and shape (colour-blind safe).
# ============================================================

build_figure <- function(data) {
  p <- data[["pika_physiology.csv"]]
  p <- p[!is.na(p$hemoglobin_g_l), ]
  ggplot2::ggplot(p, ggplot2::aes(altitude_m, hemoglobin_g_l, colour = sex)) +
    ggplot2::geom_point(ggplot2::aes(shape = sex), size = 1.4, alpha = .8) +
    ggplot2::geom_smooth(data = p, inherit.aes = FALSE,
                         mapping = ggplot2::aes(x = altitude_m,
                                                y = hemoglobin_g_l, group = 1),
                         method = "lm", formula = y ~ x, se = FALSE,
                         linewidth = .45, colour = "#0072B2") +
    ggplot2::scale_colour_manual(values = palette_bio$sex) +
    ggplot2::scale_shape_manual(values = c(16, 17)) +
    ggplot2::scale_x_continuous(breaks = c(3200, 4100, 5000)) +
    ggplot2::labs(x = "Altitude (m)", y = "Haemoglobin (g/L)",
                  colour = "Sex", shape = "Sex") +
    theme_bio(8)
}
