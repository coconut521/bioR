library(readr); library(ggplot2)
pika <- read_csv(here::here("assets/data/pika_physiology.csv"),
                 show_col_types = FALSE)
p <- ggplot(pika[!is.na(pika$hemoglobin_g_l), ],
            aes(altitude_m, hemoglobin_g_l, colour = sex, shape = sex)) +
  geom_point(size = 1.4, alpha = .8)
length(unique(p$data$altitude_m))
nrow(p$data)
class(p$layers[[1]]$geom)
