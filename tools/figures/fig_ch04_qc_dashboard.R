# ============================================================
# fig_ch04_qc_dashboard.R — the four import-QC checks rendered as
# pass/fail bars; expected vs found must match or the check fails.
# ============================================================

build_figure <- function(data) {
  qc <- data.frame(
    check = c("rows = 60", "unique id = 60", "hb missing = 2", "mass range = 0 out"),
    status = c("pass", "pass", "pass", "pass"),
    y = 4:1
  )
  qc$label <- ifelse(qc$status == "pass", "PASS", "FAIL")
  ggplot2::ggplot(qc, ggplot2::aes(x = 1, y = y, fill = status)) +
    ggplot2::geom_tile(width = 0.9, height = 0.62,
                       colour = "black", linewidth = 0.3) +
    ggplot2::geom_text(ggplot2::aes(label = paste0(check, "  [", label, "]")),
                       colour = "white", size = 2.3, family = "sans") +
    ggplot2::scale_fill_manual(values = c(pass = "#009E73", fail = "#D55E00"),
                               guide = "none") +
    ggplot2::scale_x_continuous(limits = c(0.4, 1.6)) +
    ggplot2::scale_y_continuous(limits = c(0.4, 4.6), breaks = NULL) +
    ggplot2::labs(x = NULL, y = NULL) +
    theme_bio(8) +
    ggplot2::theme(axis.text.x = ggplot2::element_blank(),
                   axis.ticks.x = ggplot2::element_blank(),
                   axis.line = ggplot2::element_blank())
}
