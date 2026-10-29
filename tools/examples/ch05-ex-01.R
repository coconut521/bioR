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
