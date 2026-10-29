# ============================================================
# common.R — shared helpers for the bioR build pipeline.
# Sourced (not installed). Resolves bioR root from the calling script
# location, sets the project library, fixes print options.
# ============================================================

bioR_root <- function() {
  args <- commandArgs(trailingOnly = FALSE)
  fa <- grep("^--file=", args, value = TRUE)
  if (length(fa)) {
    script <- normalizePath(sub("^--file=", "", fa[1]), winslash = "/")
    d <- dirname(script)
    # tools/*.R or tools/figures/*.R or tools/lib/*.R -> root is 1-2 levels up
    while (!file.exists(file.path(d, "assets")) && d != dirname(d)) d <- dirname(d)
    return(d)
  }
  getwd()
}

bioR_lib <- function(root) file.path(root, "tools", "rlib")

bioR_setup <- function() {
  root <- bioR_root()
  .libPaths(c(bioR_lib(root), .libPaths()))
  setwd(root)
  # force UTF-8 so tibble/cli print real glyphs (x, ──) like RStudio does;
  # Git Bash exports LC_CTYPE=C.UTF-8 which Windows R cannot map directly
  try(Sys.setlocale("LC_CTYPE", ".UTF-8"), silent = TRUE)
  options(
    width = 80, tibble.print_max = 10, tibble.print_min = 10,
    tibble.width = 80, pillar.min_title_chars = Inf,
    cli.unicode = TRUE,
    stringsAsFactors = FALSE, scipen = 1
  )
  root
}

# ---- capture console-style output of a script file ---------------------
# Emulates an interactive session: top-level VISIBLE values auto-print
# (withVisible() preserves invisible semantics: library()/assignments
# print nothing), and messages / warnings are captured into the stream.
# Environment noise is filtered (docs/05 §7.2 normalization):
#   - "built under R version" warnings are binary-package artifacts
#   - package-attach messages are visible live in RStudio but omitted
#     here so teaching outputs show the analytic result only
bioR_eval_capture <- function(script_path, env = new.env(parent = globalenv())) {
  out <- character(0)
  err <- NULL
  exprs <- parse(script_path, keep.source = FALSE)
  for (e in exprs) {
    val <- withCallingHandlers(
      tryCatch(withVisible(eval(e, env)), error = function(cond) {
        err <<- paste0("Error: ", conditionMessage(cond))
        NULL
      }),
      message = function(m) {
        txt <- conditionMessage(m)
        noise <- grepl("Attaching package", txt, fixed = TRUE) ||
          grepl("masked from 'package:", txt, fixed = TRUE) ||
          grepl("masked  by  ", txt, fixed = TRUE)
        if (!noise) {
          out <<- c(out, strsplit(sub("\n$", "", txt), "\n", fixed = TRUE)[[1]])
        }
        invokeRestart("muffleMessage")
      },
      warning = function(w) {
        txt <- conditionMessage(w)
        if (!grepl("built under R version", txt, fixed = TRUE)) {
          out <<- c(out, strsplit(paste0("Warning message: ", txt),
                                  "\n", fixed = TRUE)[[1]])
        }
        invokeRestart("muffleWarning")
      }
    )
    if (!is.null(err)) break
    if (!is.null(val) && val$visible) out <- c(out, capture.output(print(val$value)))
  }
  list(output = out, error = err)
}

# ---- run one example in an isolated child R session -------------------
# Each example must behave exactly as it would in a student's fresh
# session: attached packages and objects from earlier examples must not
# leak in (MASS::select vs dplyr::select is the classic collision).
bioR_run_example_child <- function(id, rscript = file.path(R.home("bin"), "Rscript")) {
  runner <- file.path(bioR_root(), "tools", "run-example.R")
  out <- suppressWarnings(system2(
    rscript,
    c("--vanilla", shQuote(runner), shQuote(id)),
    stdout = TRUE, stderr = TRUE
  ))
  status <- attr(out, "status")
  if (is.null(status)) status <- 0L
  err_line <- grep("^__BIOR_ERROR__ ", out, value = TRUE)
  out <- out[!grepl("^__BIOR_ERROR__ ", out)]
  # Rscript startup noise on Windows (LC_CTYPE=C.UTF-8 cannot be mapped);
  # bioR_setup already sets .UTF-8 inside the child.
  out <- out[!grepl("^During startup - Warning message:", out)]
  out <- out[!grepl("^Setting LC_CTYPE=C\\.UTF-8 failed", out)]
  err <- if (length(err_line)) sub("^__BIOR_ERROR__ ", "", err_line[1]) else NULL
  if (is.null(err) && status != 0L) {
    err <- paste0("child process exited with status ", status)
  }
  list(output = out, error = err, status = status)
}

# ---- normalization for comparison (docs/05 §7.3) -----------------------
bioR_normalize <- function(lines) {
  lines <- gsub("\r\n", "\n", lines, fixed = TRUE)
  lines <- sub("[ \t]+$", "", lines)
  lines <- lines[lines != ""]          # drop blank lines
  lines
}

bioR_read_lines <- function(path) {
  lines <- readLines(path, warn = FALSE, encoding = "UTF-8")
  sub("\r$", "", lines)  # strip CR left by CRLF files read in binary contexts
}

# write LF-only file regardless of platform (expected outputs, manifests)
bioR_write_lines <- function(lines, path) {
  con <- file(path, open = "wb")
  writeLines(lines, con, sep = "\n", useBytes = TRUE)
  close(con)
}
