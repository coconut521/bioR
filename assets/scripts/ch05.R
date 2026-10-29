# ============================================================
# bioR · 函数、控制流与模拟：把重复分析变成工具
# All example code for ch05, auto-assembled from tools/examples/.
# Regenerate: node tools/build-chapter-scripts.mjs
# Data: copy assets/data/ into your project before running.
# ============================================================

# ---- ch05-ex-01.R ----
qc_summary <- function(df) {
  stopifnot(is.data.frame(df), "hemoglobin_g_l" %in% names(df))
  tibble::tibble(
    n_total = nrow(df),
    n_missing = sum(is.na(df$hemoglobin_g_l)),
    mean_hb = round(mean(df$hemoglobin_g_l, na.rm = TRUE), 1)
  )
}
library(readr)
pika <- read_csv(here::here("assets/data/pika_physiology.csv"),
                 show_col_types = FALSE)
qc_summary(pika)

# ---- ch05-ex-02.R ----
library(readr); library(purrr); library(dplyr)
make_batch_file <- function(batch, n, seed) {
  set.seed(seed)  # 每个文件一次种子：种子跟着数据走，不放循环外层
  f <- tempfile(fileext = ".csv")
  write_csv(data.frame(id = sprintf("%s%02d", batch, 1:n),
                       hemoglobin_g_l = round(rnorm(n, 155, 12), 1)), f)
  f
}
files <- c(make_batch_file("B1", 5, 11), make_batch_file("B2", 5, 22),
           make_batch_file("B3", 5, 33))
qc_batch <- function(batch, path) {
  d <- read_csv(path, show_col_types = FALSE)
  tibble(batch = batch, n = nrow(d),
         mean_hb = round(mean(d$hemoglobin_g_l), 1))
}
map2_dfr(c("B1", "B2", "B3"), files, qc_batch)

# ---- ch05-ex-03.R ----
set.seed(20261027)
n_draw <- 10
sim <- replicate(1000, {
  s <- rnorm(n_draw, 155, 12)
  c(mean = mean(s), sd = sd(s))
})
sim_m <- t(sim)
means <- sim_m[, "mean"]
c(mean_of_means = round(mean(means), 1),
  se_of_means   = round(sd(means), 1))
round(12 / sqrt(n_draw), 2)

# ---- ch05-ex-04.R ----
n <- 5
res <- numeric(0)
for (i in 1:n) res <- c(res, sqrt(i))  # 每轮都新建一个更长的向量
res
identical(res, sqrt(1:n))

fast <- numeric(n)
for (i in 1:n) fast[i] <- sqrt(i)      # 先分配、再填空位
identical(res, fast)

T <- 0                                  # T 不是保留字，会被覆盖
if (T) "run" else "skip"
rm(T)
TRUE == 1

# ---- ch05-ex-05.R ----
library(readr); library(purrr); library(dplyr)
make_batch_file <- function(batch, n, seed) {
  set.seed(seed)
  f <- tempfile(fileext = ".csv")
  write_csv(data.frame(id = sprintf("%s%02d", batch, 1:n),
                       hemoglobin_g_l = round(rnorm(n, 155, 12), 1)), f)
  f
}
files <- c(make_batch_file("B1", 5, 11), make_batch_file("B2", 5, 22),
           make_batch_file("B3", 5, 33))
# 同事把第三个文件改成了体重表：列名对不上了
write_csv(data.frame(id = "B301", weight_g = 44), files[3])
qc_batch <- function(batch, path) {
  tryCatch({
    d <- read_csv(path, show_col_types = FALSE)
    if (!"hemoglobin_g_l" %in% names(d)) stop("missing hemoglobin_g_l column")
    tibble(batch = batch, n = nrow(d),
           mean_hb = round(mean(d$hemoglobin_g_l), 1), note = "ok")
  }, error = function(e) {
    tibble(batch = batch, n = NA, mean_hb = NA, note = conditionMessage(e))
  })
}
map2_dfr(c("B1", "B2", "B3"), files, qc_batch)
