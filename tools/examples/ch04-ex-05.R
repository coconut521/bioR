library(readr); library(dplyr); library(writexl)
pika <- read_csv(here::here("assets/data/pika_physiology.csv"),
                 show_col_types = FALSE)
qc <- tibble(
  check = c("rows", "unique_id", "hb_missing", "mass_out_of_range"),
  expected = c("60", "60", "2", "0"),
  found = c(as.character(nrow(pika)),
            as.character(n_distinct(pika$id)),
            as.character(sum(is.na(pika$hemoglobin_g_l))),
            as.character(sum(pika$body_mass_g < 110 |
                               pika$body_mass_g > 240, na.rm = TRUE))))
qc
