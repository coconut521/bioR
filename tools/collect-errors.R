# ============================================================
# collect-errors.R — triggers real R errors and records their exact
# text. Chapters and the triage page MUST quote from errors.json;
# writing error text from memory is forbidden (docs/05 §7.4).
# Run: Rscript tools/collect-errors.R
# ============================================================
fa_ <- grep("^--file=", commandArgs(trailingOnly = FALSE), value = TRUE)
source(file.path(dirname(dirname(normalizePath(sub("^--file=", "", fa_[1]), winslash = "/"))),
                 "tools", "lib", "common.R"))
root <- bioR_setup()
suppressPackageStartupMessages({ library(readr); library(dplyr); library(jsonlite) })

dir.create(file.path(root, "tools", "errors"), showWarnings = FALSE)

# ---- error registry: id -> minimal triggering code ----------------------
# Each recipe is a self-contained expression list evaluated in order;
# the LAST expression must raise the error.
RECIPES <- list(
  list(id = "object-not-found", category = "object-function", code = c(
    "library(readr); library(dplyr)",
    'pika <- read_csv(here::here("assets/data/pika_physiology.csv"), show_col_types = FALSE)',
    "mean(body_mass_g)"
  )),
  list(id = "closure-not-subsettable", category = "object-function", code = c(
    "library(dplyr)",
    "mean[1]"
  )),
  list(id = "could-not-find-function", category = "object-function", code = c(
    'ggplot()'
  )),
  list(id = "na-introduced-coercion", category = "type-length", kind = "warning", code = c(
    'as.numeric(c("182.5", "176.0", "low"))'
  )),
  list(id = "non-numeric-argument", category = "type-length", kind = "error", code = c(
    'sum(c("182.5", "176.0"))'
  )),
  list(id = "condition-length-1", category = "type-length", kind = "error", code = c(
    "x <- c(182, 176, 169)",
    'if (x > 180) "high" else "low"'
  )),
  list(id = "no-package-called", category = "package-env", kind = "error", code = c(
    'library(notapackage9x)'
  )),
  list(id = "cannot-open-file", category = "path-encoding", kind = "error", code = c(
    'read_csv("assets/data/does_not_exist.csv")'
  )),
  list(id = "join-by-missing-column", category="data-shape", kind = "error", code = c(
    "library(readr); library(dplyr)",
    'pika <- read_csv(here::here("assets/data/pika_physiology.csv"), show_col_types = FALSE)',
    'left_join(pika, pika, by = "altitude_grp")'
  )),
  list(id = "join-incompatible-type", category = "data-shape", kind = "error", code = c(
    "library(readr); library(dplyr)",
    'pika <- read_csv(here::here("assets/data/pika_physiology.csv"), show_col_types = FALSE)',
    'tibble(id_chr = "P001") |> left_join(pika, by = c("id_chr" = "altitude_m"))'
  )),
  list(id = "contrasts-factor-one-level", category = "factor-model", kind = "error", code = c(
    "library(readr); library(dplyr)",
    'pika <- read_csv(here::here("assets/data/pika_physiology.csv"), show_col_types = FALSE)',
    'pika$sex <- factor("F", levels = "F")',
    "lm(body_mass_g ~ sex, data = pika)"
  )),
  list(id = "undefined-columns-selected", category = "data-shape", kind = "error", code = c(
    "library(readr); library(dplyr)",
    'pika <- read_csv(here::here("assets/data/pika_physiology.csv"), show_col_types = FALSE)',
    'pika |> select(body_mass)'
  )),
  list(id = "replacement-rows", category = "type-length", kind = "error", code = c(
    "df <- data.frame(a = 1:3)",
    'df$b <- c(10, 20)'
  )),
  list(id = "argument-length-zero", category = "type-length", kind = "error", code = c(
    "x <- logical(0)",
    'if (x) "yes" else "no"'
  )),
  list(id = "filter-typo-object", category = "data-shape", kind = "error", code = c(
    "library(readr); library(dplyr)",
    'pika <- read_csv(here::here("assets/data/pika_physiology.csv"), show_col_types = FALSE)',
    'pika |> filter(body_mass >= 110)'
  )),
  list(id = "group-by-case-sensitive", category = "data-shape", kind = "error", code = c(
    "library(readr); library(dplyr)",
    'pika <- read_csv(here::here("assets/data/pika_physiology.csv"), show_col_types = FALSE)',
    'pika |> group_by(Altitude_group)'
  )),
  list(id = "summarise-returns-vector", category = "data-shape", kind = "error", code = c(
    "library(readr); library(dplyr)",
    'pika <- read_csv(here::here("assets/data/pika_physiology.csv"), show_col_types = FALSE)',
    'pika |> group_by(altitude_group) |> summarise(m = body_mass_g)'
  )),
  list(id = "pivot-missing-columns", category = "data-shape", kind = "error", code = c(
    "library(readr); library(tidyr)",
    'counts <- read_csv(here::here("assets/data/pika_rnaseq_counts.csv"), show_col_types = FALSE)',
    'counts |> pivot_longer(cols = -c(gene_id, gene_name, nothere))'
  )),
  list(id = "join-by-unquoted", category = "data-shape", kind = "error", code = c(
    "library(readr); library(dplyr)",
    'pika <- read_csv(here::here("assets/data/pika_physiology.csv"), show_col_types = FALSE)',
    'left_join(pika, pika, by = sample_id)'
  )),
  list(id = "ggplot-mapping-not-aes", category = "plotting", kind = "error", code = c(
    "library(ggplot2)",
    'ggplot(mtcars, mpg)'
  )),
  list(id = "ggplot-missing-y", category = "plotting", kind = "error", code = c(
    "library(ggplot2)",
    'ggplot(mtcars, aes(wt)) + geom_point()'
  )),
  list(id = "ggplot-aes-length", category = "plotting", kind = "error", code = c(
    "library(ggplot2)",
    'ggplot(mtcars, aes(wt, mpg, colour = c("red", "blue"))) + geom_point()'
  )),
  list(id = "continuous-to-discrete-scale", category = "plotting", kind = "error", code = c(
    "library(ggplot2)",
    'ggplot(mtcars, aes(wt, mpg, colour = mpg)) + geom_point() + scale_colour_manual(values = c("red", "blue"))'
  )),
  list(id = "facet-missing-variable", category = "plotting", kind = "error", code = c(
    "library(ggplot2)",
    'ggplot(mtcars, aes(wt, mpg)) + geom_point() + facet_wrap(~nothere)'
  )),
  list(id = "t-test-not-enough-y", category = "modelling", kind = "error", code = c(
    "t.test(1:5, numeric(0))"
  )),
  list(id = "wilcox-x-not-numeric", category = "modelling", kind = "error", code = c(
    'wilcox.test(c("a", "b"), c("c", "d"))'
  )),
  list(id = "shapiro-sample-too-small", category = "modelling", kind = "error", code = c(
    "shapiro.test(c(1, 2))"
  )),
  list(id = "quantile-na-no-rm", category = "modelling", kind = "error", code = c(
    "quantile(c(1, 2, NA), c(.25, .75))"
  )),
  list(id = "glm-y-out-of-range", category = "modelling", kind = "error", code = c(
    'glm(c(1, 2, 1, 2) ~ c(0, 1, 0, 1), family = binomial)'
  )),
  list(id = "lm-zero-non-na", category = "modelling", kind = "error", code = c(
    "x <- c(NA, NA, NA)",
    "y <- c(NA, NA, NA)",
    "lm(y ~ x)"
  )),
  list(id = "tukey-no-factor", category = "modelling", kind = "error", code = c(
    "m <- lm(mpg ~ wt, data = mtcars)",
    "TukeyHSD(m)"
  )),
  list(id = "kruskal-one-group", category = "modelling", kind = "error", code = c(
    'kruskal.test(c(1, 2, 3), g = factor(c("a", "a", "a")))'
  )),
  list(id = "lmer-one-level-group", category = "factor-model", kind = "error", code = c(
    "suppressPackageStartupMessages(library(lme4))",
    'd <- read_csv(here::here("assets/data/pika_repeated.csv"), show_col_types = FALSE)',
    'd$one <- "A"',
    "lmer(body_mass_g ~ treatment + (1 | one), data = d)"
  )),
  list(id = "lmer-no-random-effect", category = "factor-model", kind = "error", code = c(
    "suppressPackageStartupMessages(library(lme4))",
    'd <- read_csv(here::here("assets/data/pika_repeated.csv"), show_col_types = FALSE)',
    "lmer(body_mass_g ~ treatment, data = d)"
  )),
  list(id = "coxph-response-not-surv", category = "modelling", kind = "error", code = c(
    "suppressPackageStartupMessages(library(survival))",
    'd <- read_csv(here::here("assets/data/pika_survival.csv"), show_col_types = FALSE)',
    "coxph(status ~ treatment, data = d)"
  )),
  list(id = "survdiff-one-group", category = "modelling", kind = "error", code = c(
    "suppressPackageStartupMessages(library(survival))",
    'd <- read_csv(here::here("assets/data/pika_survival.csv"), show_col_types = FALSE)',
    'd <- subset(d, treatment == "control")',
    "survdiff(Surv(time_days, status) ~ treatment, data = d)"
  )),
  list(id = "survfit-response-not-surv", category = "modelling", kind = "error", code = c(
    "suppressPackageStartupMessages(library(survival))",
    'd <- read_csv(here::here("assets/data/pika_survival.csv"), show_col_types = FALSE)',
    "survfit(status ~ treatment, data = d)"
  )),
  list(id = "survreg-invalid-times", category = "modelling", kind = "error", code = c(
    "suppressPackageStartupMessages(library(survival))",
    'd <- read_csv(here::here("assets/data/pika_survival.csv"), show_col_types = FALSE)',
    "d$bad <- d$time_days",
    "d$bad[1] <- 0",
    'survreg(Surv(bad, status) ~ treatment, data = d, dist = "weibull")'
  )),
  list(id = "deseq2-not-full-rank", category = "modelling", kind = "error", code = c(
    "suppressPackageStartupMessages(library(DESeq2))",
    'counts <- read_csv(here::here("assets/data/pika_rnaseq_counts.csv"), show_col_types = FALSE) |>\n  tibble::column_to_rownames("gene_id")',
    'meta <- read_csv(here::here("assets/data/pika_rnaseq_metadata_clean.csv"), show_col_types = FALSE)',
    "mat <- as.matrix(counts[, meta$sample_id])",
    "DESeqDataSetFromMatrix(mat, meta, ~ batch + group)"
  )),
  list(id = "log-negative-warning", category = "type-length", kind = "warning", code = c(
    "log(c(1, 0, -1))"
  )),
  list(id = "mean-character-warning", category = "type-length", kind = "warning", code = c(
    'mean(c("182.5", "176.0"))'
  )),
  list(id = "factor-invalid-level-warning", category = "factor-model", kind = "warning", code = c(
    'f <- factor(c("low", "high"))',
    'f[3] <- "mid"'
  )),
  list(id = "str-recycle-error", category = "string", kind = "error", code = c(
    "library(stringr)",
    'str_replace(c("H-5", "H-6"), c("H-", "X-", "Y-"), "H")'
  )),
  list(id = "read-excel-path-missing", category = "path-encoding", kind = "error", code = c(
    "library(readxl)",
    'read_excel("assets/data/does_not_exist.xlsx")'
  )),
  list(id = "write-dir-missing", category = "path-encoding", kind = "error", code = c(
    "library(readr)",
    'write_csv(data.frame(a = 1), "no_such_dir/out.csv")'
  )),
  list(id = "matrix-non-conformable", category = "matrix", kind = "error", code = c(
    "matrix(1:6, nrow = 2) %*% matrix(1:6, nrow = 4)"
  )),
  list(id = "if-na-condition", category = "type-length", kind = "error", code = c(
    "x <- c(1, NA)",
    "if (x[2] > 0) 1 else 0"
  )),
  list(id = "dataframe-differing-rows", category = "data-shape", kind = "error", code = c(
    "data.frame(a = 1:3, b = 1:2)"
  )),
  list(id = "rbind-column-mismatch", category = "data-shape", kind = "error", code = c(
    "rbind(data.frame(a = 1), data.frame(a = 1, b = 2))"
  )),
  list(id = "dollar-on-atomic", category = "object-function", kind = "error", code = c(
    "pika <- c(164.6, 158.1, 156.3)",
    "pika$body_mass"
  ))
)

