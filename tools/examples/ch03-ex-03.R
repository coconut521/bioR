library(readr); library(dplyr)
pika <- read_csv(here::here("assets/data/pika_physiology.csv"),
                 show_col_types = FALSE)
dup_id <- pika$id[duplicated(pika$id)]
length(dup_id)
pika |> distinct(id) |> nrow()
