# ============================================================
# run-example.R — execute ONE tools/examples/<id>.R in a fresh
# child session and print its captured console output. Used by
# render-examples.R / check-examples.R so examples cannot leak
# attached packages or objects into each other.
# Usage: Rscript tools/run-example.R <example-id>
# ============================================================

fa_ <- grep("^--file=", commandArgs(trailingOnly = FALSE), value = TRUE)
source(file.path(dirname(dirname(normalizePath(sub("^--file=", "", fa_[1]),
                                               winslash = "/"))),
                 "tools", "lib", "common.R"))
root <- bioR_setup()
args <- commandArgs(trailingOnly = TRUE)
if (!length(args)) stop("usage: run-example.R <example-id>")
id <- sub("\\.R$", "", args[1])
res <- bioR_eval_capture(file.path(root, "tools", "examples", paste0(id, ".R")))
if (length(res$output)) cat(paste0(res$output, "\n"), sep = "")
if (!is.null(res$error)) cat("__BIOR_ERROR__ ", res$error, "\n", sep = "")
