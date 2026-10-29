# ============================================================
# check-examples.R — hard gate: HTML code/output must equal the
# tools/examples scripts and their expected outputs.
# Docs: docs/05 §7.3, docs/06 §0 (rule 1: no invented output).
# Run: Rscript tools/check-examples.R   (exit 1 on any mismatch)
# ============================================================
fa_ <- grep("^--file=", commandArgs(trailingOnly = FALSE), value = TRUE)
source(file.path(dirname(dirname(normalizePath(sub("^--file=", "", fa_[1]), winslash = "/"))),
                 "tools", "lib", "common.R"))
root <- bioR_setup()
SHOW_MAX <- 10

fails <- 0
fail <- function(...) { fails <<- fails + 1; cat("[FAIL]", ..., "\n") }
okc  <- function(...) cat("[ok]", ..., "\n")

unesc <- function(x) {
  x <- gsub("&lt;", "<", x, fixed = TRUE)
  x <- gsub("&gt;", ">", x, fixed = TRUE)
  x <- gsub("&quot;", "\"", x, fixed = TRUE)
  x <- gsub("&#39;", "'", x, fixed = TRUE)
  gsub("&amp;", "&", x, fixed = TRUE)
}
esc <- function(x) {
  x <- gsub("&", "&amp;", x, fixed = TRUE)
  x <- gsub("<", "&lt;", x, fixed = TRUE)
  gsub(">", "&gt;", x, fixed = TRUE)
}
norm <- function(lines) {
  lines <- sub("[ \t]+$", "", lines)
  while (length(lines) && lines[1] == "") lines <- lines[-1]
  while (length(lines) && lines[length(lines)] == "") lines <- lines[-length(lines)]
  lines
}
first_diff <- function(a, b) {
  n <- max(length(a), length(b))
  for (i in seq_len(n)) {
    x <- if (i <= length(a)) a[i] else "<missing>"
    y <- if (i <= length(b)) b[i] else "<missing>"
    if (x != y) return(sprintf("line %d:\n  html: %s\n  src : %s", i, x, y))
  }
  "length mismatch"
}

# ---- collect HTML references -------------------------------------------
pages <- c(
  list.files(file.path(root, "chapters"), "\\.html$", full.names = TRUE),
  list.files(file.path(root, "templates"), "\\.html$", full.names = TRUE)
)
refs <- list(); codes <- list(); outs <- list()
for (pg in pages) {
  txt <- paste(bioR_read_lines(pg), collapse = "\n")
  for (m in regmatches(txt, gregexpr('<pre class="ex-code" data-example="([^"]+)"><code class="r">[\\s\\S]*?</code></pre>', txt, perl = TRUE))[[1]]) {
    id <- sub('.*data-example="([^"]+)".*', "\\1", m)
    body <- sub('^<pre class="ex-code" data-example="[^"]+"><code class="r">', "", m)
    body <- sub("</code></pre>$", "", body)
    codes[[id]] <- norm(strsplit(unesc(body), "\n", fixed = TRUE)[[1]])
    refs[[id]] <- c(refs[[id]], pg)
  }
  # output blocks keyed off the enclosing ex-output div's data-output-for
  # (works with or without the data-expected attribute on the inner <code>)
  hits <- gregexpr('data-output-for="([^"]+)"', txt)[[1]]
  if (hits[1] != -1) {
    for (i in seq_along(hits)) {
      id <- sub('data-output-for="([^"]+)".*', "\\1", substr(txt, hits[i], hits[i] + 60))
      start <- hits[i]
      end <- if (i < length(hits)) hits[i + 1] else nchar(txt)
      seg <- substr(txt, start, end)
      cm <- regexpr('<pre><code[^>]*>[\\s\\S]*?</code></pre>', seg, perl = TRUE)
      if (cm != -1) {
        body <- regmatches(seg, cm)[[1]]
        body <- sub('^<pre><code[^>]*>', "", body)
        body <- sub("</code></pre>$", "", body)
        outs[[id]] <- norm(strsplit(unesc(body), "\n", fixed = TRUE)[[1]])
      }
    }
  }
}

scripts <- sort(sub("\\.R$", "", list.files(file.path(root, "tools", "examples"), "\\.R$")))

# ---- every script referenced; every reference has a script --------------
orph_s <- setdiff(scripts, names(refs))
orph_h <- setdiff(names(refs), scripts)
if (length(orph_s)) cat("[warn] script not referenced in any page:", paste(orph_s, collapse = ", "), "\n")
if (length(orph_h)) fail("page references missing script:", paste(orph_h, collapse = ", "))

# ---- per-example verification -------------------------------------------
for (id in intersect(scripts, names(refs))) {
  src_lines <- norm(bioR_read_lines(file.path(root, "tools", "examples", paste0(id, ".R"))))

  # 1) HTML code == script
  if (!identical(codes[[id]], src_lines)) {
    fail(id, "CODE mismatch (html vs tools/examples):", first_diff(codes[[id]], src_lines))
    next
  }

  # 2) re-run reproduces expected file (reproducibility)
  res <- bioR_run_example_child(id)
  if (!is.null(res$error)) { fail(id, "script raised:", res$error); next }
  exp_file <- file.path(root, "tools", "examples", "expected", paste0(id, ".txt"))
  if (!file.exists(exp_file)) { fail(id, "missing expected/<id>.txt — run render-examples.R"); next }
  exp_lines <- norm(bioR_read_lines(exp_file))
  if (!identical(norm(res$output), exp_lines)) {
    fail(id, "REPRO mismatch (fresh run vs expected):", first_diff(norm(res$output), exp_lines))
    next
  }

  # 3) HTML output == expected (prefix + truncation marker)
  if (is.null(outs[[id]])) { fail(id, "missing output block in HTML"); next }
  want <- exp_lines
  shown <- if (length(want) > SHOW_MAX) c(want[seq_len(SHOW_MAX)],
    sprintf("# ... (%d more lines; full output: expected/%s.txt)", length(want) - SHOW_MAX, id)) else want
  if (!identical(outs[[id]], norm(shown))) {
    fail(id, "OUTPUT mismatch (html vs expected):", first_diff(outs[[id]], norm(shown)))
    next
  }
  okc(id, sprintf("(%d lines)", length(want)))
}

cat(if (fails == 0) "\ncheck-examples: ALL PASS\n" else sprintf("\ncheck-examples: %d FAILURES\n", fails))
quit(status = if (fails == 0) 0 else 1)
