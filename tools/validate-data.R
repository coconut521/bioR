# ============================================================
# validate-data.R — hard gate for the teaching datasets.
# Docs: docs/05 §5.3. Exit code 1 on any failure.
# Run: Rscript tools/validate-data.R
# ============================================================
fa_ <- grep("^--file=", commandArgs(trailingOnly = FALSE), value = TRUE)
source(file.path(dirname(dirname(normalizePath(sub("^--file=", "", fa_[1]), winslash = "/"))),
                 "tools", "lib", "common.R"))
root <- bioR_setup()
suppressPackageStartupMessages({
  library(readr); library(dplyr); library(jsonlite); library(digest)
})

fails <- 0
check <- function(label, ok, detail = "") {
  status <- if (isTRUE(ok)) "PASS" else "FAIL"
  if (!isTRUE(ok)) fails <<- fails + 1
  cat(sprintf("[%s] %s %s\n", status, label, detail))
}
dat <- function(f) file.path(root, "assets", "data", f)

# ---- physiology ----
p <- read_csv(dat("pika_physiology.csv"), show_col_types = FALSE)
check("physiology dims 60 x 11", nrow(p) == 60 && ncol(p) == 11, sprintf("(%d x %d)", nrow(p), ncol(p)))
check("physiology id unique", !any(duplicated(p$id)))
cells <- p |> count(altitude_group, sex) |> pull(n)
check("physiology design 3x2x10", length(cells) == 6 && all(cells == 10))
check("physiology hemoglobin = 2 NA", sum(is.na(p$hemoglobin_g_l)) == 2)
check("physiology mass range", all(p$body_mass_g >= 110 & p$body_mass_g <= 240))
check("physiology hb range", all(p$hemoglobin_g_l >= 100 & p$hemoglobin_g_l <= 260, na.rm = TRUE))
check("physiology glucose range", all(p$glucose_mmol_l >= 3 & p$glucose_mmol_l <= 13))
check("physiology hematocrit range", all(p$hematocrit_pct >= 30 & p$hematocrit_pct <= 65))
check("physiology altitude group values", setequal(unique(p$altitude_group), c("low", "mid", "high")))
check("physiology planted extremes", p$body_mass_g[p$id == "P023"] == 232 && p$body_mass_g[p$id == "P048"] == 118)
check("physiology batch balanced", all(p |> count(batch) |> pull(n) == 20))

# ---- repeated ----
r <- read_csv(dat("pika_repeated.csv"), show_col_types = FALSE)
check("repeated dims 36 x 6", nrow(r) == 36 && ncol(r) == 6)
check("repeated 3 visits per id", all(r |> count(id) |> pull(n) == 3))
check("repeated treatments 6/6", all(r |> distinct(id, treatment) |> count(treatment) |> pull(n) == 6))
check("repeated no missing", !any(is.na(r)))
# ICC plausibility: between-id variance of mass > 0 and within-id variance exists
icc_chk <- r |> group_by(id) |> summarise(m = mean(body_mass_g)) |> pull(m)
check("repeated between-id variance present", var(icc_chk) > 20, sprintf("var=%.1f", var(icc_chk)))

# ---- survival ----
s <- read_csv(dat("pika_survival.csv"), show_col_types = FALSE)
check("survival dims 60 x 6", nrow(s) == 60 && ncol(s) == 6)
check("survival status in {0,1}", all(s$status %in% c(0, 1)))
check("survival time > 0", all(s$time_days > 0))
check("survival censor >= 20%", mean(s$status == 0) >= 0.20, sprintf("%.1f%%", 100 * mean(s$status == 0)))
check("survival treatments 30/30", all(s |> count(treatment) |> pull(n) == 30))

# ---- RNA-seq ----
c_mat <- read_csv(dat("pika_rnaseq_counts.csv"), show_col_types = FALSE)
check("counts dims 2000 x 14", nrow(c_mat) == 2000 && ncol(c_mat) == 14)
m <- as.matrix(c_mat[, -(1:2)])
check("counts non-negative integers", all(m == round(m)) && min(m) >= 0)
check("counts gene_id unique", !any(duplicated(c_mat$gene_id)))
# trim_ws = FALSE is essential: the planted " C3" mismatch must survive import
meta_raw <- read_csv(dat("pika_rnaseq_metadata_raw.csv"), show_col_types = FALSE,
                     col_types = "ccccc", trim_ws = FALSE)
meta_clean <- read_csv(dat("pika_rnaseq_metadata_clean.csv"), show_col_types = FALSE)
check("metadata dims 12 x 5", nrow(meta_raw) == 12 && nrow(meta_clean) == 12)
mismatch <- setdiff(meta_raw$sample_id, colnames(m))
check("raw metadata has 3 planted mismatches", length(mismatch) == 3,
      paste0("(", paste(mismatch, collapse = ", "), ")"))
check("clean metadata matches counts columns", identical(meta_clean$sample_id, colnames(m)))
check("clean library_size = colSums", all(abs(meta_clean$library_size - colSums(m)) < 1))

# ---- annotation ----
a <- read_csv(dat("pika_annotation.csv"), show_col_types = FALSE)
check("annotation dims 2000 x 5", nrow(a) == 2000 && ncol(a) == 5)
check("annotation gene ids match counts", identical(a$gene_id, c_mat$gene_id))

# ---- plate reader ----
pl <- bioR_read_lines(dat("plate_reader_raw.csv"))
check("plate reader 3 comment lines", all(startsWith(pl[1:3], "#")))
pl_d <- read_csv(dat("plate_reader_raw.csv"), skip = 3, show_col_types = FALSE)
check("plate reader 96 rows x 4 cols", nrow(pl_d) == 96 && ncol(pl_d) == 4)

# ---- xlsx ----
xl_file <- dat("pika_lab_notebook.xlsx")
check("notebook xlsx exists", file.exists(xl_file))
sheets <- tryCatch(names(readxl::read_excel(xl_file, sheet = 1)), error = function(e) NULL)
check("notebook sheets readable", !is.null(sheets))

# ---- manifest ----
man_file <- dat("data-manifest.json")
check("manifest exists", file.exists(man_file))
man <- fromJSON(man_file, simplifyVector = FALSE)
ok_sha <- all(vapply(man$files, function(f) {
  pth <- dat(f$file)
  file.exists(pth) && digest(pth, algo = "sha256", file = TRUE) == f$sha256
}, logical(1)))
check("manifest sha256 matches files", ok_sha)
ok_rows <- all(vapply(man$files, function(f) {
  if (grepl("xlsx", f$file)) return(TRUE)
  n <- length(bioR_read_lines(dat(f$file))) - 1
  if (f$file == "plate_reader_raw.csv") n <- n - 3
  as.integer(f$rows) == n
}, logical(1)))
check("manifest rows match files", ok_rows)

cat(if (fails == 0) "\nvalidate-data: ALL PASS\n" else sprintf("\nvalidate-data: %d FAILURES\n", fails))
quit(status = if (fails == 0) 0 else 1)
