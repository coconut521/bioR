library(readr); library(dplyr); library(ggplot2)
suppressPackageStartupMessages({library(emmeans); library(multcomp)})
pika <- read_csv(here::here("assets/data/pika_physiology.csv"),
                 show_col_types = FALSE)
pika$altitude_group <- factor(pika$altitude_group,
                              levels = c("low", "mid", "high"))
m1 <- aov(body_mass_g ~ altitude_group, data = pika)
m2 <- aov(body_mass_g ~ altitude_group * sex, data = pika)
tab <- as.data.frame(summary(m2)[[1]])
stats_anova <- tibble(
  term = rownames(tab),
  df = tab$Df,
  sum_sq = round(tab$`Sum Sq`, 1),
  mean_sq = round(tab$`Mean Sq`, 1),
  f_value = round(tab$`F value`, 2),
  p_value = round(tab$`Pr(>F)`, 4))
dir.create(here::here("data"), showWarnings = FALSE)
write_csv(stats_anova, here::here("data/stats_anova.csv"))
cl <- suppressMessages(cld(emmeans(m1, ~ altitude_group),
                           Letters = letters, adjust = "tukey"))
letters_df <- as.data.frame(cl)[, c("altitude_group", "emmean", "SE", ".group")]
letters_df$.group <- trimws(letters_df$.group)
letters_df
p <- ggplot(letters_df, aes(altitude_group, emmean)) +
  geom_pointrange(aes(ymin = emmean - SE, ymax = emmean + SE)) +
  geom_text(aes(label = .group), vjust = -1.6, size = 3) +
  labs(x = "Altitude group", y = "Body mass (g), mean ± SE") +
  theme_classic(base_size = 9)
dir.create(here::here("figures"), showWarnings = FALSE)
ggsave(here::here("figures/fig_anova_letters.svg"), p,
       width = 89, height = 55, units = "mm")
file.exists(here::here(c("data/stats_anova.csv", "figures/fig_anova_letters.svg")))
