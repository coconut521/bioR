# ============================================================
# bioR · 从零开始：R、RStudio 与可复现项目
# All example code for ch01, auto-assembled from tools/examples/.
# Regenerate: node tools/build-chapter-scripts.mjs
# Data: copy assets/data/ into your project before running.
# ============================================================

# ---- ch01-ex-01.R ----
n_mice <- 60
altitude_low_m <- 3200
n_mice * 2

# ---- ch01-ex-02.R ----
mean_mass_g <- 172.4
mean_mass_g
print(mean_mass_g)

# ---- ch01-ex-03.R ----
basename(here::here())
basename(here::here("assets", "data", "pika_physiology.csv"))

# ---- ch01-ex-04.R ----
library(readr); library(dplyr)
pika <- read_csv(here::here("assets/data/pika_physiology.csv"),
                 show_col_types = FALSE)
glimpse(pika)

# ---- ch01-ex-05.R ----
R.version.string
packageVersion("readr")

# ---- ch01-ex-06.R ----
args(mean)
