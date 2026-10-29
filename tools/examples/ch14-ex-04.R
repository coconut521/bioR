library(jsonlite)
info <- list(
  r_version = R.version.string,
  platform = R.version$platform,
  packages = list(
    readr = as.character(packageVersion("readr")),
    dplyr = as.character(packageVersion("dplyr")),
    ggplot2 = as.character(packageVersion("ggplot2"))
  )
)
dir.create(here::here("reports"), showWarnings = FALSE)
write_json(info, here::here("reports/session_info.json"),
           pretty = TRUE, auto_unbox = TRUE)
names(info)