collect <- function(code_lines, kind = "error") {
  env <- new.env(parent = globalenv())
  exprs <- parse(text = paste(code_lines, collapse = "\n"), keep.source = FALSE)
  err <- NULL
  warn_txt <- NULL
  for (e in exprs) {
    res <- withCallingHandlers(
      tryCatch(
        withVisible(eval(e, env)),
        error = function(cond) {
          err <<- list(message = conditionMessage(cond), call = deparse(conditionCall(cond)))
          NULL
        }
      ),
      warning = function(w) {
        if (kind == "warning" && is.null(warn_txt)) {
          warn_txt <<- list(message = conditionMessage(w), call = deparse(conditionCall(w)))
        }
        invokeRestart("muffleWarning")
      }
    )
    if (!is.null(err)) break
    if (kind == "warning" && !is.null(warn_txt)) break
    if (!is.null(res) && res$visible) {
      # ggplot errors (missing aesthetics, bad scales) surface at PRINT
      # time, not at construction time — catch those as the record.
      pr <- tryCatch({ capture.output(print(res$value)); NULL },
                     error = function(cond) list(message = conditionMessage(cond),
                                                call = deparse(conditionCall(cond))))
      if (!is.null(pr)) {
        err <- pr
        break
      }
    }
  }
  if (kind == "warning") warn_txt else err
}

records <- lapply(RECIPES, function(r) {
  e <- collect(r$code, r$kind %||% "error")
  if (is.null(e)) {
    cat(sprintf("[FAIL] %s did NOT raise the expected %s\n", r$id, r$kind %||% "error")); return(NULL)
  }
  msg <- paste(e$message, collapse = " ")
  cat(sprintf("[ok] %s -> %s\n", r$id, substr(msg, 1, 90)))
  list(id = r$id, category = r$category, kind = r$kind %||% "error",
       message = msg,
       call = if (length(e$call)) e$call[[1]] else "",
       r_version = paste(R.version$major, R.version$minor, sep = "."),
       minimal = paste(r$code, collapse = "\n"))
})
records <- records[!vapply(records, is.null, logical(1))]

write(toJSON(records, pretty = TRUE, auto_unbox = TRUE, na = "null"),
      file.path(root, "tools", "errors", "errors.json"))
cat("collect-errors: wrote", length(records), "error records\n")
