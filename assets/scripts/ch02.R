# ============================================================
# bioR · 向量与数据类型：把测量值放进 R
# All example code for ch02, auto-assembled from tools/examples/.
# Regenerate: node tools/build-chapter-scripts.mjs
# Data: copy assets/data/ into your project before running.
# ============================================================

# ---- ch02-ex-01.R ----
hb <- c(155.6, 157.8, 142.6, NA, 140.5, 145.9,
        129.1, 153.9, NA, 150.0, 162.1, 148.7)
length(hb)
sum(is.na(hb))

# ---- ch02-ex-02.R ----
hb <- c(155.6, 157.8, 142.6, NA, 140.5, 145.9,
        129.1, 153.9, NA, 150.0, 162.1, 148.7)
mean(hb)
mean(hb, na.rm = TRUE)

# ---- ch02-ex-03.R ----
hb <- c(155.6, 157.8, 142.6, NA, 140.5, 145.9,
        129.1, 153.9, NA, 150.0, 162.1, 148.7)
which(is.na(hb))
hb[!is.na(hb)]

# ---- ch02-ex-04.R ----
as.numeric(c("155.6", "142.6", "低"))

# ---- ch02-ex-05.R ----
sex <- c("F", "F", "M", "F", "M", "M", "F", "M", "F", "M", "F", "M")
sex_f <- factor(sex, levels = c("F", "M"))
table(sex_f)

# ---- ch02-ex-06.R ----
hb <- c(155.6, 157.8, 142.6, NA, 140.5, 145.9,
        129.1, 153.9, NA, 150.0, 162.1, 148.7)
hb[c(1, 3, 11)]
hb[hb > 150 & !is.na(hb)]
