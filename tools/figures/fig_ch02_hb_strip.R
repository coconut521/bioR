# ============================================================
# fig_ch02_hb_strip.R — the 12 hand-entered hemoglobin values as a
# strip plot; the two NA positions are drawn as question marks at the
# bottom so "missing is a position, not a zero" becomes visible.
# ============================================================

build_figure <- function(data) {
  hb <- c(155.6, 157.8, 142.6, NA, 140.5, 145.9,
          129.1, 153.9, NA, 150.0, 162.1, 148.7)
  d <- data.frame(
    idx = seq_along(hb),
    hb = hb,
    y_plot = ifelse(is.na(hb), 127, hb),
    label = ifelse(is.na(hb), "?", format(hb, trim = TRUE)),
    state = ifelse(is.na(hb), "NA", "value")
  )
  ggplot2::ggplot(d, ggplot2::aes(idx, y_plot, colour = state)) +
    ggplot2::geom_hline(yintercept = mean(hb, na.rm = TRUE),
                        linetype = "dashed", linewidth = 0.3,
                        colour = "black") +
    ggplot2::geom_point(data = subset(d, state == "value"), size = 1.6) +
    ggplot2::geom_text(data = subset(d, state == "NA"),
                       ggplot2::aes(label = label), size = 2.6,
                       colour = "#D55E00", family = "sans") +
    ggplot2::annotate("text", x = 5.4, y = mean(hb, na.rm = TRUE) + 2.4,
                      label = "mean (na.rm = TRUE)", size = 2.1,
                      colour = "black") +
    ggplot2::scale_colour_manual(values = c(value = "#0072B2", "NA" = "#D55E00"),
                                 guide = "none") +
    ggplot2::scale_y_continuous(breaks = seq(130, 160, 10),
                                limits = c(125, 165)) +
    ggplot2::scale_x_continuous(breaks = 1:12,
                                expand = expansion(mult = c(0.02, 0.02))) +
    ggplot2::labs(x = "Measurement order", y = "Hemoglobin (g/L)") +
    theme_bio(8)
}
