# ============================================================
# render-examples.R — runs every tools/examples/<id>.R in a clean
# child session, captures console output, writes expected/<id>.txt,
# and injects the (possibly truncated) output into the HTML pages
# that reference the id via the __EXPECTED_<id>__ placeholder.
# Docs: docs/05 §7. Run: Rscript tools/render-examples.R
# ============================================================
fa_ <- grep("^--file=", commandArgs(trailingOnly = FALSE), value = TRUE)
source(file.path(dirname(dirname(normalizePath(sub("^--file=", "", fa_[1]), winslash = "/"))),
                 "tools", "lib", "common.R"))
root <- bioR_setup()
suppressPackageStartupMessages({ library(jsonlite) })

ex_dir  <- file.path(root, "tools", "examples")
exp_dir <- file.path(ex_dir, "expected")
dir.create(exp_dir, showWarnings = FALSE)
SHOW_MAX <- 10  # docs/06 §2.2: truncate long output to 10 lines

html_pages <- list.files(file.path(root, "chapters"), "\\.html$", full.names = TRUE)
html_pages <- c(html_pages, list.files(file.path(root, "templates"), "\\.html$", full.names = TRUE))

# ---- extract all (id, page) references from HTML ------------------------
refs <- list()  # id -> vector of page paths
for (pg in html_pages) {
  txt <- paste(bioR_read_lines(pg), collapse = "\n")
  for (m in regmatches(txt, gregexpr('data-example="([^"]+)"', txt))[[1]]) {
    id <- sub('.*data-example="([^"]+)".*', "\\1", m)
    refs[[id]] <- c(refs[[id]], pg)
  }
}

scripts <- sort(list.files(ex_dir, "\\.R$"))
ids <- sub("\\.R$", "", scripts)
cat("scripts:", length(ids), " html refs:", length(refs), "\n")

orphans_scripts <- setdiff(ids, names(refs))
orphans_html <- setdiff(names(refs), ids)
if (length(orphans_scripts)) cat("[warn] script not referenced in HTML:", paste(orphans_scripts, collapse = ", "), "\n")
if (length(orphans_html)) stop("HTML data-example without script: ", paste(orphans_html, collapse = ", "))

escape_html <- function(x) {
  x <- gsub("&", "&amp;", x, fixed = TRUE)
  x <- gsub("<", "&lt;", x, fixed = TRUE)
  x <- gsub(">", "&gt;", x, fixed = TRUE)
  x
}

for (i in seq_along(ids)) {
  id <- ids[i]
  res <- bioR_run_example_child(id)
  if (!is.null(res$error)) stop(sprintf("example %s raised: %s", id, res$error))
  out <- res$output
  bioR_write_lines(out, file.path(exp_dir, paste0(id, ".txt")))

  shown <- out
  if (length(out) > SHOW_MAX) {
    # ASCII-only marker: R-generated CJK strings are encoding-fragile on Windows
    shown <- c(out[seq_len(SHOW_MAX)],
               sprintf("# ... (%d more lines; full output: expected/%s.txt)",
                       length(out) - SHOW_MAX, id))
  }
  replacement <- escape_html(shown)
  marker <- paste0("__EXPECTED_", id, "__")
  block <- paste(replacement, collapse = "\n")
  open_tag  <- paste0('<pre><code class="output-text" data-expected="', id, '">')
  close_tag <- "</code></pre>"

  for (pg in refs[[id]]) {
    txt <- paste(bioR_read_lines(pg), collapse = "\n")
    changed <- FALSE
    if (grepl(marker, txt, fixed = TRUE)) {
      # fresh page: token-level replace (gsub replacement would mangle backslashes)
      pieces <- strsplit(txt, marker, fixed = TRUE)[[1]]
      txt <- paste(pieces[1], block, paste(pieces[-1], collapse = block), sep = "")
      changed <- TRUE
    }
    # idempotent refresh of an already-injected block: find the output <code>
    # that follows THIS id's data-output-for attribute and rewrite its content
    anchor <- paste0('data-output-for="', id, '"')
    hit <- gregexpr(anchor, txt, fixed = TRUE)[[1]]
    if (hit[1] != -1) {
      # operate on the LAST occurrence segment belonging to this example
      seg_start <- hit[length(hit)]
      code_open <- gregexpr('<pre><code[^>]*>', substr(txt, seg_start, nchar(txt)), perl = TRUE)[[1]]
      if (code_open[1] != -1) {
        abs_open <- seg_start + code_open[1] - 1
        open_txt <- substr(txt, abs_open, abs_open + attr(code_open, "match.length") - 1)
        rest_start <- abs_open + nchar(open_txt)
        close_hit <- regexpr('</code></pre>', substr(txt, rest_start, nchar(txt)), fixed = TRUE)
        if (close_hit != -1) {
          rest_end <- rest_start + close_hit - 1
          txt <- paste0(substr(txt, 1, abs_open - 1), open_txt, block,
                        substr(txt, rest_end, nchar(txt)))
          changed <- TRUE
        }
      }
    }
    if (changed) {
      con <- file(pg, open = "wb")
      writeLines(txt, con, useBytes = TRUE)
      close(con)
    }
  }
  cat(sprintf("[ok] %s (%d lines)\n", id, length(out)))
}

# refresh search index meta later; nothing else needed here
cat("render-examples: done\n")
