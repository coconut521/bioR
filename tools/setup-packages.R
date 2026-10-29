# Build-time dependency installer (run once). Installs into project-local
# library tools/rlib so the user's global R library stays untouched.
lib <- file.path(dirname(dirname(this_script_dir <- getwd())), "tools", "rlib")
# resolve bioR root from script location
args <- commandArgs(trailingOnly = FALSE)
fa <- grep("^--file=", args, value = TRUE)
script <- normalizePath(sub("^--file=", "", fa[1]), winslash = "/")
root <- dirname(dirname(script))
lib <- file.path(root, "tools", "rlib")
dir.create(lib, showWarnings = FALSE, recursive = TRUE)
.libPaths(c(lib, .libPaths()))
options(repos = c(CRAN = "https://cloud.r-project.org"), Ncpus = max(1, parallel::detectCores() - 1))
cran <- c(
  "rlang","cli","glue","withr","lifecycle","vctrs","tibble","magrittr",
  "readr","readxl","writexl","here",
  "dplyr","tidyr","purrr","stringr","forcats","stringi","snakecase","lubridate",
  "ggplot2","svglite","scales","patchwork","RColorBrewer","viridisLite","gtable",
  "janitor","skimr","broom","backports","farver","labeling","munsell",
  "emmeans","car","carData","effectsize","rstatix","FSA","pwr","performance",
  "insight","datawizard","bayestestR","parameters","estmeans","ggsignif",
  "corrplot","estimability","mvtnorm","numDeriv","pbkrtest","reformulas","xfun",
  "lme4","lmerTest","DHARMa","pheatmap","vegan","hexbin","BiocManager"
)
todo <- cran[!cran %in% rownames(installed.packages(lib.loc = lib))]
cat("Missing packages:", length(todo), "\n")
if (length(todo)) install.packages(todo, lib = lib, type = "binary", quiet = TRUE)

bioc <- c("edgeR", "limma", "DESeq2", "apeglm", "clusterProfiler")
todo_bioc <- bioc[!bioc %in% rownames(installed.packages(lib.loc = lib))]
if (length(todo_bioc)) {
  cat("Missing Bioconductor packages:", length(todo_bioc), "\n")
  BiocManager::install(todo_bioc, lib = lib, update = FALSE, ask = FALSE)
}
cat("DONE. Installed count:", length(list.files(lib)), "\n")
