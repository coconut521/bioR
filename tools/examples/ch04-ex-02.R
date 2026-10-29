library(readr); library(dplyr)
plate <- read_csv(here::here("assets/data/plate_reader_raw.csv"),
                  skip = 3, show_col_types = FALSE) |>
  rename(well_id = well, od600 = od600, temp_c = temperature_c)
ncol(plate)
nrow(plate)
names(plate)
