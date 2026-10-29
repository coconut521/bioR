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
