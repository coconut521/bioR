library(readr)
plate_raw <- read_csv(here::here("assets/data/plate_reader_raw.csv"),
                      show_col_types = FALSE)
ncol(plate_raw)
nrow(plate_raw)
names(plate_raw)[1]
