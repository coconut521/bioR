# ============================================================
# fig_ch02_mean_na.R — the same 12 values summarised three ways:
# mean with NA (undefined), mean with na.rm = TRUE, and "NA treated
# as zero" (a common beginner mistake) — showing how the summary
# changes with the missing-data decision.
# ============================================================

build_figure <- function(data) {
  hb <- c(155.6, 157.8, 142.6, NA, 140.5, 145.9,
          129.1, 153.9, NA, 150.0, 162.1, 148.7)
  d <- data.frame(
    label = c("mean(hb)\nNA propagates", "mean(hb,\nna.rm = TRUE)", "NA treated\nas zero"),
    value = c(NA_real_, mean(hb, na.rm = TRUE), mean(replace(hb, is.na(hb), 0))),
    ok = c("bad", "good", "bad")
  )
  ggplot2::ggplot(d, ggplot2::aes(label, value, fill = ok)) +
    ggplot2::geom_col(width = 0.55, colour = "black", linewidth = 0.3,
                      na.rm = TRUE) +
    ggplot2::geom_text(ggplot2::aes(label = format(value, digits = 5)),
                       vjust = -0.5, size = 2.3,
                       colour = "black", na.rm = TRUE) +
    ggplot2::scale_fill_manual(values = c(good = "#009E73", bad = "#D55E00"),
                               guide = "none") +
    ggplot2::scale_y_continuous(limits = c(0, 165),
                                expand = expansion(mult = c(0, 0.08))) +
    ggplot2::labs(x = NULL, y = "Mean hemoglobin (g/L)") +
    theme_bio(8)
}
