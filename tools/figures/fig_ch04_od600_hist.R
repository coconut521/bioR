# ============================================================
# fig_ch04_od600_hist.R — the 96 well OD600 readings after a correct
# skip = 3 import; the histogram shows why a range check matters.
# ============================================================

build_figure <- function(data) {
  plate <- data[["plate_reader_raw.csv"]]  # loaded with skip = 3 upstream
  ggplot2::ggplot(plate, ggplot2::aes(od600)) +
    ggplot2::geom_histogram(binwidth = 0.1, boundary = 0,
                            fill = "#0072B2", colour = "white",
                            linewidth = 0.2) +
    ggplot2::scale_y_continuous(expand = expansion(mult = c(0, 0.08))) +
    ggplot2::labs(x = "OD600", y = "Wells") +
    theme_bio(8)
}
