# ============================================================
# palettes.R — colour-blind-safe palettes for all bioR figures.
# Docs: docs/01 §6, docs/04 §2.7. Never rainbow(); never red-green only.
# ============================================================

okabe_ito <- c(
  "#000000", "#E69F00", "#56B4E9", "#009E73",
  "#F0E442", "#0072B2", "#D55E00", "#CC79A7"
)

palette_bio <- list(
  altitude = c(low = "#56B4E9", mid = "#E69F00", high = "#0072B2"),
  treatment = c(control = "#56B4E9", hypoxia = "#D55E00"),
  sex = c(F = "#0072B2", M = "#E69F00"),
  group = c(control = "#56B4E9", hypoxia = "#D55E00"),
  batch = c(batch1 = "#56B4E9", batch2 = "#E69F00", B1 = "#56B4E9", B2 = "#E69F00", B3 = "#009E73"),
  status = c(`0` = "#999999", `1` = "#000000")
)

# pick n colours from Okabe–Ito, skipping black for fills
okabe_n <- function(n) {
  if (n <= 1) return(okabe_ito[6])
  okabe_ito[c(6, 2, 3, 4, 7, 8, 5, 1)][seq_len(min(n, 8))]
}
