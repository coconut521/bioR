library(readr)
legend <- c(
  "Figure 1. Body mass and haemoglobin across altitude in plateau pikas.",
  "(A) Body mass by altitude group (low, mid, high; n = 20 per group). Boxes show the",
  "interquartile range (IQR) with the median as a horizontal line; whiskers extend to",
  "1.5 x IQR; individual animals are shown as points.",
  "(B) Haemoglobin concentration versus sampling altitude (n = 58; two haemolysis",
  "samples excluded). Sex is encoded by both colour and shape. Lines are ordinary",
  "least-squares fits shown for trend only; sampling altitudes were 3200, 4100 and",
  "5000 m.",
  "Data are simulated teaching data (fixed seed 20261027) and do not represent real",
  "animals. Colour palette: Okabe-Ito (colour-blind safe)."
)
dir.create(here::here("figures"), showWarnings = FALSE)
writeLines(legend, here::here("figures/figure1_legend.md"))
length(readLines(here::here("figures/figure1_legend.md")))
