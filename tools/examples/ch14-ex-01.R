scripts <- list.files(here::here("assets/scripts"), pattern = "\\.R$")
examples <- list.files(here::here("tools/examples"), pattern = "\\.R$")
c(chapter_scripts = length(scripts), examples = length(examples))
head(scripts, 3)
