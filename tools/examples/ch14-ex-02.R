data_files <- list.files(here::here("assets/data"))
figures <- list.files(here::here("assets/figures/chapters"), pattern = "\\.svg$")
c(data_files = length(data_files), chapter_figures = length(figures))
