# ============================================================
# theme.R — theme_bio(): the single source of figure styling.
# Journal-oriented: 89/183 mm width, 7–9 pt text, thin axes.
# Docs: docs/05 §6.3.
# ============================================================

theme_bio <- function(base_size = 8) {
  theme_classic(base_size = base_size) +
    theme(
      axis.title = element_text(size = base_size, colour = "black"),
      axis.title.x = element_text(margin = margin(2, 0, 0, 0)),
      axis.title.y = element_text(margin = margin(0, 2, 0, 0), angle = 90),
      axis.text = element_text(size = base_size - 0.5, colour = "black"),
      axis.line = element_line(linewidth = 0.3, colour = "black"),
      axis.ticks = element_line(linewidth = 0.3, colour = "black"),
      axis.ticks.length = unit(1.6, "mm"),
      panel.grid = element_blank(),
      legend.title = element_text(size = base_size),
      legend.text = element_text(size = base_size - 0.5),
      legend.key.size = unit(2.4, "mm"),
      legend.margin = margin(0, 0, 0, 0),
      strip.background = element_blank(),
      strip.text = element_text(size = base_size, face = "plain"),
      plot.tag = element_text(size = base_size + 3, face = "bold"),
      plot.tag.position = "topleft",
      plot.title = element_text(size = base_size, face = "plain"),
      plot.margin = margin(3, 4, 2, 2, "mm")
    )
}
