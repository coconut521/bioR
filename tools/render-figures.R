# ============================================================
# render-figures.R — renders every registered figure to SVG + PDF
# and writes assets/figures/manifest.json (with sha256).
# Docs: docs/05 §6. Run: Rscript tools/render-figures.R
# ============================================================
fa_ <- grep("^--file=", commandArgs(trailingOnly = FALSE), value = TRUE)
source(file.path(dirname(dirname(normalizePath(sub("^--file=", "", fa_[1]), winslash = "/"))),
                 "tools", "lib", "common.R"))
root <- bioR_setup()
suppressPackageStartupMessages({
  library(ggplot2); library(readr); library(svglite); library(jsonlite); library(digest)
})
source(file.path(root, "tools", "figures", "palettes.R"), encoding = "UTF-8")
source(file.path(root, "tools", "figures", "theme.R"), encoding = "UTF-8")
source(file.path(root, "tools", "figures", "registry.R"), encoding = "UTF-8")

fig_dir <- file.path(root, "assets", "figures", "chapters")
dir.create(fig_dir, showWarnings = FALSE, recursive = TRUE)

# load every teaching dataset once; figure scripts address data[["<file>"]]
load_data <- function(names) {
  out <- list()
  for (f in names) {
    p <- file.path(root, "assets", "data", f)
    if (f == "plate_reader_raw.csv") {
      out[[f]] <- read_csv(p, skip = 3, show_col_types = FALSE)
    } else {
      out[[f]] <- read_csv(p, show_col_types = FALSE)
    }
  }
  out
}

entries <- lapply(FIGURES, function(spec) {
  fig_env <- new.env(parent = globalenv())
  script <- file.path(root, "tools", "figures", spec$script)
  source(script, local = fig_env)
  data <- load_data(unique(spec$data))
  g <- fig_env$build_figure(data)
  stopifnot(inherits(g, "ggplot"))

  svg <- file.path(fig_dir, paste0(spec$id, ".svg"))
  pdf <- file.path(fig_dir, paste0(spec$id, ".pdf"))
  svglite::svglite(svg, width = spec$width_mm / 25.4, height = spec$height_mm / 25.4,
                   bg = "white", pointsize = 8)
  print(g); dev.off()
  grDevices::cairo_pdf(pdf, width = spec$width_mm / 25.4, height = spec$height_mm / 25.4,
                       family = "sans")
  print(g); dev.off()

  cat(sprintf("[ok] %s (%.0fx%.0f mm)\n", spec$id, spec$width_mm, spec$height_mm))
  list(
    id = spec$id, chapter = spec$chapter,
    svg = paste0("assets/figures/chapters/", spec$id, ".svg"),
    pdf = paste0("assets/figures/chapters/", spec$id, ".pdf"),
    width_mm = spec$width_mm, height_mm = spec$height_mm,
    alt = spec$alt, caption = spec$caption,
    source = paste0("tools/figures/", spec$script),
    data = spec$data,
    sha256 = digest(svg, algo = "sha256", file = TRUE)
  )
})

manifest <- list(
  generated = format(Sys.time(), "%Y-%m-%dT%H:%M:%SZ", tz = "UTC"),
  figures = entries
)
write(toJSON(manifest, pretty = TRUE, auto_unbox = TRUE),
      file.path(root, "assets", "figures", "manifest.json"))
cat("render-figures: rendered", length(entries), "figure(s); manifest written\n")
