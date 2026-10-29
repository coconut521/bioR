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
